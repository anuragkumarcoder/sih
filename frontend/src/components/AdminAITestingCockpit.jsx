import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, Bot, Zap, AlertTriangle, Snowflake, CloudRain, 
  CheckCircle2, Compass, ArrowRight, Truck, RefreshCw, Flame, 
  Thermometer, Activity, Eye, Navigation
} from 'lucide-react';

export default function AdminAITestingCockpit({
  currentUser,
  fleetVehicles = [],
  activeIncidents = [],
  plannedRoute,
  onQuickRoutePlan,
  onIncidentToggle,
  onNavigateToMap
}) {
  // 1. RBAC Guard: Rendered exclusively for Admin role
  if (currentUser?.role !== 'ROLE_ADMIN') {
    return null;
  }

  const [selectedVehicleId, setSelectedVehicleId] = useState(fleetVehicles[0]?.vehicleId || 'NER-TRUCK-AS01-9921');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simReport, setSimReport] = useState(null);

  const selectedConvoy = fleetVehicles.find(v => v.vehicleId === selectedVehicleId) || fleetVehicles[0] || {
    vehicleId: 'NER-TRUCK-AS01-9921',
    driverName: 'Biren Gogoi',
    origin: 'Guwahati',
    destination: 'Silchar',
    type: 'HEAVY_COMMERCIAL'
  };

  // Determine route-specific sensitive zones based on selected convoy
  const getRouteSensitiveZones = (origin, destination) => {
    const orig = origin.toLowerCase();
    const dest = destination.toLowerCase();

    if (dest.includes('silchar') || orig.includes('guwahati') || dest.includes('aizawl')) {
      return [
        {
          id: 'ZONE_SONAPUR_NH6',
          name: 'Sonapur Mudslide Zone / Tunnel',
          highway: 'NH-6 (Meghalaya ➔ Assam)',
          elevation: '1,120m',
          dangerType: 'LANDSLIDE',
          severity: 'CRITICAL',
          detour: 'NH-206 Dawki River Bypass',
          savedHours: 4.5
        },
        {
          id: 'ZONE_MAHASADAK_NH27',
          name: 'Jatinga Hills Mahasadak',
          highway: 'NH-27 (Haflong ➔ Silchar)',
          elevation: '960m',
          dangerType: 'SHALE_SUBSIDENCE',
          severity: 'HIGH',
          detour: 'Lumding Rail Transshipment Siding',
          savedHours: 3.5
        }
      ];
    } else if (dest.includes('tawang') || orig.includes('dirang') || orig.includes('bomdila')) {
      return [
        {
          id: 'ZONE_SELA_PASS_NH13',
          name: 'Sela Pass High-Altitude Corridor',
          highway: 'NH-13 (Arunachal Pradesh)',
          elevation: '4,170m',
          dangerType: 'ROCKFALL_BLIZZARD',
          severity: 'CRITICAL',
          detour: 'Sangti Valley 4x4 Track',
          savedHours: 6.0
        }
      ];
    } else if (dest.includes('gangtok') || orig.includes('siliguri')) {
      return [
        {
          id: 'ZONE_TEESTA_NH10',
          name: 'Teesta River Gorge Corridor',
          highway: 'NH-10 (Siliguri ➔ Gangtok)',
          elevation: '420m',
          dangerType: 'FLASH_FLOOD_EROSION',
          severity: 'CRITICAL',
          detour: 'Lava & Gorubathan (NH-717A)',
          savedHours: 5.0
        }
      ];
    } else if (dest.includes('kohima') || orig.includes('dimapur') || dest.includes('imphal')) {
      return [
        {
          id: 'ZONE_PAGLA_PAHAR_NH29',
          name: 'Pagla Pahar Landslide Gorge',
          highway: 'NH-29 (Dimapur ➔ Kohima)',
          elevation: '1,260m',
          dangerType: 'LANDSLIDE_SINKHOLE',
          severity: 'HIGH',
          detour: 'Peducha / Zubza Bypass',
          savedHours: 3.0
        }
      ];
    }
    return [];
  };

  const sensitiveZones = getRouteSensitiveZones(selectedConvoy.origin, selectedConvoy.destination);

  // Check if any zone on this route is currently blocked
  const isZoneBlocked = (zone) => {
    return activeIncidents.some(inc => {
      const matchRoad = inc.roadName?.toLowerCase().includes(zone.highway.split(' ')[0].toLowerCase());
      const matchLandmark = zone.name.toLowerCase().includes((inc.landmark || '').toLowerCase().split(' ')[0]) ||
                            (inc.landmark && inc.landmark.toLowerCase().includes(zone.name.toLowerCase().split(' ')[0]));
      return (matchRoad || matchLandmark) && inc.status !== 'OFFICIAL_CLEARED' && (inc.clearancePercent === undefined || inc.clearancePercent < 100);
    });
  };

  // Weather & Freezing Diagnostics
  const isSubZero = selectedConvoy.destination.toLowerCase().includes('tawang') || (selectedConvoy.altitude || 0) > 3000;
  const currentRainfall = 42.0; // mm

  // 1-Click Simulate & Recalibrate AI Path Action
  const handleSimulateAndRecalibrate = () => {
    setIsSimulating(true);

    setTimeout(() => {
      if (sensitiveZones.length > 0) {
        const targetZone = sensitiveZones[0];
        const currentlyBlocked = isZoneBlocked(targetZone);
        let updated;

        if (currentlyBlocked) {
          // Clear it
          updated = activeIncidents.map(inc => {
            if (inc.roadName?.includes(targetZone.highway.split(' ')[0]) || 
                (inc.landmark && targetZone.name.includes(inc.landmark.split(' ')[0])) ||
                (inc.dangerKey && inc.dangerKey === targetZone.id.replace('ZONE_', ''))) {
              return { ...inc, status: 'OFFICIAL_CLEARED', clearancePercent: 100, verified: true };
            }
            return inc;
          });
          if (onIncidentToggle) onIncidentToggle(updated);
          setSimReport({
            type: 'RESTORED',
            title: `✓ Obstacle Cleared: ${targetZone.name}`,
            message: `Expressway restored. AI Dijkstra pathfinder recalculated primary highway route for ${selectedConvoy.vehicleId}.`
          });
        } else {
          // Trigger obstacle
          const dangerKey = targetZone.id.replace('ZONE_', '');
          const newInc = {
            id: `INC-SIM-${Date.now().toString().slice(-4)}`,
            hazardType: targetZone.dangerType,
            roadName: targetZone.highway.split(' ')[0],
            landmark: targetZone.name,
            dangerKey: dangerKey,
            lat: targetZone.lat,
            lng: targetZone.lng,
            severity: targetZone.severity,
            status: 'OFFICIAL_VERIFIED',
            verified: true,
            clearancePercent: 15,
            reportedBy: `Admin AI Testing Assistant / ${currentUser?.name || 'Admin'}`,
            timestamp: new Date().toLocaleTimeString(),
            description: `Admin-simulated high-volume landslide on ${targetZone.highway}.`
          };

          const filtered = activeIncidents.filter(i => i.id !== newInc.id && i.dangerKey !== dangerKey);
          updated = [newInc, ...filtered];
          if (onIncidentToggle) onIncidentToggle(updated);

          setSimReport({
            type: 'DETOUR',
            title: `🚨 Roadblock Simulated: ${targetZone.name}`,
            message: `AI NetworkX Optimizer engaged: Successfully diverted ${selectedConvoy.vehicleId} via ${targetZone.detour} (Saved ${targetZone.savedHours}h delay).`
          });
        }

        // Fire Python route optimizer with the newly updated incidents
        const mode = selectedConvoy.type === 'CARGO_DRONE' ? 'DRONE' : selectedConvoy.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
        if (onQuickRoutePlan) {
          onQuickRoutePlan(selectedConvoy.origin, selectedConvoy.destination, mode, currentUser, updated);
        }
      }
      setIsSimulating(false);
    }, 600);
  };

  return (
    <div className="liquid-glass rounded-3xl p-5 border border-purple-500/40 shadow-2xl space-y-4 font-sans select-none bg-gradient-to-br from-[#0c0d1f] via-[#090b16] to-[#0d0718]">
      
      {/* 1. Header Bar with RBAC Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 via-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-purple-600/30 ring-1 ring-white/20">
            <Bot className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                ADMIN AI TESTING & SIMULATION COCKPIT
              </h3>
              <span className="bg-purple-950 text-purple-300 border border-purple-700 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase">
                RESTRICTED: ROLE_ADMIN
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Live NetworkX graph impedance diagnostics & 1-click mountain detour recalibration
            </p>
          </div>
        </div>

        {/* Convoy Selector Dropdown */}
        <div className="flex items-center space-x-2 bg-zinc-950/90 px-3.5 py-2 rounded-2xl border border-purple-500/40 shadow-sm">
          <Truck className="w-4 h-4 text-purple-400" />
          <span className="text-xs text-zinc-400 font-semibold">Test Convoy:</span>
          <select
            value={selectedVehicleId}
            onChange={(e) => {
              setSelectedVehicleId(e.target.value);
              const found = fleetVehicles.find(v => v.vehicleId === e.target.value);
              if (found && onQuickRoutePlan) {
                const mode = found.type === 'CARGO_DRONE' ? 'DRONE' : found.type === 'OFFROAD_4X4' ? '4X4' : 'TRUCK';
                onQuickRoutePlan(found.origin, found.destination, mode);
              }
            }}
            className="bg-transparent text-purple-300 font-bold text-xs focus:outline-none cursor-pointer font-mono"
          >
            {fleetVehicles.map(v => (
              <option key={v.vehicleId} value={v.vehicleId} className="bg-zinc-900 text-white">
                {v.vehicleId} ({v.origin} ➔ {v.destination})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Simulation Success Alert */}
      {simReport && (
        <div className={`p-3 rounded-2xl border text-xs flex items-start justify-between gap-2 animate-fadeIn ${
          simReport.type === 'DETOUR'
            ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
            : 'bg-emerald-950/80 border-emerald-500/50 text-emerald-200'
        }`}>
          <div className="flex items-start space-x-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <strong className="block font-black">{simReport.title}</strong>
              <span className="leading-relaxed">{simReport.message}</span>
            </div>
          </div>
          <button onClick={() => setSimReport(null)} className="text-zinc-400 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* 3. Real-Time Diagnostic Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        
        {/* Panel A: Intersecting Sensitive Mountain Zones */}
        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/[0.08] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Intersecting Sensitive Zones</span>
            </span>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {sensitiveZones.length} Identified
            </span>
          </div>

          <div className="space-y-2">
            {sensitiveZones.length > 0 ? (
              sensitiveZones.map(z => {
                const blocked = isZoneBlocked(z);
                return (
                  <div key={z.id} className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                    blocked ? 'bg-rose-950/50 border-rose-500/60 text-rose-200' : 'bg-zinc-900/60 border-white/[0.06] text-zinc-300'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white">{z.name}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-black ${
                        blocked ? 'bg-rose-900 text-rose-200' : 'bg-emerald-950 text-emerald-300'
                      }`}>
                        {blocked ? 'BLOCKED' : 'CLEAR'}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {z.highway} • Elevation: {z.elevation}
                    </div>
                    <div className="text-[10px] text-cyan-300 font-sans">
                      Detour: <strong className="text-white">{z.detour}</strong> (Saves {z.savedHours}h)
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-zinc-400">
                0 Critical sensitive bottlenecks along this plains corridor.
              </div>
            )}
          </div>
        </div>

        {/* Panel B: Thermal & Freezing Diagnostics */}
        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/[0.08] space-y-2.5">
          <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
            <Thermometer className="w-4 h-4 text-purple-400" />
            <span>Thermal & Freezing Flags</span>
          </span>

          <div className="space-y-2 text-xs">
            <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-zinc-400 block text-[11px]">Cold-Chain Reefer Payload</span>
                <span className="text-white font-bold text-xs">Vaccines & Life-Science</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-black text-emerald-400">+4.2°C</span>
                <span className="text-[9px] text-zinc-500 block">Safe Range (+2°C to +8°C)</span>
              </div>
            </div>

            <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-white/[0.06] flex items-center justify-between">
              <div>
                <span className="text-zinc-400 block text-[11px]">Alpine Road Temperature</span>
                <span className="text-white font-bold text-xs">{isSubZero ? 'High-Altitude Pass' : 'Lowland Valley'}</span>
              </div>
              <div className="text-right">
                <span className={`text-sm font-mono font-black ${isSubZero ? 'text-cyan-300' : 'text-amber-400'}`}>
                  {isSubZero ? '-4.5°C' : '+18.0°C'}
                </span>
                <span className="text-[9px] text-zinc-500 block">
                  {isSubZero ? '⚠️ Black Ice Alert' : 'Normal Friction'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel C: 1-Click Simulation Control & Map Jump */}
        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-purple-500/30 flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>AI Path Recalibration Engine</span>
            </span>
            <p className="text-[11px] text-zinc-400 leading-snug">
              Fires the Python NetworkX optimizer to dynamically re-evaluate graph edge weights (+99,999.0 penalty) and morph the route polyline in real time.
            </p>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleSimulateAndRecalibrate}
              disabled={isSimulating}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-black text-xs py-3 px-4 rounded-2xl shadow-xl shadow-purple-600/30 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              <span>{isSimulating ? 'Calculating NetworkX Detour...' : '⚡ Simulate & Recalibrate AI Path'}</span>
            </button>

            {onNavigateToMap && (
              <button
                onClick={onNavigateToMap}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-cyan-300 text-xs font-bold py-2 rounded-xl border border-white/[0.08] flex items-center justify-center space-x-1.5 transition"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Route on Operations Map</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
