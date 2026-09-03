import React, { useState, useEffect, useRef } from 'react';
import { 
  Navigation, AlertTriangle, ShieldCheck, Truck, Car, 
  ArrowUpRight, ArrowLeft, ArrowRight, CornerUpRight, CornerUpLeft,
  Volume2, VolumeX, Shield, AlertOctagon, Gauge, Mountain, 
  Fuel, Thermometer, Clock, Sparkles, RefreshCw, Play, Pause, 
  MapPin, CheckCircle, Radio, Camera, Send, Layers, Compass,
  User, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatElevation, formatDistance, formatDuration, formatSpeed } from '../utils/formatters';
import { NER_TOPOLOGY_LOCATIONS } from '../data/mockMasterData';
import { DEMO_USERS } from './AuthModal';

// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Driver HUD Map Controller to dynamically center & fit route polylines
function DriverMapFollower({ polylineCoords, currentCoord }) {
  const map = useMap();

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        map.invalidateSize();
      } catch (e) {}
    }, 120);
    return () => clearTimeout(timer);
  }, [map]);

  useEffect(() => {
    if (polylineCoords && polylineCoords.length >= 2) {
      try {
        const bounds = L.latLngBounds(polylineCoords);
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      } catch (e) {
        if (currentCoord && currentCoord.length === 2 && !isNaN(currentCoord[0])) {
          map.setView(currentCoord, 10);
        }
      }
    } else if (currentCoord && currentCoord.length === 2 && !isNaN(currentCoord[0])) {
      map.setView(currentCoord, 10);
    }
  }, [polylineCoords?.length, currentCoord?.[0], currentCoord?.[1], map]);

  return null;
}

// Custom Icons for In-Cabin Driver GPS
const createDriverVehicleIcon = (type, heading = 0) => {
  const is4x4 = type === 'OFFROAD_4X4';
  const color = is4x4 ? '#f59e0b' : '#06b6d4';
  const ringColor = is4x4 ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.4)';

  return L.divIcon({
    className: 'custom-driver-vehicle-marker',
    html: `
      <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: -4px; border-radius: 9999px; background: ${ringColor}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 36px; height: 36px; border-radius: 9999px; background: #030712; border: 2.5px solid ${color}; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px ${color}; transform: rotate(${heading}deg); transition: transform 0.3s ease;">
          <div style="color: ${color}; font-size: 16px; font-weight: bold;">
            ${is4x4 ? '🚙' : '🚛'}
          </div>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22]
  });
};

const createHazardIcon = (severity) => {
  const isCritical = severity === 'CRITICAL';
  return L.divIcon({
    className: 'driver-hazard-marker',
    html: `
      <div style="position: relative; width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; inset: 0; border-radius: 9999px; background: rgba(244, 63, 94, 0.35); animation: ping 1.2s infinite;"></div>
        <div style="width: 28px; height: 28px; border-radius: 9999px; background: #881337; border: 2px solid #fb7185; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px rgba(244,63,94,0.8); font-size: 13px;">
          ⚠️
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 17]
  });
};

export default function DriverNavigationHUD({
  currentUser,
  fleetVehicles = [],
  activeIncidents = [],
  plannedRoute,
  onQuickRoutePlan,
  onIncidentAdded,
  onSwitchUser
}) {
  const driverUsers = DEMO_USERS.filter(u => u.role === 'ROLE_FIELD_DRIVER');

  // Match driver's assigned vehicle
  const myVehicle = fleetVehicles.find(v => v.vehicleId === currentUser?.assignedVehicleId) ||
                    fleetVehicles.find(v => v.driverName?.toLowerCase().includes(currentUser?.name?.split(' ')[0]?.toLowerCase())) ||
                    fleetVehicles[0];

  // Navigation simulation state
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeedKmh, setSimSpeedKmh] = useState(48);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [mapLayer, setMapLayer] = useState('roadmap'); // 'roadmap', 'terrain', 'satellite'

  // Incident reporting modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportHazardType, setReportHazardType] = useState('LANDSLIDE');
  const [reportDescription, setReportDescription] = useState('Mudslide blocking both lanes on mountain curve. Mud depth approx 1.2m.');
  const [reportSeverity, setReportSeverity] = useState('CRITICAL');
  const [reportPassable4x4, setReportPassable4x4] = useState(false);
  const [reportSubmittedBanner, setReportSubmittedBanner] = useState(null);

  // SOS state
  const [sosActive, setSosActive] = useState(false);

  // Dynamic Reroute Alert Banner State
  const [detourAlert, setDetourAlert] = useState(null);

  const polylineCoords = plannedRoute?.segments?.flatMap(s => s.polyline) || [];
  const currentCoord = polylineCoords[navStepIndex] || [myVehicle?.lat || 26.1445, myVehicle?.lng || 91.7362];

  // Inclinometer calculation based on position along elevation profile
  const progressPercent = polylineCoords.length > 1 ? Math.min(100, Math.round((navStepIndex / (polylineCoords.length - 1)) * 100)) : 0;
  const currentAltitude = Math.round(180 + Math.sin(navStepIndex * 0.4) * 450 + (navStepIndex * 8));
  const currentGrade = Number((3.2 + Math.cos(navStepIndex * 0.5) * 4.5).toFixed(1));

  // Voice Synthesizer Helper
  const speakInstruction = (text) => {
    if (!voiceEnabled || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS synthesis error:", e);
    }
  };

  // Generate turn maneuver based on upcoming waypoint
  const getUpcomingManeuver = () => {
    const isDetourActive = plannedRoute?.name?.toLowerCase().includes('dawki') || plannedRoute?.name?.toLowerCase().includes('detour') || plannedRoute?.name?.toLowerCase().includes('bypass');

    if (isDetourActive) {
      return {
        icon: <CornerUpRight className="w-8 h-8 text-amber-400" />,
        action: "BEAR RIGHT ONTO NH-206 DAWKI BYPASS",
        subtext: "Official BRO Disaster Detour • Sonapur Tunnel Blocked Ahead",
        distanceKm: "1.4 km",
        badge: "AI DYNAMIC DETOUR ACTIVE"
      };
    }

    if (progressPercent < 30) {
      return {
        icon: <ArrowUpRight className="w-8 h-8 text-cyan-400" />,
        action: "CONTINUE ON NH-6 TRUNK TOWARDS JOWAI",
        subtext: "Maintain 45 km/h • Road Clear & Certified by BRO",
        distanceKm: "8.5 km",
        badge: "PRIMARY HIGHWAY"
      };
    } else if (progressPercent < 70) {
      return {
        icon: <CornerUpLeft className="w-8 h-8 text-teal-400" />,
        action: "APPROACHING KHLIEHRIAT MOUNTAIN RIDGE",
        subtext: "Caution: Heavy Fog & Wet Asphalt • Incline +5.8%",
        distanceKm: "3.2 km",
        badge: "ELEVATION CLIMB"
      };
    } else {
      return {
        icon: <ArrowUpRight className="w-8 h-8 text-emerald-400" />,
        action: "DESCEND INTO BARAK VALLEY ➔ SILCHAR TERMINAL",
        subtext: "Final 18 km Approach • Speed Limit 50 km/h",
        distanceKm: "18.0 km",
        badge: "FINAL APPROACH"
      };
    }
  };

  const maneuver = getUpcomingManeuver();

  // 0. Auto-sync active driver vehicle route on mount or switch
  useEffect(() => {
    if (myVehicle && onQuickRoutePlan) {
      const mode = myVehicle.type === 'CARGO_DRONE' ? 'DRONE' : myVehicle.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
      onQuickRoutePlan(myVehicle.origin, myVehicle.destination, mode, currentUser, activeIncidents);
    }
  }, [myVehicle?.vehicleId, currentUser?.username]);

  // 1. Live Step Progress Simulation Loop
  useEffect(() => {
    if (!isSimulating || polylineCoords.length === 0) return;

    const interval = setInterval(() => {
      setNavStepIndex(prev => {
        const next = (prev + 1) % polylineCoords.length;
        setSimSpeedKmh(Math.max(35, Math.min(65, Math.round(48 + Math.random() * 8 - 4))));
        return next;
      });
    }, 900);

    return () => clearInterval(interval);
  }, [isSimulating, polylineCoords.length]);

  // 2. Real-Time Autonomous Hazard Detection & Reroute Trigger
  useEffect(() => {
    if (polylineCoords.length === 0) return;

    // Check if any active verified incident is within proximity of the convoy's upcoming path
    const verifiedObstacles = activeIncidents.filter(inc => inc.verified && inc.status !== 'OFFICIAL_CLEARED');
    
    if (verifiedObstacles.length > 0) {
      const obstacleAhead = verifiedObstacles[0];
      const isAlreadyDetoured = plannedRoute?.name?.toLowerCase().includes('dawki') || 
                                plannedRoute?.name?.toLowerCase().includes('bypass') ||
                                plannedRoute?.name?.toLowerCase().includes('detour');

      if (!isAlreadyDetoured) {
        setDetourAlert({
          title: `ROADBLOCK DETECTED: ${obstacleAhead.landmark || obstacleAhead.roadName}`,
          description: "AI Real-Time Dynamic Rerouting Engine engaged. Calculating safest detour around landslide...",
          savedTime: "Saved 4.5 Hours of Bottleneck Delay"
        });

        speakInstruction(`Hazard ahead on highway. Rerouting via official mountain bypass.`);

        // Trigger dynamic reroute on the fly
        if (onQuickRoutePlan && myVehicle) {
          const mode = myVehicle.type === 'CARGO_DRONE' ? 'DRONE' : myVehicle.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
          onQuickRoutePlan(myVehicle.origin, myVehicle.destination, mode, currentUser, activeIncidents);
        }

        setTimeout(() => {
          setDetourAlert(null);
        }, 8000);
      }
    }
  }, [activeIncidents, plannedRoute?.name]);

  // Handle Driver SOS
  const handleTriggerSos = () => {
    setSosActive(true);
    speakInstruction("Emergency S.O.S. broadcast transmitted to Border Roads Task Force.");
    setTimeout(() => setSosActive(false), 6000);
  };

  // Handle Quick Hazard Submission by Driver
  const handleSubmitHazard = (e) => {
    e.preventDefault();
    const newInc = {
      id: `INC-DRIVER-${Date.now().toString().slice(-4)}`,
      hazardType: reportHazardType,
      roadName: `NH-${myVehicle.origin === 'Guwahati' ? '6' : '13'} Mountain Corridor`,
      landmark: `Mile Marker KM-${Math.round(navStepIndex * 3.5)} near ${currentUser.name}'s Convoy`,
      lat: Number(currentCoord[0].toFixed(4)),
      lng: Number(currentCoord[1].toFixed(4)),
      severity: reportSeverity,
      reportedBy: `${currentUser.name} (${myVehicle.vehicleId})`,
      timestamp: new Date().toLocaleTimeString(),
      status: 'PENDING_VERIFICATION',
      verified: false,
      clearancePercent: 0,
      passableBy4x4: reportPassable4x4,
      description: reportDescription
    };

    if (onIncidentAdded) {
      onIncidentAdded(newInc);
    }

    setIsReportModalOpen(false);
    setReportSubmittedBanner({
      message: `✓ Roadblock reported at Lat: ${newInc.lat}, Lng: ${newInc.lng}. AI immediately recalculated your tactical detour!`
    });

    speakInstruction("Hazard reported. AI detour recalculating immediately.");

    setTimeout(() => {
      setReportSubmittedBanner(null);
    }, 6000);
  };

  return (
    <div className="w-full flex flex-col space-y-3 font-sans select-none animate-fadeIn">
      {/* 1. TOP IN-CABIN TURN-BY-TURN GUIDANCE BANNER */}
      <div className="liquid-glass rounded-3xl p-4 shadow-2xl border border-cyan-400/50 bg-[#080d1ef0] backdrop-blur-2xl relative overflow-hidden">
        {/* Glow ambient background line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-500"></div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Maneuver & Distance Pod */}
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-zinc-950/90 border border-white/[0.15] flex items-center justify-center shadow-2xl ring-1 ring-cyan-400/40">
              {maneuver.icon}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl sm:text-2xl font-black text-white tracking-tight font-mono">
                  {maneuver.distanceKm}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                  maneuver.badge.includes('DETOUR') 
                    ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                    : 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                }`}>
                  {maneuver.badge}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                {maneuver.action}
              </h2>
              <p className="text-xs text-zinc-400">
                {maneuver.subtext}
              </p>
            </div>
          </div>

          {/* Quick HUD Actions & Shift Switcher */}
          <div className="flex items-center space-x-2">
            {/* Driver Persona Shift Dropdown */}
            <div className="bg-zinc-950/90 px-3 py-1.5 rounded-2xl border border-white/[0.1] flex items-center space-x-2 text-xs">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[11px] text-zinc-400 font-semibold hidden sm:inline">Pilot:</span>
              <select
                value={currentUser.username}
                onChange={(e) => {
                  const found = DEMO_USERS.find(u => u.username === e.target.value);
                  if (found && onSwitchUser) onSwitchUser(found);
                }}
                className="bg-transparent text-emerald-300 font-bold text-xs focus:outline-none cursor-pointer font-mono"
              >
                {driverUsers.map(d => (
                  <option key={d.username} value={d.username} className="bg-zinc-900 text-white">
                    {d.name} ({d.assignedVehicleId})
                  </option>
                ))}
              </select>
            </div>

            {/* Voice TTS Toggle */}
            <button
              onClick={() => {
                const next = !voiceEnabled;
                setVoiceEnabled(next);
                if (next) speakInstruction("Voice guidance activated.");
              }}
              className={`p-2.5 rounded-2xl border transition active:scale-95 ${
                voiceEnabled 
                  ? 'bg-cyan-600/30 text-cyan-300 border-cyan-400/50 shadow-md shadow-cyan-500/20' 
                  : 'bg-zinc-900 text-zinc-500 border-white/[0.08]'
              }`}
              title={voiceEnabled ? "Voice Navigation Prompts Enabled" : "Voice Navigation Muted"}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Simulation Play/Pause */}
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`p-2.5 rounded-2xl border transition active:scale-95 ${
                isSimulating 
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-400/50' 
                  : 'bg-zinc-900 text-zinc-400 border-white/[0.08]'
              }`}
              title={isSimulating ? "Pause GPS Movement" : "Resume GPS Movement"}
            >
              {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Instant Detour Recalculate */}
            <button
              onClick={() => {
                if (onQuickRoutePlan && myVehicle) {
                  const orig = myVehicle.origin || 'Guwahati';
                  const dest = myVehicle.destination || 'Silchar';
                  const mode = myVehicle.type === 'CARGO_DRONE' ? 'DRONE' : myVehicle.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';

                  let dangerKey = 'SONAPUR_NH6';
                  let roadName = 'NH-6';
                  let landmark = 'Sonapur Mudslide Zone';
                  let lat = 25.1250;
                  let lng = 92.3500;

                  if (dest.includes('Tawang') || orig.includes('Dirang')) {
                    dangerKey = 'SELA_PASS_NH13';
                    roadName = 'NH-13';
                    landmark = 'Sela Pass North Portal';
                    lat = 27.5034;
                    lng = 92.1037;
                  } else if (dest.includes('Kohima') || orig.includes('Dimapur')) {
                    dangerKey = 'PAGLA_PAHAR_NH29';
                    roadName = 'NH-29';
                    landmark = 'Pagla Pahar Gorge';
                    lat = 25.7920;
                    lng = 93.9170;
                  } else if (dest.includes('Gangtok') || orig.includes('Siliguri')) {
                    dangerKey = 'TEESTA_NH10';
                    roadName = 'NH-10';
                    landmark = 'Teesta River Spillway';
                    lat = 27.0500;
                    lng = 88.4900;
                  }

                  const newInc = {
                    id: `INC-DRIVER-DETOUR-${Date.now().toString().slice(-4)}`,
                    hazardType: 'LANDSLIDE',
                    roadName: roadName,
                    landmark: landmark,
                    dangerKey: dangerKey,
                    lat: lat,
                    lng: lng,
                    severity: 'CRITICAL',
                    status: 'OFFICIAL_VERIFIED',
                    verified: true,
                    clearancePercent: 10,
                    reportedBy: `${currentUser.name} (${myVehicle.vehicleId})`,
                    timestamp: new Date().toLocaleTimeString(),
                    description: `Driver triggered tactical detour on ${roadName}. AI bypass engaged.`
                  };

                  if (onIncidentAdded) {
                    onIncidentAdded(newInc);
                  }

                  const updated = [newInc, ...activeIncidents.filter(i => i.dangerKey !== dangerKey)];
                  onQuickRoutePlan(orig, dest, mode, currentUser, updated);

                  setDetourAlert({
                    title: `TACTICAL DETOUR ENGAGED: ${landmark}`,
                    description: `AI autonomous rerouting active on ${roadName}. Navigating via official mountain bypass.`,
                    savedTime: "Saved 4.5 Hours of Chokepoint Delay"
                  });

                  speakInstruction(`Tactical detour engaged. Navigating via mountain bypass.`);

                  setTimeout(() => setDetourAlert(null), 7000);
                }
              }}
              className="bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 px-3 py-2 rounded-2xl text-xs font-bold flex items-center space-x-1.5 transition active:scale-95 shadow-md shadow-amber-500/10"
              title="Force AI to calculate tactical detour"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Detour</span>
            </button>

            {/* 1-Click Report Hazard */}
            <button
              onClick={() => setIsReportModalOpen(true)}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs px-3.5 py-2 rounded-2xl shadow-lg flex items-center space-x-1.5 transition active:scale-95"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Report Blockage</span>
            </button>

            {/* 🚨 Emergency SOS Button */}
            <button
              onClick={handleTriggerSos}
              className={`px-3.5 py-2 rounded-2xl text-xs font-black shadow-lg flex items-center space-x-1.5 transition active:scale-95 ${
                sosActive
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-600/40 border border-rose-400/40'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>{sosActive ? "SOS SENT" : "SOS"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-TIME DETOUR ALERT FLASH BANNER */}
      {detourAlert && (
        <div className="bg-gradient-to-r from-amber-950 via-rose-950 to-amber-950 border border-amber-500/60 p-3 rounded-2xl shadow-2xl flex items-center justify-between animate-bounce">
          <div className="flex items-center space-x-2.5 text-xs text-amber-200 font-bold">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
            <div>
              <span className="text-white block font-extrabold">{detourAlert.title}</span>
              <span className="text-[11px] text-amber-300/90 font-normal">{detourAlert.description}</span>
            </div>
          </div>
          <span className="bg-amber-900/80 text-amber-200 border border-amber-600 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full shrink-0">
            {detourAlert.savedTime}
          </span>
        </div>
      )}

      {/* Driver Incident Submission Confirmation Banner */}
      {reportSubmittedBanner && (
        <div className="bg-emerald-950/90 border border-emerald-500/60 p-3 rounded-2xl shadow-2xl flex items-center justify-between text-xs text-emerald-300 font-bold">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{reportSubmittedBanner.message}</span>
          </div>
          <button onClick={() => setReportSubmittedBanner(null)} className="text-zinc-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* 3. CENTER STAGE 3D IN-CABIN MAP CANVAS */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border border-cyan-500/30 shadow-2xl">
        {/* Layer Switcher Top Right of GPS */}
        <div className="absolute top-3 right-3 z-20 flex items-center space-x-1.5 bg-zinc-950/90 p-1 rounded-2xl border border-white/[0.12] backdrop-blur-xl">
          <button
            onClick={() => setMapLayer('roadmap')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
              mapLayer === 'roadmap' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Google Road
          </button>
          <button
            onClick={() => setMapLayer('terrain')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
              mapLayer === 'terrain' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            3D Terrain
          </button>
          <button
            onClick={() => setMapLayer('satellite')}
            className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition ${
              mapLayer === 'satellite' ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Floating In-Cabin Radar Status Top Left */}
        <div className="absolute top-3 left-3 z-20 bg-zinc-950/90 px-3 py-2 rounded-2xl border border-white/[0.15] backdrop-blur-xl space-y-0.5">
          <div className="flex items-center space-x-2 text-[10px] font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-white font-bold">GPS LOCK: 12 SATELLITES</span>
          </div>
          <div className="text-[10px] text-zinc-400 font-mono">
            Lat: {currentCoord[0]?.toFixed(4)}, Lng: {currentCoord[1]?.toFixed(4)}
          </div>
        </div>

        {/* Map Container */}
        <MapContainer
          center={currentCoord}
          zoom={10}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
          <DriverMapFollower polylineCoords={polylineCoords} currentCoord={currentCoord} />
          {/* Dynamic Google Maps Layer */}
          {mapLayer === 'roadmap' && (
            <TileLayer
              key="roadmap"
              attribution="Google Maps"
              url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          )}
          {mapLayer === 'terrain' && (
            <TileLayer
              key="terrain"
              attribution="Google 3D Terrain"
              url="https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          )}
          {mapLayer === 'satellite' && (
            <TileLayer
              key="satellite"
              attribution="Google Hybrid Satellite"
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              maxZoom={20}
            />
          )}

          {/* Active Tactical Route Polyline */}
          {polylineCoords.length > 0 && (
            <>
              {/* Outer Glow Line */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: maneuver.badge.includes('DETOUR') ? '#f59e0b' : '#06b6d4',
                  weight: 8,
                  opacity: 0.4,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
              {/* Inner High-Contrast Core Line */}
              <Polyline
                positions={polylineCoords}
                pathOptions={{
                  color: maneuver.badge.includes('DETOUR') ? '#fbbf24' : '#22d3ee',
                  weight: 5,
                  opacity: 0.95,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              />
            </>
          )}

          {/* Driver's Animated Vehicle Marker */}
          <Marker
            position={currentCoord}
            icon={createDriverVehicleIcon(myVehicle?.type, Math.round(navStepIndex * 15) % 360)}
          >
            <Popup className="custom-driver-popup">
              <div className="p-2 text-xs font-sans text-zinc-900">
                <strong className="block text-sm font-bold">{myVehicle?.vehicleId}</strong>
                <span>Pilot: {currentUser.name}</span>
                <div className="font-mono text-xs text-cyan-700 font-bold mt-1">
                  Speed: {simSpeedKmh} km/h • Alt: {currentAltitude}m
                </div>
              </div>
            </Popup>
          </Marker>

          {/* Active Landslides / Hazard Obstacles Along Path */}
          {activeIncidents.map(inc => (
            <React.Fragment key={inc.id}>
              <Marker
                position={[inc.lat, inc.lng]}
                icon={createHazardIcon(inc.severity)}
              >
                <Popup className="custom-hazard-popup">
                  <div className="p-2 text-xs font-sans text-zinc-900 space-y-1">
                    <strong className="text-rose-600 block text-xs font-black">
                      ⚠️ {inc.hazardType} ({inc.severity})
                    </strong>
                    <div className="font-semibold text-zinc-800">{inc.roadName}</div>
                    <p className="text-[11px] text-zinc-600">{inc.description}</p>
                    <div className="text-[10px] font-mono bg-zinc-100 p-1 rounded font-bold text-zinc-700">
                      Clearance: {inc.clearancePercent || 0}% • {inc.status}
                    </div>
                  </div>
                </Popup>
              </Marker>
              <Circle
                center={[inc.lat, inc.lng]}
                radius={2500}
                pathOptions={{
                  color: '#f43f5e',
                  fillColor: '#f43f5e',
                  fillOpacity: 0.15,
                  weight: 1.5,
                  dashArray: '4, 4'
                }}
              />
            </React.Fragment>
          ))}
        </MapContainer>
      </div>

      {/* 4. IN-CABIN TELEMETRY COCKPIT CLUSTER (Bottom) */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {/* Speedometer Pod */}
        <div className="liquid-glass rounded-3xl p-3.5 border border-cyan-500/30 flex flex-col justify-between space-y-1 relative overflow-hidden bg-[#0a0f1eed]">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1.5 font-bold text-zinc-300">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span>Speedometer</span>
            </span>
            <span className="text-[9px] font-mono bg-zinc-900 text-cyan-300 px-1.5 py-0.2 rounded font-bold">
              Limit 50
            </span>
          </div>
          <div className="text-center py-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-300 tracking-tight">
              {simSpeedKmh} <span className="text-xs text-zinc-400 font-sans font-normal">km/h</span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">Cruising Pace OK</span>
          </div>
        </div>

        {/* Digital Inclinometer & Grade Pod */}
        <div className="liquid-glass rounded-3xl p-3.5 border border-amber-500/30 flex flex-col justify-between space-y-1 relative overflow-hidden bg-[#0a0f1eed]">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1.5 font-bold text-zinc-300">
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              <span>Inclinometer</span>
            </span>
            <span className="text-[9px] font-mono text-amber-300 bg-amber-950/80 px-1.5 py-0.2 rounded font-black">
              {currentGrade > 0 ? `+${currentGrade}%` : `${currentGrade}%`}
            </span>
          </div>
          <div className="text-center py-1">
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight">
              {currentAltitude} <span className="text-xs text-zinc-400 font-sans font-normal">m</span>
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">Altitude ASL</span>
          </div>
        </div>

        {/* Real-time ETA & Distance Remaining */}
        <div className="liquid-glass rounded-3xl p-3.5 border border-emerald-500/30 flex flex-col justify-between space-y-1 relative overflow-hidden bg-[#0a0f1eed]">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1.5 font-bold text-zinc-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>ETA & Distance</span>
            </span>
            <span className="text-[9px] font-mono text-emerald-300 font-bold">
              {100 - progressPercent}% left
            </span>
          </div>
          <div className="text-center py-1">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 tracking-tight">
              {formatDistance(Math.max(12, Math.round((plannedRoute?.total_distance_km || 315) * ((100 - progressPercent) / 100))))}
            </div>
            <span className="text-[10px] text-zinc-300 font-bold">ETA: 18:45 (3h 12m)</span>
          </div>
        </div>

        {/* Cold-Chain Cargo Temp */}
        <div className="liquid-glass rounded-3xl p-3.5 border border-blue-500/30 flex flex-col justify-between space-y-1 relative overflow-hidden bg-[#0a0f1eed]">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1.5 font-bold text-zinc-300">
              <Thermometer className="w-3.5 h-3.5 text-blue-400" />
              <span>Cold-Chain</span>
            </span>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950 px-1.5 py-0.2 rounded font-bold">
              NOMINAL
            </span>
          </div>
          <div className="text-center py-1">
            <div className="text-2xl sm:text-3xl font-black font-mono text-blue-300 tracking-tight">
              +4.2°C
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">Vaccine Cargo Safe</span>
          </div>
        </div>

        {/* Dual Fuel Tanks */}
        <div className="col-span-2 sm:col-span-1 liquid-glass rounded-3xl p-3.5 border border-purple-500/30 flex flex-col justify-between space-y-1 relative overflow-hidden bg-[#0a0f1eed]">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1.5 font-bold text-zinc-300">
              <Fuel className="w-3.5 h-3.5 text-purple-400" />
              <span>Fuel Range</span>
            </span>
            <span className="text-[9px] font-mono text-purple-300 font-bold">
              380 km
            </span>
          </div>
          <div className="text-center py-1">
            <div className="text-2xl sm:text-3xl font-black font-mono text-purple-300 tracking-tight">
              {Math.round(myVehicle?.fuel || 82)}%
            </div>
            <span className="text-[9px] text-zinc-500 font-mono">Dual Diesel Tanks</span>
          </div>
        </div>
      </div>

      {/* 5. DRIVER 1-CLICK HAZARD REPORTING MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
          <div className="liquid-glass rounded-3xl max-w-lg w-full p-5 border border-amber-500/40 shadow-2xl space-y-4 bg-[#080d1ef5]">
            <div className="flex items-center justify-between border-b border-white/[0.1] pb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Report Road Hazard at Current GPS</h3>
                  <p className="text-xs text-zinc-400">Transmitting from Convoy {myVehicle.vehicleId}</p>
                </div>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitHazard} className="space-y-3.5 text-xs">
              <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.06] flex items-center justify-between font-mono">
                <span className="text-zinc-400 font-sans">Current Transponder GPS:</span>
                <strong className="text-cyan-400">Lat: {currentCoord[0]?.toFixed(4)}, Lng: {currentCoord[1]?.toFixed(4)}</strong>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Hazard Category</label>
                  <select
                    value={reportHazardType}
                    onChange={(e) => setReportHazardType(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="LANDSLIDE">Mudslide / Landslide</option>
                    <option value="ROCKFALL">Boulder Rockfall</option>
                    <option value="FLASH_FLOOD">River Flash Flood</option>
                    <option value="AVALANCHE">Snow Avalanche</option>
                    <option value="BRIDGE_DAMAGE">Bridge Structural Crack</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Blockage Severity</label>
                  <select
                    value={reportSeverity}
                    onChange={(e) => setReportSeverity(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-white font-semibold focus:outline-none focus:border-amber-400"
                  >
                    <option value="CRITICAL">Critical (Total 100% Roadblock)</option>
                    <option value="HIGH">High (Single Lane Blocked)</option>
                    <option value="MODERATE">Moderate (Debris on Shoulder)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-300 uppercase block mb-1">Obstacle Visual SITREP Description</label>
                <textarea
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  rows={3}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white focus:outline-none focus:border-amber-400 font-sans leading-relaxed text-xs"
                />
              </div>

              <div className="flex items-center space-x-2 bg-zinc-950 p-2.5 rounded-xl border border-white/[0.06]">
                <input
                  type="checkbox"
                  id="passable4x4"
                  checked={reportPassable4x4}
                  onChange={(e) => setReportPassable4x4(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                />
                <label htmlFor="passable4x4" className="text-zinc-300 font-medium cursor-pointer">
                  Passable by certified high-clearance 4x4 vehicles
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-zinc-400 hover:text-white bg-zinc-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold px-5 py-2 rounded-xl shadow-lg flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Transmit & Recalculate Detour</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
