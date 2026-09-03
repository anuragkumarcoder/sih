import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  Navigation, Mountain, Zap, CheckCircle2, Info, Compass, 
  ArrowRight, ShieldAlert, Sparkles, AlertTriangle, Fuel, 
  Layers, MapPin, Coffee, Shield, Camera, ArrowUpDown,
  Plus, Minus, Crosshair, ChevronDown, ChevronUp, Share2, Printer, 
  Search, Car, Truck, Plane, Clock, ChevronRight, Volume2, RotateCcw,
  Sliders, Activity, Eye, PanelLeftClose, PanelLeftOpen, Radio, User,
  ShieldCheck, Check, Trash2, Send, Edit3, Lock, CheckCircle,
  Play, Pause, ArrowUpRight, Locate
} from 'lucide-react';
import { 
  NER_TOPOLOGY_LOCATIONS, 
  NER_WAREHOUSES_DATA, 
  NER_HIGHWAY_CORRIDORS,
  NER_GEOGRAPHIC_TERRAIN_FEATURES 
} from '../data/mockMasterData';
import { 
  formatDistance, 
  formatDuration, 
  formatElevation, 
  formatPercent, 
  formatCoords, 
  formatSpeed, 
  formatGrade
} from '../utils/formatters';
import ElevationProfile from './ElevationProfile';
import IncidentClearanceModal from './IncidentClearanceModal';

// Iconic Google Maps Custom SVG Markers
const googleOriginIcon = L.divIcon({
  className: 'google-marker-origin',
  html: `
    <div style="
      width: 20px;
      height: 20px;
      background: #00f2fe;
      border: 3px solid #ffffff;
      border-radius: 50%;
      box-shadow: 0 0 14px rgba(0,242,254,0.8);
    "></div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

const googleDestIcon = L.divIcon({
  className: 'google-marker-dest',
  html: `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      filter: drop-shadow(0 4px 12px rgba(234,67,53,0.7));
    ">
      <svg width="34" height="44" viewBox="0 0 24 32" fill="none">
        <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="#ea4335"/>
        <circle cx="12" cy="12" r="5" fill="#ffffff"/>
      </svg>
    </div>
  `,
  iconSize: [34, 44],
  iconAnchor: [17, 34],
  popupAnchor: [0, -34],
});

const googleHubIcon = (hubType) => {
  const isPass = hubType === 'CRITICAL_PASS';
  const color = isPass ? '#ea4335' : '#00f2fe';
  return L.divIcon({
    className: 'google-marker-hub',
    html: `
      <div style="
        background: #ffffff;
        border: 2.5px solid ${color};
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="width: 8px; height: 8px; background: ${color}; border-radius: 50%;"></div>
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -11],
  });
};

// Official Verified Danger Marker
const googleVerifiedIncidentIcon = L.divIcon({
  className: 'google-marker-incident-verified',
  html: `
    <div style="
      background: #ea4335;
      color: white;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 16px rgba(234,67,53,0.9);
      border: 2.5px solid #ffffff;
    ">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
  popupAnchor: [0, -15],
});

// Unverified Field Driver Report Marker (Amber with Question indicator)
const googlePendingIncidentIcon = L.divIcon({
  className: 'google-marker-incident-pending',
  html: `
    <div style="
      background: #f59e0b;
      color: #0f172a;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 14px rgba(245,158,11,0.9);
      border: 2px dashed #ffffff;
      animation: pulseGlow 2s infinite ease-in-out;
    ">
      <span style="font-size: 13px; font-weight: 900; font-family: sans-serif;">?</span>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14],
});

const googleVehicleIcon = (type, isSelected = false) => {
  const color = type === 'CARGO_DRONE' ? '#a855f7' : type === 'OFFROAD_4X4' ? '#f59e0b' : '#06b6d4';
  return L.divIcon({
    className: 'google-marker-vehicle',
    html: `
      <div style="
        background: ${color};
        color: white;
        width: ${isSelected ? '38px' : '32px'};
        height: ${isSelected ? '38px' : '32px'};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 18px ${color}bb;
        border: ${isSelected ? '3.5px solid #ffffff' : '2.5px solid #ffffff'};
        transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'};
        transition: all 0.2s ease;
      ">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
          <path d="M15 18H9"/>
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/>
          <circle cx="17" cy="18" r="2"/>
          <circle cx="7" cy="18" r="2"/>
        </svg>
      </div>
    `,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -19],
  });
};

// Map Controller for smooth flyTo and size invalidation
function MapController({ center, zoom }) {
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
    if (center && Array.isArray(center) && center.length === 2 && !isNaN(center[0]) && !isNaN(center[1])) {
      try {
        map.flyTo(center, zoom, { duration: 0.8 });
      } catch (e) {
        try {
          map.setView(center, zoom);
        } catch (err) {}
      }
    }
  }, [center, zoom, map]);

  return null;
}

export default function MapViewer({ 
  activeIncidents = [], 
  fleetVehicles = [], 
  plannedRoute = null, 
  alternativeRoute = null,
  onQuickRoutePlan,
  onSelectVehicle,
  onOpenAddConvoyModal = null,
  trackedVehicle = null,
  currentUser = null,
  onToggleVerifyIncident = null,
  onDismissIncident = null,
  onUpdateIncidentProgress = null
}) {
  const [mapCenter, setMapCenter] = useState([26.15, 92.60]);
  const [mapZoom, setMapZoom] = useState(7);
  const [googleLayerType, setGoogleLayerType] = useState('roadmap');
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Live Turn-by-Turn Pilot Navigation Mode State
  const [isNavigating, setIsNavigating] = useState(false);
  const [navProgressIndex, setNavProgressIndex] = useState(0);
  const [navPaused, setNavPaused] = useState(false);
  const [simulatedSpeed, setSimulatedSpeed] = useState(48);

  // Directions inputs
  const [origin, setOrigin] = useState('Guwahati');
  const [destination, setDestination] = useState('Tawang');
  const [travelMode, setTravelMode] = useState('TRUCK'); // 'TRUCK', '4X4', 'DRONE'
  const [selectedVehicleId, setSelectedVehicleId] = useState('NER-TRUCK-AS01-9921');
  const [sidebarTab, setSidebarTab] = useState('steps'); // 'steps', 'elevation', 'details'

  // Searchable Autocomplete Inputs State
  const [originSearch, setOriginSearch] = useState(null);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [destSearch, setDestSearch] = useState(null);
  const [isDestOpen, setIsDestOpen] = useState(false);

  // Landslide Quick Search Bar State
  const [landslideSearch, setLandslideSearch] = useState('');
  const [isLandslideSearchOpen, setIsLandslideSearchOpen] = useState(false);

  // Filtered lists
  const filteredOriginLocations = NER_TOPOLOGY_LOCATIONS.filter(n => {
    if (!originSearch) return true;
    const q = originSearch.toLowerCase();
    return n.name.toLowerCase().includes(q) || n.state.toLowerCase().includes(q);
  });

  const filteredDestLocations = NER_TOPOLOGY_LOCATIONS.filter(n => {
    if (!destSearch) return true;
    const q = destSearch.toLowerCase();
    return n.name.toLowerCase().includes(q) || n.state.toLowerCase().includes(q);
  });

  const filteredLandslides = activeIncidents.filter(inc => {
    if (!landslideSearch) return false;
    const q = landslideSearch.toLowerCase();
    return (
      (inc.roadName && inc.roadName.toLowerCase().includes(q)) ||
      (inc.landmark && inc.landmark.toLowerCase().includes(q)) ||
      (inc.type && inc.type.toLowerCase().includes(q)) ||
      (inc.severity && inc.severity.toLowerCase().includes(q)) ||
      (inc.description && inc.description.toLowerCase().includes(q))
    );
  });

  // Incident Governance Modal State
  const [selectedIncidentForClearance, setSelectedIncidentForClearance] = useState(null);
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);

  const isBRO = currentUser?.role === 'ROLE_BRO_INSPECTOR' || currentUser?.role === 'ROLE_ADMIN';

  // Live Navigation Simulation Progress Loop
  useEffect(() => {
    if (!isNavigating || navPaused) return;

    const coords = plannedRoute?.segments?.flatMap(s => s.polyline) || [];
    if (coords.length === 0) return;

    const navInterval = setInterval(() => {
      setNavProgressIndex(prev => {
        const nextIdx = (prev + 1) % coords.length;
        const currentCoord = coords[nextIdx];
        if (currentCoord) {
          setMapCenter(currentCoord);
        }
        setSimulatedSpeed(Math.max(38, Math.min(68, Math.round(48 + Math.random() * 8 - 4))));
        return nextIdx;
      });
    }, 850);

    return () => clearInterval(navInterval);
  }, [isNavigating, navPaused, plannedRoute]);

  // Sync origin/destination when plannedRoute changes from external scenarios
  useEffect(() => {
    if (plannedRoute?.waypoints && plannedRoute.waypoints.length >= 2) {
      const firstWp = plannedRoute.waypoints[0].name.split(' ')[0];
      const lastWp = plannedRoute.waypoints[plannedRoute.waypoints.length - 1].name.split(' ')[0];
      const foundOrigin = NER_TOPOLOGY_LOCATIONS.find(n => n.name === firstWp || plannedRoute.waypoints[0].name.includes(n.name));
      const foundDest = NER_TOPOLOGY_LOCATIONS.find(n => n.name === lastWp || plannedRoute.waypoints[plannedRoute.waypoints.length - 1].name.includes(n.name));
      if (foundOrigin) setOrigin(foundOrigin.name);
      if (foundDest) setDestination(foundDest.name);
    }
  }, [plannedRoute]);

  // Update only when tracked vehicle ID changes externally (prevents re-render loops from 2.5s GPS simulation)
  useEffect(() => {
    if (trackedVehicle && trackedVehicle.vehicleId !== selectedVehicleId) {
      handleSelectFleetVehicle(trackedVehicle);
    }
  }, [trackedVehicle?.vehicleId]);

  // Official Authentic Google Maps & Premium Tile Suite (100% Free, Zero API Keys, Direct High-Speed CDN)
  const googleTileConfigs = {
    roadmap: {
      url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps',
      label: 'Google Maps Official',
      icon: '🗺️'
    },
    esri_street: {
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
      attribution: '&copy; Esri World Street Map',
      label: 'Clean Vector Street Map',
      icon: '🚗'
    },
    hybrid: {
      url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps (Satellite)',
      label: 'Google 4K Satellite & Roads',
      icon: '🛰️'
    },
    terrain: {
      url: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
      attribution: '&copy; Google Maps (Terrain)',
      label: 'Google 3D Terrain',
      icon: '🏔️'
    },
    osm: {
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; OpenStreetMap',
      label: 'OpenStreetMap Global',
      icon: '🌍'
    }
  };

  const handleSelectFleetVehicle = (veh) => {
    setSelectedVehicleId(veh.vehicleId);
    setOrigin(veh.origin);
    setDestination(veh.destination);
    
    const mode = veh.type === 'CARGO_DRONE' ? 'DRONE' : veh.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
    setTravelMode(mode);
    setMapCenter([veh.lat, veh.lng]);
    setMapZoom(8);

    if (onQuickRoutePlan) {
      onQuickRoutePlan(veh.origin, veh.destination, mode);
      setIsSidebarOpen(true);
    }
  };

  const handleModeChange = (newMode) => {
    setTravelMode(newMode);
    if (onQuickRoutePlan) {
      onQuickRoutePlan(origin, destination, newMode);
      setIsSidebarOpen(true);
    }
  };

  const handleOriginChange = (newOrigin) => {
    setOrigin(newOrigin);
    if (onQuickRoutePlan) {
      onQuickRoutePlan(newOrigin, destination, travelMode);
    }
  };

  const handleDestinationChange = (newDest) => {
    setDestination(newDest);
    if (onQuickRoutePlan) {
      onQuickRoutePlan(origin, newDest, travelMode);
    }
  };

  const handleSwap = () => {
    const tempOrigin = origin;
    const tempDest = destination;
    setOrigin(tempDest);
    setDestination(tempOrigin);
    if (onQuickRoutePlan) {
      onQuickRoutePlan(tempDest, tempOrigin, travelMode);
    }
  };

  const handleDirections = () => {
    if (onQuickRoutePlan) {
      onQuickRoutePlan(origin, destination, travelMode);
      setIsSidebarOpen(true);
    }
  };

  const handleOpenClearanceGovernance = (inc) => {
    setSelectedIncidentForClearance(inc);
    setIsClearanceModalOpen(true);
  };

  // Dynamic corridor blockage check against active, unblocked incidents
  const isCorridorBlocked = (corridor) => {
    return activeIncidents.some(inc => {
      const isCleared = inc.status === 'OFFICIAL_CLEARED' || inc.status === 'RESOLVED_CLEARED' || (inc.clearancePercent !== undefined && inc.clearancePercent >= 100);
      if (isCleared) return false;
      if (!inc.verified) return false;

      // Check explicit dangerKey
      if (corridor.dangerKey) {
        const incRoad = (inc.roadName || '').toUpperCase();
        const incLandmark = (inc.landmark || '').toUpperCase();
        if (corridor.dangerKey === 'SONAPUR_NH6' && (incRoad.includes('NH-6') || incLandmark.includes('SONAPUR') || incLandmark.includes('MEGHALAYA'))) return true;
        if (corridor.dangerKey === 'SELA_PASS_NH13' && (incRoad.includes('NH-13') || incLandmark.includes('SELA'))) return true;
        if (corridor.dangerKey === 'PAGLA_PAHAR_NH29' && (incRoad.includes('NH-29') || incLandmark.includes('PAGLA'))) return true;
        if (corridor.dangerKey === 'TEESTA_NH10' && (incRoad.includes('NH-10') || incLandmark.includes('TEESTA'))) return true;
      }

      const cHighway = (corridor.highway || '').toLowerCase();
      const incRoad = (inc.roadName || '').toLowerCase();

      if (cHighway && incRoad.includes(cHighway.split('_')[0])) return true;

      // Spatial distance along corridor polyline
      if (corridor.coords && corridor.coords.length >= 2) {
        for (let i = 0; i < corridor.coords.length - 1; i++) {
          const ptA = corridor.coords[i];
          const ptB = corridor.coords[i + 1];
          const midLat = (ptA[0] + ptB[0]) / 2;
          const midLng = (ptA[1] + ptB[1]) / 2;
          const distKm = Math.hypot((inc.lat - midLat) * 111, (inc.lng - midLng) * 111 * Math.cos(midLat * Math.PI / 180));
          if (distKm <= 20) return true;
        }
      }

      return false;
    });
  };

  const plannedCoords = plannedRoute?.segments?.flatMap(s => s.polyline) || [];

  return (
    <div className="relative w-full h-[calc(100vh-14.5rem)] min-h-[460px] rounded-3xl overflow-hidden border border-white/[0.12] shadow-2xl bg-[#090d18] flex font-sans select-none">
      
      {/* 1. FLOATING LIQUID GLASS NAVIGATION DOCK (Right Slide-over Drawer) */}
      {isSidebarOpen ? (
        <div className="absolute top-4 right-4 bottom-4 z-30 w-96 min-w-[340px] max-w-[90vw] liquid-glass rounded-3xl flex flex-col shadow-2xl border border-white/[0.15] overflow-hidden animate-fadeIn backdrop-blur-2xl bg-[#090d1af2]">
          {/* Sidebar Header & Quick Vehicle Selector */}
          <div className="p-4 border-b border-white/[0.08] space-y-3 bg-white/[0.02]">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
                  <Navigation className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-extrabold text-sm text-white tracking-tight block">Route Navigation</span>
                  <span className="text-[10px] text-cyan-300 font-mono">VisionOS Liquid Dock</span>
                </div>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
                title="Collapse Panel"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Active Vehicle Selector Carousel */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
                  <span>Active Convoys ({fleetVehicles.length}):</span>
                </span>
                {onOpenAddConvoyModal && (
                  <button
                    onClick={onOpenAddConvoyModal}
                    className="text-[10px] font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-0.5 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Convoy</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {fleetVehicles.map(veh => {
                  const isSelected = selectedVehicleId === veh.vehicleId;
                  const isDriver = currentUser?.role === 'ROLE_FIELD_DRIVER';
                  const isLockedForDriver = isDriver && currentUser?.assignedVehicleId && veh.vehicleId !== currentUser.assignedVehicleId;

                  if (isLockedForDriver) {
                    return (
                      <div
                        key={veh.vehicleId}
                        className="p-2 rounded-xl text-left border border-white/[0.04] bg-zinc-950/40 opacity-50 relative group cursor-not-allowed"
                        title="Access Restricted: Field drivers only have clearance for their assigned vehicle. Switch to Central Dispatcher or Admin role for multi-fleet control."
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold font-mono text-zinc-500 flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-zinc-500" />
                            <span>{veh.vehicleId.split('-')[1] || veh.vehicleId}</span>
                          </span>
                          <span className="text-[8px] font-mono text-zinc-600 border border-zinc-800 px-1 py-0.2 rounded uppercase">
                            Locked
                          </span>
                        </div>
                        <div className="text-[9px] text-zinc-600 truncate pt-0.5">
                          {veh.origin} ➔ {veh.destination}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={veh.vehicleId}
                      onClick={() => handleSelectFleetVehicle(veh)}
                      className={`p-2 rounded-xl text-left border transition ${
                        isSelected
                          ? 'bg-cyan-500/20 border-cyan-400/80 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400/40 text-cyan-200'
                          : 'bg-zinc-950/60 hover:bg-zinc-900/80 border-white/[0.06] text-zinc-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold font-mono">
                          {veh.vehicleId.split('-')[1] || veh.vehicleId}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          veh.type === 'CARGO_DRONE' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                          veh.type === 'OFFROAD_4X4' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                          'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {veh.type === 'CARGO_DRONE' ? 'Drone' : veh.type === 'OFFROAD_4X4' ? '4x4' : 'Truck'}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-400 truncate pt-0.5">
                        {veh.origin} ➔ {veh.destination}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Selector - Instant Dynamic Recalculation on Click */}
            <div className="flex items-center justify-between bg-zinc-950/70 p-1 rounded-xl text-xs font-semibold border border-white/[0.06]">
              <button
                onClick={() => handleModeChange('TRUCK')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  travelMode === 'TRUCK' ? 'bg-zinc-800 text-cyan-300 shadow-sm font-bold border border-white/[0.1]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Heavy Truck</span>
              </button>
              <button
                onClick={() => handleModeChange('4X4')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  travelMode === '4X4' ? 'bg-zinc-800 text-amber-300 shadow-sm font-bold border border-white/[0.1]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5" />
                <span>4x4 Offroad</span>
              </button>
              <button
                onClick={() => handleModeChange('DRONE')}
                className={`flex-1 py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  travelMode === 'DRONE' ? 'bg-zinc-800 text-purple-300 shadow-sm font-bold border border-white/[0.1]' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Plane className="w-3.5 h-3.5" />
                <span>Drone</span>
              </button>
            </div>

            {/* Connected Searchable Inputs */}
            <div className="relative flex items-center space-x-2.5 pt-1">
              <div className="flex flex-col items-center justify-between h-20 py-2">
                <div className="w-3 h-3 rounded-full border-2 border-cyan-400 bg-zinc-950 shadow-sm shadow-cyan-400"></div>
                <div className="w-0.5 h-8 border-l-2 border-dotted border-zinc-700"></div>
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-500"></div>
              </div>

              <div className="flex-1 space-y-2">
                {/* Searchable Origin Input */}
                <div className="relative">
                  <div className="bg-zinc-950/80 hover:bg-zinc-900 rounded-xl px-3 py-1.5 border border-white/[0.08] flex items-center justify-between transition focus-within:border-cyan-400/80 focus-within:ring-1 focus-within:ring-cyan-400/40">
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">From:</span>
                      <input
                        type="text"
                        value={originSearch !== null ? originSearch : origin}
                        onChange={(e) => {
                          setOriginSearch(e.target.value);
                          setIsOriginOpen(true);
                        }}
                        onFocus={() => {
                          setOriginSearch(origin);
                          setIsOriginOpen(true);
                        }}
                        placeholder="Search origin city..."
                        className="w-full bg-transparent text-white font-bold text-xs focus:outline-none cursor-text"
                      />
                    </div>
                    <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </div>

                  {/* Origin Dropdown Results */}
                  {isOriginOpen && (
                    <div className="absolute top-full mt-1 left-0 right-0 max-h-52 overflow-y-auto bg-[#0a0f1d] rounded-2xl p-1.5 shadow-2xl border border-cyan-500/40 z-50 space-y-0.5 backdrop-blur-xl">
                      {filteredOriginLocations.map(n => (
                        <button
                          key={n.name}
                          onClick={() => {
                            handleOriginChange(n.name);
                            setOriginSearch(null);
                            setIsOriginOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs transition flex items-center justify-between ${
                            origin === n.name ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-white/[0.08] text-zinc-300'
                          }`}
                        >
                          <span className="font-semibold">{n.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{n.state} • {formatElevation(n.elevation)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Searchable Destination Input */}
                <div className="relative">
                  <div className="bg-zinc-950/80 hover:bg-zinc-900 rounded-xl px-3 py-1.5 border border-white/[0.08] flex items-center justify-between transition focus-within:border-rose-400/80 focus-within:ring-1 focus-within:ring-rose-400/40">
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">To:</span>
                      <input
                        type="text"
                        value={destSearch !== null ? destSearch : destination}
                        onChange={(e) => {
                          setDestSearch(e.target.value);
                          setIsDestOpen(true);
                        }}
                        onFocus={() => {
                          setDestSearch(destination);
                          setIsDestOpen(true);
                        }}
                        placeholder="Search destination city..."
                        className="w-full bg-transparent text-white font-bold text-xs focus:outline-none cursor-text"
                      />
                    </div>
                    <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  </div>

                  {/* Destination Dropdown Results */}
                  {isDestOpen && (
                    <div className="absolute top-full mt-1 left-0 right-0 max-h-52 overflow-y-auto bg-[#0a0f1d] rounded-2xl p-1.5 shadow-2xl border border-rose-500/40 z-50 space-y-0.5 backdrop-blur-xl">
                      {filteredDestLocations.map(n => (
                        <button
                          key={n.name}
                          onClick={() => {
                            handleDestinationChange(n.name);
                            setDestSearch(null);
                            setIsDestOpen(false);
                          }}
                          className={`w-full px-2.5 py-1.5 rounded-xl text-left text-xs transition flex items-center justify-between ${
                            destination === n.name ? 'bg-rose-500/20 text-rose-300 font-bold' : 'hover:bg-white/[0.08] text-zinc-300'
                          }`}
                        >
                          <span className="font-semibold">{n.name}</span>
                          <span className="text-[10px] text-zinc-400 font-mono">{n.state} • {formatElevation(n.elevation)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSwap}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 border border-white/[0.08] flex items-center justify-center text-zinc-400 hover:text-white transition shrink-0"
                title="Reverse origin and destination"
              >
                <ArrowUpDown className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleDirections}
              className="w-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-blue-500 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg shadow-cyan-600/30 border border-cyan-400/30 flex items-center justify-center space-x-2 transition active:scale-98"
            >
              <Navigation className="w-4 h-4 text-white" />
              <span>Recalculate Corridor</span>
            </button>
          </div>

          {/* Dynamic Route Results Area */}
          {plannedRoute ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* ETA Hero Card */}
              <div className="bg-gradient-to-br from-emerald-950/50 via-zinc-950/80 to-emerald-950/30 p-4 rounded-2xl border border-emerald-500/40 space-y-1.5 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-extrabold text-emerald-400 font-mono tracking-tight drop-shadow-sm">
                    {formatDuration(plannedRoute.estimated_duration_hours)}
                  </div>
                  <span className="text-[11px] font-bold bg-emerald-500 text-black px-2.5 py-0.5 rounded-full shadow-sm">
                    {travelMode === 'DRONE' ? 'AERIAL DIRECT' : 'FASTEST'}
                  </span>
                </div>
                <div className="text-xs font-semibold text-zinc-200">
                  {formatDistance(plannedRoute.total_distance_km)} • via {plannedRoute.name ? plannedRoute.name.split('(')[0] : 'Optimal Highway'}
                </div>
                <p className="text-[11px] text-zinc-400">
                  {travelMode === 'DRONE' 
                    ? '⚡ Direct aerial corridor bypassing all mountain bottlenecks & landslides.' 
                    : travelMode === '4X4' 
                    ? '🚙 Agile 4x4 mountain climb passing single-lane mudslides.' 
                    : '🚛 Heavy multi-axle freight route with steep grade protection.'}
                </p>

                {/* 🚀 1-Click Start Live Turn-by-Turn Pilot Navigation */}
                <button
                  onClick={() => {
                    setIsNavigating(true);
                    setNavProgressIndex(0);
                    setNavPaused(false);
                    setIsSidebarOpen(false);
                    if (plannedCoords && plannedCoords[0]) {
                      setMapCenter(plannedCoords[0]);
                      setMapZoom(11);
                    }
                  }}
                  className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold py-2.5 rounded-xl text-xs shadow-lg shadow-emerald-600/30 border border-emerald-400/40 flex items-center justify-center space-x-2 transition active:scale-95 group"
                >
                  <Play className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
                  <span>START LIVE PILOT NAVIGATION</span>
                </button>
              </div>

              {/* Segmented Detail Tabs */}
              <div className="flex items-center space-x-1 border-b border-white/[0.08] pb-2 text-xs font-semibold">
                <button
                  onClick={() => setSidebarTab('steps')}
                  className={`px-3 py-1.5 rounded-lg transition ${sidebarTab === 'steps' ? 'bg-zinc-800 text-cyan-300 font-bold border border-white/[0.1]' : 'text-zinc-400 hover:text-white'}`}
                >
                  {travelMode === 'DRONE' ? 'Flight Waypoints' : 'Turn-by-Turn'}
                </button>
                <button
                  onClick={() => setSidebarTab('elevation')}
                  className={`px-3 py-1.5 rounded-lg transition ${sidebarTab === 'elevation' ? 'bg-zinc-800 text-cyan-300 font-bold border border-white/[0.1]' : 'text-zinc-400 hover:text-white'}`}
                >
                  Elevation Profile
                </button>
                <button
                  onClick={() => setSidebarTab('details')}
                  className={`px-3 py-1.5 rounded-lg transition ${sidebarTab === 'details' ? 'bg-zinc-800 text-cyan-300 font-bold border border-white/[0.1]' : 'text-zinc-400 hover:text-white'}`}
                >
                  {travelMode === 'DRONE' ? 'Battery & Alt' : 'Fuel & Incline'}
                </button>
              </div>

              {/* Steps List */}
              {sidebarTab === 'steps' && (
                <div className="space-y-2 text-xs">
                  {plannedRoute.waypoints && plannedRoute.waypoints.map((wp, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950/70 hover:bg-zinc-900 border border-white/[0.06] transition">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-5 h-5 rounded-full bg-cyan-500 text-black flex items-center justify-center font-bold text-[10px]">
                          {i + 1}
                        </div>
                        <span className="font-semibold text-white">{wp.name}</span>
                      </div>
                      <span className="text-zinc-400 font-mono text-[11px] font-semibold">{formatElevation(wp.elevation_m)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Elevation Cross Section */}
              {sidebarTab === 'elevation' && (
                <div className="space-y-2">
                  <ElevationProfile
                    profileData={plannedRoute.elevation_profile}
                    routeName={plannedRoute.name}
                    stats={{
                      max_elevation: plannedRoute.max_elevation_m,
                      elevation_gain: plannedRoute.elevation_gain_m,
                      max_gradient: plannedRoute.max_gradient_percent
                    }}
                  />
                </div>
              )}

              {/* Fuel & Incline Breakdown */}
              {sidebarTab === 'details' && (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 font-sans block">
                      {travelMode === 'DRONE' ? 'Electric Battery' : 'Diesel Fuel'}
                    </span>
                    <strong className="text-white text-sm">
                      {travelMode === 'DRONE' ? `${(plannedRoute.total_distance_km * 0.28).toFixed(1)} kWh` : `${Math.round(plannedRoute.fuel_consumption_litres || 40)} Litres`}
                    </strong>
                  </div>
                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 font-sans block">
                      {travelMode === 'DRONE' ? 'Cruising Altitude' : 'Max Gradient'}
                    </span>
                    <strong className="text-amber-400 text-sm">
                      {travelMode === 'DRONE' ? `${formatElevation(plannedRoute.max_elevation_m)}` : formatGrade(plannedRoute.max_gradient_percent)}
                    </strong>
                  </div>
                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 font-sans block">Landslide Risk</span>
                    <strong className="text-emerald-400 text-sm">{formatPercent(plannedRoute.composite_risk_score, true)}</strong>
                  </div>
                  <div className="bg-zinc-950/80 p-3 rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-zinc-500 font-sans block">Network Cover</span>
                    <strong className="text-cyan-400 text-sm">98% Telemetry</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-6 text-center text-zinc-400 space-y-2">
              <Compass className="w-8 h-8 mx-auto text-zinc-500" />
              <p className="text-xs">Select Origin & Destination above and click "Recalculate Corridor"</p>
            </div>
          )}
        </div>
      ) : (
        /* Open Sidebar Floating Pill (If closed) */
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="absolute top-4 left-4 z-20 liquid-glass hover:bg-white/[0.1] text-white px-3.5 py-2 rounded-2xl shadow-2xl border border-white/[0.18] flex items-center space-x-2 text-xs font-bold transition active:scale-95 backdrop-blur-2xl bg-[#090d1af0]"
        >
          <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
          <span>Route & Checkpoints</span>
        </button>
      )}

      {/* 2. MAIN MAP CANVAS (Full Space) */}
      <div className="flex-1 relative h-full w-full">
        {/* 🔍 TOP FLOATING LANDSLIDE & HAZARD RADAR SEARCH BAR */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-[90%] sm:w-[420px] pointer-events-auto select-none">
          <div className="relative">
            <div className="liquid-glass rounded-2xl px-3.5 py-2 shadow-2xl border border-white/[0.18] flex items-center space-x-2.5 backdrop-blur-2xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
              <input
                type="text"
                value={landslideSearch}
                onChange={(e) => {
                  setLandslideSearch(e.target.value);
                  setIsLandslideSearchOpen(true);
                }}
                onFocus={() => setIsLandslideSearchOpen(true)}
                placeholder="Search landslides (e.g. Sonapur, Sela, NH-6)..."
                className="w-full bg-transparent text-xs text-white placeholder-zinc-400 focus:outline-none font-semibold"
              />
              {landslideSearch && (
                <button
                  onClick={() => { setLandslideSearch(''); setIsLandslideSearchOpen(false); }}
                  className="text-zinc-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Dropdown Results for Landslide Search */}
            {isLandslideSearchOpen && landslideSearch && (
              <div className="absolute top-full mt-1.5 left-0 right-0 max-h-64 overflow-y-auto bg-[#0a0f1d] rounded-2xl p-1.5 shadow-2xl border border-amber-500/40 z-50 space-y-1 backdrop-blur-2xl">
                {filteredLandslides.length > 0 ? (
                  filteredLandslides.map(inc => (
                    <button
                      key={inc.id}
                      onClick={() => {
                        setMapCenter([inc.lat, inc.lng]);
                        setMapZoom(13);
                        handleOpenClearanceGovernance(inc);
                        setIsLandslideSearchOpen(false);
                      }}
                      className="w-full p-2 rounded-xl text-left hover:bg-white/[0.08] transition flex items-center justify-between group"
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                            {inc.roadName} — {inc.landmark || inc.type}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {inc.verified ? '✓ Verified by BRO' : '⚠️ Unverified Report'} • {inc.clearancePercent !== undefined ? `${inc.clearancePercent}% Cleared` : 'Active'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold bg-rose-950 text-rose-300 border border-rose-800">
                        {inc.severity || 'CRITICAL'}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-center text-xs text-zinc-400 font-sans">
                    No active landslides match "<span className="text-white font-semibold">{landslideSearch}</span>"
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Top-Right Google Layers Switcher */}
        <div className="absolute top-4 right-4 z-20 pointer-events-auto">
          <div className="relative">
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className="liquid-glass hover:bg-white/[0.1] text-white px-3.5 py-2.5 rounded-2xl shadow-2xl border border-white/[0.18] flex items-center space-x-2 text-xs font-semibold transition"
            >
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Layers</span>
            </button>

            {isLayerMenuOpen && (
              <div className="absolute right-0 top-12 w-80 liquid-glass rounded-3xl shadow-2xl border border-white/[0.18] p-3.5 space-y-2.5 animate-fadeIn text-xs text-white">
                <span className="font-bold text-zinc-400 uppercase text-[10px] block px-1 tracking-wider">Choose Map Canvas Style</span>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(googleTileConfigs).map(([k, cfg]) => (
                    <button
                      key={k}
                      onClick={() => {
                        setGoogleLayerType(k);
                        setIsLayerMenuOpen(false);
                      }}
                      className={`p-2.5 rounded-2xl flex items-center space-x-2.5 text-left border transition ${
                        googleLayerType === k 
                          ? 'border-cyan-400 bg-cyan-500/20 font-bold text-cyan-300 shadow-md shadow-cyan-500/20' 
                          : 'border-white/[0.06] hover:bg-white/[0.04] text-zinc-300'
                      }`}
                    >
                      <span className="text-xl">{cfg.icon}</span>
                      <div className="leading-tight">
                        <span className="text-xs font-bold block">{cfg.label}</span>
                        <span className="text-[9px] text-zinc-400 font-normal">{k === 'roadmap' ? 'Google Standard' : k === 'osm_hot' ? 'OSM Clean Vector' : k === 'terrain' ? '3D Topo' : 'Aerial Photo'}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom-Right Floating Zoom & Recenter Controls */}
        <div className="absolute bottom-6 right-4 z-20 pointer-events-auto flex flex-col space-y-2 select-none">
          <button
            onClick={() => { setMapCenter([26.15, 92.60]); setMapZoom(7); }}
            className="w-10 h-10 liquid-glass hover:bg-white/[0.1] text-white rounded-2xl shadow-2xl border border-white/[0.18] flex items-center justify-center transition active:scale-95"
            title="Recenter North East Map"
          >
            <Crosshair className="w-5 h-5 text-cyan-400" />
          </button>

          <div className="liquid-glass rounded-2xl shadow-2xl border border-white/[0.18] flex flex-col overflow-hidden">
            <button
              onClick={() => setMapZoom(prev => Math.min(18, prev + 1))}
              className="w-10 h-10 hover:bg-white/[0.1] text-white flex items-center justify-center transition active:bg-white/[0.15]"
              title="Zoom in"
            >
              <Plus className="w-5 h-5 text-zinc-300" />
            </button>
            <div className="h-px bg-white/[0.1] w-full" />
            <button
              onClick={() => setMapZoom(prev => Math.max(5, prev - 1))}
              className="w-10 h-10 hover:bg-white/[0.1] text-white flex items-center justify-center transition active:bg-white/[0.15]"
              title="Zoom out"
            >
              <Minus className="w-5 h-5 text-zinc-300" />
            </button>
          </div>
        </div>

        {/* 🧭 LIVE TURN-BY-TURN PILOT NAVIGATION TOP MANEUVER POD */}
        {isNavigating && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-[620px] pointer-events-auto animate-fadeIn">
            <div className="liquid-glass rounded-3xl p-3.5 shadow-2xl border border-cyan-400/50 flex items-center justify-between gap-3 backdrop-blur-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-600 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 shrink-0">
                  <ArrowUpRight className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.2 rounded-full border border-emerald-700 font-extrabold uppercase">
                      In {(2.8 - (navProgressIndex * 0.18) % 2.5).toFixed(1)} km
                    </span>
                    <span className="text-xs font-bold text-zinc-300">
                      {travelMode === 'DRONE' ? 'Cruising Airway VFR-2' : 'NH-6 Dawki Mountain Bypass'}
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-black text-white leading-tight pt-0.5">
                    {navProgressIndex < 3 ? "Depart Gateway Base ➔ Merge onto Mountain Highway" :
                     navProgressIndex < 8 ? "Bear Right onto NH-206 Dawki River Bypass (Sonapur Avoided)" :
                     "Continue along Southern Valley Highway toward Destination Hub"}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setIsNavigating(false)}
                className="bg-zinc-900 hover:bg-rose-950 text-zinc-400 hover:text-rose-300 px-3 py-1.5 rounded-2xl border border-white/[0.08] text-xs font-bold transition whitespace-nowrap"
              >
                Exit HUD
              </button>
            </div>
          </div>
        )}

        {/* 🎮 LIVE NAVIGATION BOTTOM TELEMETRY COCKPIT POD */}
        {isNavigating && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 w-[94%] max-w-[680px] pointer-events-auto animate-fadeIn">
            <div className="liquid-glass rounded-3xl p-3 shadow-2xl border border-cyan-400/40 flex items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="text-center px-1">
                  <div className="text-2xl font-black font-mono text-cyan-400 tracking-tight leading-none">
                    {simulatedSpeed} <span className="text-[10px] text-zinc-400 font-sans font-normal">km/h</span>
                  </div>
                  <span className="text-[9px] text-emerald-400 font-mono font-bold block pt-0.5">Limit: 50</span>
                </div>

                <div className="h-7 w-px bg-white/[0.1]" />

                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-zinc-400 text-[11px]">To:</span>
                    <strong className="text-white text-xs">{destination}</strong>
                  </div>
                  <div className="flex items-center space-x-2.5 text-[11px] font-mono">
                    <span className="text-emerald-400 font-bold">ETA: 38 Min</span>
                    <span className="text-zinc-400">Rem: {Math.max(4, Math.round((plannedRoute?.total_distance_km || 120) * (1 - navProgressIndex / Math.max(1, plannedCoords.length))))} km</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setNavPaused(!navPaused)}
                  className="bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-white/[0.1] px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5"
                >
                  {navPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
                  <span>{navPaused ? "Resume" : "Pause"}</span>
                </button>

                <button
                  onClick={() => {
                    if (onQuickRoutePlan) onQuickRoutePlan(origin, destination, travelMode);
                  }}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md flex items-center space-x-1.5 transition active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>AI Recalculate</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leaflet Map Canvas */}
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={true}
          dragging={true}
        >
          <MapController center={mapCenter} zoom={mapZoom} />

          <TileLayer
            key={googleLayerType}
            attribution={googleTileConfigs[googleLayerType]?.attribution || '&copy; Google Maps'}
            url={googleTileConfigs[googleLayerType]?.url || 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'}
            maxZoom={20}
          />

          {/* Highway Corridors: Only show background network if no route is active */}
          {(!plannedCoords || plannedCoords.length === 0) && NER_HIGHWAY_CORRIDORS.map((corridor, idx) => {
            const blocked = isCorridorBlocked(corridor);
            
            return (
              <Polyline
                key={`corridor_${idx}`}
                positions={corridor.coords}
                pathOptions={{
                  color: blocked ? '#ea4335' : '#8ab4f8',
                  weight: blocked ? 4 : 2.5,
                  opacity: blocked ? 0.9 : 0.45,
                  dashArray: blocked ? '6, 6' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round'
                }}
              >
                <Tooltip sticky>
                  <div className="text-xs font-sans text-slate-900">
                    <strong className="text-blue-700">{corridor.highway}</strong>: {corridor.from} ➔ {corridor.to}
                    <div className="text-slate-600 font-medium">
                      {formatDistance(corridor.distance)} • {blocked ? 'BLOCKED' : 'PASSABLE'}
                    </div>
                  </div>
                </Tooltip>
              </Polyline>
            );
          })}

          {/* Active Route Ribbon: Rendered cleanly for the selected convoy */}
          {plannedCoords && plannedCoords.length > 0 && (
            <>
              <Polyline
                positions={plannedCoords}
                pathOptions={{
                  color: travelMode === 'DRONE' ? '#7e22ce' : '#0369a1',
                  weight: 8,
                  opacity: 0.9,
                  dashArray: travelMode === 'DRONE' ? '8, 8' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              />
              <Polyline
                positions={plannedCoords}
                pathOptions={{
                  color: travelMode === 'DRONE' ? '#c084fc' : '#00f2fe',
                  weight: 5.5,
                  opacity: 1.0,
                  dashArray: travelMode === 'DRONE' ? '8, 8' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round',
                }}
              >
                <Tooltip sticky>
                  <span className="font-bold text-blue-700 text-xs">
                    {travelMode === 'DRONE' ? 'Autonomous Aerial Corridor' : 'Recommended Highway Corridor'}
                  </span>
                </Tooltip>
              </Polyline>
            </>
          )}

          {/* Origin Marker (Cyan Dot) */}
          {plannedCoords && plannedCoords.length > 0 && plannedCoords[0] && (
            <Marker position={plannedCoords[0]} icon={googleOriginIcon} />
          )}

          {/* Destination Marker (Red Pin) */}
          {plannedCoords && plannedCoords.length > 0 && plannedCoords[plannedCoords.length - 1] && (
            <Marker position={plannedCoords[plannedCoords.length - 1]} icon={googleDestIcon} />
          )}

          {/* 🚗 LIVE SIMULATED PILOT NAVIGATION VEHICLE */}
          {isNavigating && plannedCoords.length > 0 && (
            <Marker
              position={plannedCoords[navProgressIndex] || plannedCoords[0]}
              icon={L.divIcon({
                className: 'live-nav-marker',
                html: `
                  <div style="
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 44px;
                    height: 44px;
                    position: relative;
                  ">
                    <div style="
                      position: absolute;
                      width: 40px;
                      height: 40px;
                      border-radius: 50%;
                      background: rgba(0,242,254,0.35);
                      animation: ping 1.4s infinite;
                    "></div>
                    <div style="
                      position: relative;
                      width: 28px;
                      height: 28px;
                      border-radius: 50%;
                      background: linear-gradient(135deg, #00f2fe, #3b82f6);
                      border: 3px solid #ffffff;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      box-shadow: 0 0 24px #00f2fe;
                      font-size: 13px;
                    ">
                      ${travelMode === 'DRONE' ? '✈️' : travelMode === '4X4' ? '🚙' : '🚛'}
                    </div>
                  </div>
                `,
                iconSize: [44, 44],
                iconAnchor: [22, 22]
              })}
            />
          )}

          {/* Nodes: Only show background hubs when no route is planned */}
          {(!plannedCoords || plannedCoords.length === 0) && NER_TOPOLOGY_LOCATIONS.map((node) => (
            <Marker
              key={node.name}
              position={[node.lat, node.lng]}
              icon={googleHubIcon(node.hubType)}
              eventHandlers={{
                click: () => {
                  handleOriginChange(node.name);
                  setIsSidebarOpen(true);
                }
              }}
            >
              <Popup>
                <div className="text-xs space-y-1.5 text-slate-900 max-w-xs font-sans">
                  <div className="font-bold text-sm text-[#1a73e8]">{node.name}</div>
                  <div className="text-slate-700">State: <span className="font-semibold text-slate-900">{node.state}</span></div>
                  <div className="text-slate-700">Elevation: <span className="font-semibold text-amber-700">{formatElevation(node.elevation)}</span></div>
                  <div className="flex space-x-2 pt-1 border-t border-gray-200">
                    <button
                      onClick={() => { handleOriginChange(node.name); setIsSidebarOpen(true); }}
                      className="bg-[#1a73e8] hover:bg-[#1557b0] text-white font-semibold py-1 px-2.5 rounded-lg text-[10px] flex-1 shadow-sm"
                    >
                      Directions from here
                    </button>
                    <button
                      onClick={() => { handleDestinationChange(node.name); setIsSidebarOpen(true); }}
                      className="bg-gray-100 hover:bg-gray-200 text-slate-800 font-semibold py-1 px-2.5 rounded-lg text-[10px] flex-1 border border-gray-200"
                    >
                      Directions to here
                    </button>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -10]}>
                <span className="text-xs font-bold text-slate-900">{node.name}</span>
              </Tooltip>
            </Marker>
          ))}

          {/* Hazards along this route corridor */}
          {activeIncidents
            .filter(inc => inc.status !== 'OFFICIAL_CLEARED' && inc.status !== 'RESOLVED_CLEARED' && (inc.clearancePercent === undefined || inc.clearancePercent < 100))
            .filter(inc => {
              if (!plannedCoords || plannedCoords.length === 0) return true;
              return plannedCoords.some(pt => Math.hypot(pt[0] - inc.lat, pt[1] - inc.lng) < 0.65);
            })
            .map((inc) => {
              const isVer = inc.verified;
              const progress = inc.clearancePercent !== undefined ? inc.clearancePercent : 0;

              return (
                <Marker
                  key={inc.id}
                  position={[inc.lat, inc.lng]}
                  icon={isVer ? googleVerifiedIncidentIcon : googlePendingIncidentIcon}
                >
                <Popup>
                  <div className="text-xs space-y-2.5 text-slate-900 max-w-sm font-sans">
                    {/* Header with Verification Status */}
                    {isVer ? (
                      <div className="bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl text-emerald-950 space-y-0.5">
                        <div className="font-bold text-xs flex items-center justify-between text-emerald-900">
                          <span className="flex items-center space-x-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>OFFICIAL VERIFIED ROADBLOCK</span>
                          </span>
                          <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">
                            BRO CERTIFIED
                          </span>
                        </div>
                        <div className="text-[10px] text-emerald-800 font-medium">Certified: {inc.verifiedBy}</div>
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-300 p-2.5 rounded-xl text-amber-950 space-y-0.5">
                        <div className="font-bold text-xs flex items-center justify-between text-amber-900">
                          <span className="flex items-center space-x-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            <span>UNVERIFIED FIELD DRIVER REPORT</span>
                          </span>
                          <span className="text-[9px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded font-mono font-bold">
                            PENDING
                          </span>
                        </div>
                        <div className="text-[10px] text-amber-800 font-medium">
                          Reported by: {inc.reportedBy || 'Field Driver'} • Heavy machinery NOT dispatched yet
                        </div>
                      </div>
                    )}

                    {/* Hazard Title & Highway */}
                    <div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        {inc.hazardType} ({inc.severity})
                      </div>
                      <div className="font-bold text-slate-800 text-xs">{inc.roadName}</div>
                      {inc.landmark && <div className="text-[11px] text-slate-600">{inc.landmark}</div>}
                    </div>

                    {/* Description */}
                    <p className="text-slate-800 text-xs bg-slate-100 p-2.5 rounded-xl border border-slate-200 leading-snug">
                      {inc.description}
                    </p>

                    {/* 📊 LIVE CLEARANCE PROGRESS BAR */}
                    <div className="bg-slate-900 text-white p-3 rounded-xl space-y-2 shadow-md">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-zinc-300 font-sans flex items-center space-x-1.5 font-bold">
                          <Activity className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Clearance Progress</span>
                        </span>
                        <span className="font-bold text-cyan-300 text-sm">{progress}%</span>
                      </div>

                      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-white/20">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            progress >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                            progress >= 40 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                            'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-zinc-300 font-mono pt-0.5">
                        <span>ETA Remaining: <strong className="text-amber-300 font-bold">{inc.clearanceHours} Hours</strong></span>
                        <span>Rainfall: <strong className="text-blue-300 font-bold">{inc.rainfallMm}mm</strong></span>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Fleet Vehicles: ONLY render the selected convoy on the map */}
          {(selectedVehicleId 
            ? fleetVehicles.filter(v => v.vehicleId === selectedVehicleId)
            : fleetVehicles.slice(0, 1)
          ).map((veh) => {
            const isSelected = selectedVehicleId === veh.vehicleId;
            return (
              <Marker
                key={veh.vehicleId}
                position={[veh.lat, veh.lng]}
                icon={googleVehicleIcon(veh.type, isSelected)}
                eventHandlers={{
                  click: () => {
                    handleSelectFleetVehicle(veh);
                  }
                }}
              >
                <Popup>
                  <div className="text-xs space-y-1.5 text-slate-900 max-w-xs font-sans">
                    <div className="font-bold text-[#1a73e8] text-sm flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <Truck className="w-4 h-4" />
                        <span>{veh.vehicleId}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                        veh.type === 'CARGO_DRONE' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        veh.type === 'OFFROAD_4X4' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {veh.type === 'CARGO_DRONE' ? 'Drone' : veh.type === 'OFFROAD_4X4' ? '4x4' : 'Truck'}
                      </span>
                    </div>
                    <div className="text-slate-700">Driver: <strong className="text-slate-900">{veh.driverName}</strong></div>
                    <div className="text-slate-700">Route: <strong className="text-emerald-700">{veh.origin} ➔ {veh.destination}</strong></div>
                    <div className="grid grid-cols-2 gap-1 bg-gray-50 p-1.5 rounded-lg border border-gray-200 text-[11px] font-mono">
                      <div>Speed: <strong className="text-[#188038]">{formatSpeed(veh.speedKmh)}</strong></div>
                      <div>Altitude: <strong>{formatElevation(veh.altitude)}</strong></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* 🛠️ DEDICATED ADMIN INCIDENT CLEARANCE GOVERNANCE MODAL */}
      <IncidentClearanceModal
        isOpen={isClearanceModalOpen}
        onClose={() => setIsClearanceModalOpen(false)}
        incident={selectedIncidentForClearance}
        currentUser={currentUser}
        onUpdateProgress={onUpdateIncidentProgress}
        onToggleVerify={onToggleVerifyIncident}
        onDismiss={onDismissIncident}
      />
    </div>
  );
}
