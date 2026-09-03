import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Bot, AlertTriangle, CheckCircle2, Navigation, 
  Thermometer, ShieldAlert, Mountain, RefreshCw, Layers, 
  ChevronUp, ChevronDown, Radio, Zap, Plane, Truck, MapPin, 
  Send, HelpCircle, X, Shield, Activity, Flame, User
} from 'lucide-react';

// 8 Strategic Sensitive Zones across the North Eastern Region
export const NER_SENSITIVE_ZONES = [
  {
    id: "ZONE_SONAPUR_NH6",
    name: "Sonapur Mudslide Zone / Tunnel",
    highway: "NH-6 (Meghalaya ➔ Assam)",
    lat: 25.1250,
    lng: 92.3500,
    elevation: "1,120m",
    dangerType: "LANDSLIDE",
    severity: "CRITICAL",
    description: "High-volume monsoon mudslide blocking National Highway 6. Critical lifeline to Barak Valley, Mizoram & Tripura.",
    detourSummary: "AI detours traffic via NH-206 Dawki River Bypass (+8 km, avoids 4.5h delay)."
  },
  {
    id: "ZONE_SELA_PASS_NH13",
    name: "Sela Pass High-Altitude Corridor",
    highway: "NH-13 (Arunachal Pradesh)",
    lat: 27.5034,
    lng: 92.1037,
    elevation: "4,170m",
    dangerType: "ROCKFALL",
    severity: "CRITICAL",
    description: "Severe granite rockfall and snow blizzard blocking Tawang alpine corridor.",
    detourSummary: "AI diverts military & emergency units through Sangti Valley 4x4 Track."
  },
  {
    id: "ZONE_PAGLA_PAHAR_NH29",
    name: "Pagla Pahar Landslide Gorge",
    highway: "NH-29 (Dimapur ➔ Kohima)",
    lat: 25.7920,
    lng: 93.9170,
    elevation: "1,260m",
    dangerType: "LANDSLIDE",
    severity: "HIGH",
    description: "Chathe riverbank sinking and boulder slides creating single-lane bottleneck.",
    detourSummary: "AI routes via Niuland-Kohima bypass for light logistics."
  },
  {
    id: "ZONE_TEESTA_NH10",
    name: "Teesta River Gorge Corridor",
    highway: "NH-10 (Siliguri ➔ Gangtok)",
    lat: 27.0500,
    lng: 88.4900,
    elevation: "420m",
    dangerType: "FLASH_FLOOD",
    severity: "CRITICAL",
    description: "Teesta river overflow submerged 800m of asphalt near 29th Mile.",
    detourSummary: "AI routes heavy trucks via Lava & Gorubathan (NH-717A)."
  },
  {
    id: "ZONE_MAHASADAK_NH27",
    name: "Jatinga Hills Mahasadak",
    highway: "NH-27 (Nagaon ➔ Haflong ➔ Silchar)",
    lat: 25.1800,
    lng: 93.0200,
    elevation: "960m",
    dangerType: "LANDSLIDE",
    severity: "HIGH",
    description: "Unstable shale strata slide on 4-lane East-West corridor.",
    detourSummary: "AI balances freight via Lumding railway transshipment depot."
  },
  {
    id: "ZONE_NATHULA_SH3",
    name: "Nathu La Alpine Frontier Pass",
    highway: "SH-3 (Gangtok ➔ Kupup)",
    lat: 27.3860,
    lng: 88.8310,
    elevation: "4,310m",
    dangerType: "AVALANCHE",
    severity: "CRITICAL",
    description: "Heavy snow accumulation and black ice on border trade highway.",
    detourSummary: "AI engages autonomous VTOL cargo drones for high-altitude delivery."
  },
  {
    id: "ZONE_LOKCHAO_NH102",
    name: "Lokchao Bridge / Tengnoupal",
    highway: "NH-102 (Imphal ➔ Moreh)",
    lat: 24.2500,
    lng: 94.2800,
    elevation: "1,420m",
    dangerType: "LANDSLIDE",
    severity: "HIGH",
    description: "Chindwin basin silt avalanche threatening ASEAN international border road.",
    detourSummary: "AI prioritizes 4x4 convoys with winch-assisted hill ascent."
  },
  {
    id: "ZONE_BUALPUI_NH54",
    name: "Bualpui Ridge Mountain Highway",
    highway: "NH-54 (Aizawl ➔ Lunglei)",
    lat: 23.3500,
    lng: 92.7400,
    elevation: "1,290m",
    dangerType: "LANDSLIDE",
    severity: "MODERATE",
    description: "Clay soil slope sliding after 72h continuous torrential monsoon rainfall.",
    detourSummary: "AI monitors live soil moisture telemetry before greenlighting transit."
  }
];

export default function AIMissionSimulatorHelpbox({
  currentUser,
  plannedRoute,
  activeIncidents = [],
  fleetVehicles = [],
  onQuickRoutePlan,
  onIncidentToggle,
  onClearAllRoadblocks,
  onSimulateColdBreach,
  onSelectConvoy,
  onFlyToLocation
}) {
  const role = currentUser?.role || 'ROLE_ADMIN';

  // 1. RBAC Check: Field Drivers do NOT need an admin simulation helpbox
  if (role === 'ROLE_FIELD_DRIVER') {
    return null;
  }

  const [isExpanded, setIsExpanded] = useState(true); // Open by default for easy demo testing
  const [selectedVehicleId, setSelectedVehicleId] = useState(fleetVehicles[0]?.vehicleId || 'NER-TRUCK-AS01-9921');
  
  // Set default tab according to role
  const defaultTab = role === 'ROLE_BRO_INSPECTOR' ? 'zones' : 
                     role === 'ROLE_DISPATCHER' ? 'copilot' : 'zones';
  const [activeTab, setActiveTab] = useState(defaultTab);
  
  // AI Copilot conversational state
  const [aiMessage, setAiMessage] = useState(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Active Selected Convoy
  const activeConvoy = fleetVehicles.find(v => v.vehicleId === selectedVehicleId) || fleetVehicles[0] || {
    vehicleId: 'NER-TRUCK-AS01-9921',
    driverName: 'Biren Gogoi',
    cargoType: 'Vaccines & Critical Relief',
    origin: 'Guwahati',
    destination: 'Silchar',
    type: 'HEAVY_COMMERCIAL'
  };

  // Handle Convoy Switch
  const handleSelectConvoyOption = (vehId) => {
    setSelectedVehicleId(vehId);
    const found = fleetVehicles.find(v => v.vehicleId === vehId);
    if (found) {
      if (onSelectConvoy) onSelectConvoy(found);
      const mode = found.type === 'CARGO_DRONE' ? 'DRONE' : found.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
      if (onQuickRoutePlan) {
        onQuickRoutePlan(found.origin, found.destination, mode);
      }
      setAiMessage(`Convoy ${found.vehicleId} selected (${found.origin} ➔ ${found.destination}). Route line focused on map.`);
    }
  };

  // Dynamically Filter Sensitive Zones on THIS Specific Selected Convoy Route
  const activeOrigin = (plannedRoute?.waypoints?.[0]?.name || activeConvoy.origin || '').toLowerCase();
  const activeDest = (plannedRoute?.waypoints?.[plannedRoute?.waypoints?.length - 1]?.name || activeConvoy.destination || '').toLowerCase();
  const activeWaypoints = (plannedRoute?.waypoints || []).map(w => w.name.toLowerCase());
  const activeSegments = plannedRoute?.segments || [];
  const polylineCoords = activeSegments.flatMap(s => s.polyline || []);

  const routeSpecificSensitiveZones = NER_SENSITIVE_ZONES.filter(zone => {
    // 1. Direct Highway Match
    const zoneHighway = zone.highway.split(' ')[0].toLowerCase();
    const isHighwayOnRoute = activeSegments.some(s => 
      (s.road_type && s.road_type.toLowerCase().includes(zoneHighway)) ||
      (s.from_node && s.from_node.toLowerCase().includes(zoneHighway)) ||
      (s.to_node && s.to_node.toLowerCase().includes(zoneHighway))
    );

    // 2. Specific Route Logic Mapping for North East Corridors
    if ((activeOrigin.includes('guwahati') || activeWaypoints.includes('guwahati')) && 
        (activeDest.includes('silchar') || activeDest.includes('aizawl') || activeDest.includes('agartala') || activeWaypoints.includes('silchar'))) {
      return zone.id === 'ZONE_SONAPUR_NH6' || zone.id === 'ZONE_MAHASADAK_NH27';
    }
    if (activeDest.includes('tawang') || activeOrigin.includes('dirang') || activeOrigin.includes('bomdila') || activeWaypoints.includes('tawang') || activeWaypoints.includes('dirang')) {
      return zone.id === 'ZONE_SELA_PASS_NH13';
    }
    if (activeDest.includes('gangtok') || activeOrigin.includes('siliguri') || activeWaypoints.includes('gangtok') || activeWaypoints.includes('siliguri')) {
      return zone.id === 'ZONE_TEESTA_NH10' || zone.id === 'ZONE_NATHULA_SH3';
    }
    if (activeOrigin.includes('dimapur') || activeDest.includes('imphal') || activeDest.includes('kohima') || activeDest.includes('moreh') || activeWaypoints.includes('kohima') || activeWaypoints.includes('imphal')) {
      return zone.id === 'ZONE_PAGLA_PAHAR_NH29' || zone.id === 'ZONE_LOKCHAO_NH102';
    }
    if (activeOrigin.includes('aizawl') || activeDest.includes('lunglei') || activeWaypoints.includes('aizawl') || activeWaypoints.includes('lunglei')) {
      return zone.id === 'ZONE_BUALPUI_NH54';
    }

    // 3. Proximity to Polyline (< 45 km)
    const isNearPolyline = polylineCoords.some(pt => Math.hypot(pt[0] - zone.lat, pt[1] - zone.lng) < 0.45);

    return isHighwayOnRoute || isNearPolyline;
  });

  // Check if a zone is currently blocked
  const isZoneBlocked = (zone) => {
    return activeIncidents.some(inc => {
      const matchRoad = inc.roadName?.toLowerCase().includes(zone.highway.split(' ')[0].toLowerCase());
      const matchLandmark = zone.name.toLowerCase().includes((inc.landmark || '').toLowerCase().split(' ')[0]) ||
                            (inc.landmark && inc.landmark.toLowerCase().includes(zone.name.toLowerCase().split(' ')[0]));
      const dist = Math.hypot(inc.lat - zone.lat, inc.lng - zone.lng);
      return (matchRoad || matchLandmark || dist < 0.15) && inc.status !== 'OFFICIAL_CLEARED' && (inc.clearancePercent === undefined || inc.clearancePercent < 100);
    });
  };

  // Toggle Zone Roadblock & Recalculate Detour
  const handleToggleZone = (zone) => {
    const currentlyBlocked = isZoneBlocked(zone);
    let updated;

    if (currentlyBlocked) {
      // Clear this roadblock
      updated = activeIncidents.map(inc => {
        const match = inc.roadName?.includes(zone.highway.split(' ')[0]) || 
                      (inc.landmark && zone.name.includes(inc.landmark.split(' ')[0])) ||
                      (inc.dangerKey && inc.dangerKey === zone.id.replace('ZONE_', ''));
        if (match) {
          return { ...inc, status: 'OFFICIAL_CLEARED', clearancePercent: 100, verified: true };
        }
        return inc;
      });
      if (onIncidentToggle) onIncidentToggle(updated);
      setAiMessage(`✓ ${zone.name} cleared. AI restored primary route for ${activeConvoy.vehicleId}.`);
    } else {
      // Create / activate this roadblock
      const dangerKey = zone.id.replace('ZONE_', '');
      const roadName = zone.highway.split(' ')[0];
      const newInc = {
        id: `INC-${dangerKey}-${Date.now().toString().slice(-4)}`,
        hazardType: zone.dangerType,
        roadName: roadName,
        landmark: zone.name,
        dangerKey: dangerKey,
        lat: zone.lat,
        lng: zone.lng,
        severity: zone.severity,
        status: 'OFFICIAL_VERIFIED',
        verified: true,
        clearancePercent: 15,
        reportedBy: `BRO Task Force / ${currentUser?.name || 'Chief Inspector'}`,
        timestamp: new Date().toLocaleTimeString(),
        description: zone.description
      };

      const filtered = activeIncidents.filter(i => i.id !== newInc.id && i.dangerKey !== dangerKey);
      updated = [newInc, ...filtered];
      if (onIncidentToggle) onIncidentToggle(updated);

      setAiMessage(`🚨 Roadblock Triggered on ${zone.name}. ${zone.detourSummary}`);
      if (onFlyToLocation) onFlyToLocation([zone.lat, zone.lng], 12);
    }

    // Recalculate route for the selected convoy immediately with the updated incident list
    const orig = activeConvoy.origin || 'Guwahati';
    const dest = activeConvoy.destination || 'Silchar';
    const mode = activeConvoy.type === 'CARGO_DRONE' ? 'DRONE' : activeConvoy.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
    if (onQuickRoutePlan) {
      onQuickRoutePlan(orig, dest, mode, currentUser, updated);
    }
  };

  // Ask AI Assistant
  const handleAskAI = (promptText) => {
    setIsAiThinking(true);
    setTimeout(() => {
      setIsAiThinking(false);
      if (promptText.toLowerCase().includes('safe') || promptText.toLowerCase().includes('route')) {
        const blockedCount = activeIncidents.filter(i => i.status !== 'OFFICIAL_CLEARED' && i.verified).length;
        if (blockedCount > 0) {
          setAiMessage(`⚠️ Advisory: ${blockedCount} verified blockage(s) active on network. ${activeConvoy.vehicleId} is detouring safely.`);
        } else {
          setAiMessage(`🟢 All Clear: Corridor ${activeConvoy.origin} ➔ ${activeConvoy.destination} is certified nominal by BRO.`);
        }
      } else if (promptText.toLowerCase().includes('monsoon') || promptText.toLowerCase().includes('weather')) {
        setAiMessage(`🌧️ Weather Radar: 24h Rainfall: 42mm in foothills. High moisture on grades.`);
      } else if (promptText.toLowerCase().includes('cold') || promptText.toLowerCase().includes('vaccine')) {
        setAiMessage(`❄️ Cold-Chain: Reefer holding +4.2°C (Nominal Range +2°C to +8°C). Safe.`);
      } else {
        setAiMessage(`🤖 AI Copilot: Monitoring convoy telemetry. Transponder online.`);
      }
    }, 400);
  };

  return (
    <aside aria-label="AI Mission Simulator" className="fixed bottom-3 right-4 z-40 select-none font-sans pointer-events-auto">
      {!isExpanded ? (
        /* 1. Sleek Compact Trigger Orb */
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-cyan-950/90 via-indigo-950/90 to-purple-950/90 hover:from-cyan-900 hover:to-purple-900 text-white font-bold text-xs px-3.5 py-2 rounded-2xl shadow-2xl border border-cyan-400/40 backdrop-blur-2xl flex items-center space-x-2 transition active:scale-95 group ring-1 ring-white/10"
          title="Open AI Mission Simulator & Route Sensitive Zones"
        >
          <div className="w-5 h-5 rounded-lg bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 animate-pulse" />
          </div>
          <span className="text-xs font-bold text-white">
            AI Copilot & Sensitive Zones
          </span>
          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-cyan-400/30 font-bold">
            {routeSpecificSensitiveZones.length} on Route
          </span>
        </button>
      ) : (
        /* 2. Fitted, Non-Overflowing Floating Card */
        <div className="w-[92vw] sm:w-[520px] max-w-[520px] max-h-[72vh] flex flex-col rounded-3xl p-3.5 shadow-2xl border border-cyan-400/40 backdrop-blur-2xl bg-[#080d1ef8] animate-fadeIn transition-all">
          
          {/* Header Bar with Convoy Selector */}
          <div className="border-b border-white/[0.08] pb-2.5 space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-cyan-500/30">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white tracking-tight">
                    AI MISSION COPILOT & SMART SIMULATOR
                  </h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Route: <strong className="text-cyan-300">{activeConvoy.origin} ➔ {activeConvoy.destination}</strong>
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                {/* Tab Switcher */}
                <div className="flex items-center bg-zinc-950/80 p-0.5 rounded-xl border border-white/[0.08] text-[10px] font-bold">
                  <button
                    onClick={() => setActiveTab('zones')}
                    className={`px-2 py-1 rounded-lg transition ${
                      activeTab === 'zones' ? 'bg-cyan-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Route Zones ({routeSpecificSensitiveZones.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('copilot')}
                    className={`px-2 py-1 rounded-lg transition ${
                      activeTab === 'copilot' ? 'bg-cyan-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    AI Copilot
                  </button>
                  <button
                    onClick={() => setActiveTab('coldchain')}
                    className={`px-2 py-1 rounded-lg transition ${
                      activeTab === 'coldchain' ? 'bg-cyan-600 text-white shadow-sm' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Cold Chain
                  </button>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
                  title="Minimize"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* 🚛 1-CLICK ACTIVE CONVOY SWITCHER BAR */}
            <div className="bg-zinc-950/90 px-3 py-1.5 rounded-2xl border border-white/[0.08] flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2">
                <Truck className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] text-zinc-400 font-semibold">Select Convoy Mission:</span>
              </div>
              <select
                value={selectedVehicleId}
                onChange={(e) => handleSelectConvoyOption(e.target.value)}
                className="bg-transparent text-cyan-300 font-bold text-xs focus:outline-none cursor-pointer font-mono"
              >
                {fleetVehicles.map(v => (
                  <option key={v.vehicleId} value={v.vehicleId} className="bg-zinc-900 text-white">
                    {v.vehicleId} ({v.origin} ➔ {v.destination})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto pr-1 pt-2 space-y-2.5">
            
            {/* AI Advisory Banner */}
            {aiMessage && (
              <div className="bg-cyan-950/80 border border-cyan-500/40 p-2 rounded-2xl text-[11px] text-cyan-200 flex items-start justify-between gap-2 animate-fadeIn">
                <div className="flex items-start space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5 animate-pulse" />
                  <span className="leading-snug">{aiMessage}</span>
                </div>
                <button onClick={() => setAiMessage(null)} className="text-zinc-400 hover:text-white text-xs">✕</button>
              </div>
            )}

            {/* TAB 1: 🏔️ SENSITIVE ZONES SPECIFIC TO THIS CONVOY'S ROUTE */}
            {activeTab === 'zones' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] px-0.5">
                  <span className="text-zinc-400 font-semibold">
                    Sensitive Bottlenecks on <strong className="text-white">{activeConvoy.origin} ➔ {activeConvoy.destination}</strong>:
                  </span>
                  <button
                    onClick={() => {
                      if (onClearAllRoadblocks) onClearAllRoadblocks();
                      setAiMessage(`✓ All sensitive zones along ${activeConvoy.origin} ➔ ${activeConvoy.destination} cleared.`);
                    }}
                    className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Clear Route</span>
                  </button>
                </div>

                {routeSpecificSensitiveZones.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {routeSpecificSensitiveZones.map(zone => {
                      const blocked = isZoneBlocked(zone);

                      return (
                        <div
                          key={zone.id}
                          className={`p-2.5 rounded-2xl border transition-all flex flex-col justify-between space-y-1.5 ${
                            blocked 
                              ? 'bg-rose-950/40 border-rose-500/60 shadow-sm' 
                              : 'bg-zinc-950/60 border-white/[0.08] hover:border-cyan-500/30'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1">
                            <div className="flex items-start space-x-1.5">
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                                blocked ? 'bg-rose-500/20 text-rose-400' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {blocked ? <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> : <Mountain className="w-3.5 h-3.5" />}
                              </div>
                              <div>
                                <span className="text-xs font-bold text-white leading-tight block">
                                  {zone.name}
                                </span>
                                <span className="text-[10px] text-zinc-400 font-mono block">
                                  {zone.highway} • {zone.elevation}
                                </span>
                              </div>
                            </div>

                            <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full font-black shrink-0 ${
                              blocked ? 'bg-rose-900 text-rose-200 border border-rose-600' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            }`}>
                              {blocked ? 'BLOCKED' : 'CLEAR'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                            <span className="text-[9px] text-zinc-400 truncate max-w-[130px]">
                              {zone.dangerType} Risk
                            </span>

                            <button
                              onClick={() => handleToggleZone(zone)}
                              className={`text-[9px] font-black px-2.5 py-1 rounded-lg transition active:scale-95 flex items-center space-x-1 ${
                                blocked 
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white' 
                                  : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 text-white shadow-sm'
                              }`}
                            >
                              <Zap className="w-2.5 h-2.5" />
                              <span>{blocked ? "Clear Road" : "Trigger Landslide"}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-zinc-950/80 p-3 rounded-2xl border border-white/[0.06] text-center text-xs text-zinc-400 space-y-1">
                    <CheckCircle2 className="w-5 h-5 mx-auto text-emerald-400" />
                    <p className="text-white font-semibold">0 Critical Sensitive Bottlenecks on this corridor</p>
                    <p className="text-[10px] text-zinc-500">Highway strata is certified stable. No major high-risk mountain choke points.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: 🤖 AI MISSION COPILOT */}
            {activeTab === 'copilot' && (
              <div className="space-y-2 text-xs">
                <div className="bg-zinc-950/80 p-2.5 rounded-2xl border border-white/[0.08] space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold text-cyan-300 text-xs">
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Live Mission Telemetry for {activeConvoy.vehicleId}:</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-relaxed font-sans">
                    Tracking <strong className="text-white">{activeConvoy.vehicleId}</strong> ({activeConvoy.origin} ➔ {activeConvoy.destination}).
                    Dijkstra AI continuously monitors terrain stability across {activeSegments.length} route segments.
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">
                    Quick AI Inquiries:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => handleAskAI("Is the current route safe?")}
                      className="bg-zinc-900 hover:bg-zinc-800 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition active:scale-95"
                    >
                      🔍 Route Safety?
                    </button>
                    <button
                      onClick={() => handleAskAI("Assess monsoon flood risk")}
                      className="bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition active:scale-95"
                    >
                      🌧️ Monsoon Radar
                    </button>
                    <button
                      onClick={() => handleAskAI("Check vaccine cold-chain status")}
                      className="bg-zinc-900 hover:bg-zinc-800 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-xl text-[10px] font-semibold transition active:scale-95"
                    >
                      ❄️ Cold-Chain Temp
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: ❄️ COLD CHAIN SIMULATOR */}
            {activeTab === 'coldchain' && (
              <div className="space-y-2 text-xs">
                <div className="bg-zinc-950/80 p-2.5 rounded-2xl border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">Vaccine Reefer Status</span>
                    <span className="text-[10px] text-zinc-400 font-mono">Payload: Critical Medical Relief</span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-mono font-black text-emerald-400">+4.2°C</span>
                    <span className="text-[8px] text-zinc-500 block font-mono">Safe (+2°C to +8°C)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => {
                      if (onSimulateColdBreach) onSimulateColdBreach();
                      setAiMessage("🚨 EMERGENCY: Vaccine container failure (+9.8°C). Drone Airlift Rescue triggered.");
                    }}
                    className="bg-gradient-to-r from-rose-700 to-red-800 hover:from-rose-600 text-white font-bold text-[11px] p-2.5 rounded-2xl shadow flex flex-col items-center justify-center space-y-0.5 transition active:scale-95 border border-rose-500/40"
                  >
                    <Thermometer className="w-4 h-4 text-rose-200 animate-pulse" />
                    <span>Simulate Failure</span>
                    <span className="text-[9px] text-rose-300/80 font-normal">Triggers +9.8°C</span>
                  </button>

                  <button
                    onClick={() => {
                      setAiMessage("✓ Container reefer unit normalized to +3.8°C. Cargo safe.");
                    }}
                    className="bg-gradient-to-r from-cyan-700 to-blue-800 hover:from-cyan-600 text-white font-bold text-[11px] p-2.5 rounded-2xl shadow flex flex-col items-center justify-center space-y-0.5 transition active:scale-95 border border-cyan-500/40"
                  >
                    <CheckCircle2 className="w-4 h-4 text-cyan-200" />
                    <span>Normalize Temp</span>
                    <span className="text-[9px] text-cyan-300/80 font-normal">Restores +3.8°C</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  );
}
