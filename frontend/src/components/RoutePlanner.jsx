import React, { useState, useEffect } from 'react';
import { 
  Navigation, ShieldAlert, Sparkles, CheckCircle2, 
  AlertTriangle, Fuel, Clock, ArrowRight, Mountain,
  Zap, CloudRain, Cpu, Radio, ChevronRight, Truck, Plane, Gauge,
  ShieldCheck, AlertOctagon, HelpCircle, MapPin, Signal, Moon, Camera,
  Coffee, Shield, Car, BatteryCharging, Search
} from 'lucide-react';
import { NER_TOPOLOGY_LOCATIONS } from '../data/mockMasterData';
import { optimizeRouteApi } from '../services/api';
import { calculateTacticalRoute } from '../utils/nerRoutingEngine';
import ElevationProfile from './ElevationProfile';
import { formatDistance, formatDuration, formatElevation, formatPercent, formatWeight, formatGrade } from '../utils/formatters';

export default function RoutePlanner({ 
  onRouteCalculated, 
  activeIncidents 
}) {
  const [origin, setOrigin] = useState('Guwahati');
  const [destination, setDestination] = useState('Tawang');
  const [originSearch, setOriginSearch] = useState(null);
  const [isOriginOpen, setIsOriginOpen] = useState(false);
  const [destSearch, setDestSearch] = useState(null);
  const [isDestOpen, setIsDestOpen] = useState(false);

  const [vehicleType, setVehicleType] = useState('HEAVY_COMMERCIAL');
  const [cargoWeight, setCargoWeight] = useState(3500);
  const [rainfallMm, setRainfallMm] = useState(85);
  const [avoidPasses, setAvoidPasses] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);
  const [loading, setLoading] = useState(false);

  const [routeResult, setRouteResult] = useState(null);

  const vehicleOptions = [
    {
      id: "HEAVY_COMMERCIAL",
      title: "Heavy Multi-Axle Truck (16T+)",
      icon: <Truck className="w-5 h-5 text-cyan-400" />,
      desc: "Bulk cargo & freight. Sensitive to steep incline (>8% slope) and rockfalls.",
      tag: "Highway Freight"
    },
    {
      id: "MEDIUM_COMMERCIAL",
      title: "Medium 6-Wheeler (7.5T)",
      icon: <Truck className="w-5 h-5 text-emerald-400" />,
      desc: "Standard hill cargo transport. Agile on mountain passes up to 10% slope.",
      tag: "All-Terrain Standard"
    },
    {
      id: "OFFROAD_4X4",
      title: "Offroad 4x4 Emergency Fleet",
      icon: <Car className="w-5 h-5 text-amber-400" />,
      desc: "High ground clearance. Certified to pass single-lane mudslides and rockfalls.",
      tag: "Disaster Ready"
    },
    {
      id: "CARGO_DRONE",
      title: "Autonomous Cargo Drone",
      icon: <Plane className="w-5 h-5 text-purple-400" />,
      desc: "Critical medicine & vaccine aerial transport. 100% bypass of ground roadblocks.",
      tag: "Aerial Corridor"
    }
  ];

  const handleComputeRoute = async (forcedType = null) => {
    setLoading(true);
    const currentVehType = forcedType || vehicleType;

    // 1. Instant calculation of primary safe detour & standard alternative
    const tactical = calculateTacticalRoute({
      originName: origin,
      destinationName: destination,
      vehicleType: currentVehType,
      activeIncidents: activeIncidents
    });

    const standardAlt = calculateTacticalRoute({
      originName: origin,
      destinationName: destination,
      vehicleType: currentVehType,
      activeIncidents: [] // Baseline without roadblocks for comparison
    });

    const fallbackResult = {
      status: "SUCCESS",
      origin_name: origin,
      destination_name: destination,
      recommended_route: tactical,
      alternative_routes: [standardAlt],
      weather_summary: {
        rainfall_24h_mm: Number(rainfallMm),
        is_monsoon_active: rainfallMm > 50,
        regional_humidity: "86% (Mountain Cloud Cover)"
      },
      active_hazard_count: activeIncidents.length
    };

    setRouteResult(fallbackResult);

    const originObj = NER_TOPOLOGY_LOCATIONS.find(n => n.name === origin);
    const destObj = NER_TOPOLOGY_LOCATIONS.find(n => n.name === destination);

    const payload = {
      origin: {
        lat: originObj ? originObj.lat : 26.1445,
        lng: originObj ? originObj.lng : 91.7362,
        name: origin
      },
      destination: {
        lat: destObj ? destObj.lat : 27.5861,
        lng: destObj ? destObj.lng : 91.8653,
        name: destination
      },
      vehicle_type: currentVehType,
      cargo_weight_kg: Number(cargoWeight),
      is_emergency_relief: isEmergency,
      weather: {
        rainfall_24h_mm: Number(rainfallMm),
        is_monsoon_active: rainfallMm > 50
      },
      active_incidents: activeIncidents.map(inc => ({
        incident_id: inc.id,
        hazard_type: inc.hazardType,
        severity: inc.severity,
        location: { lat: inc.lat, lng: inc.lng },
        impact_radius_km: 10.0,
        passable_by_4x4: inc.passableBy4x4
      })),
      avoid_high_altitude_passes: avoidPasses
    };

    try {
      const data = await optimizeRouteApi(payload);
      if (data && data.recommended_route && data.recommended_route.segments?.length > 0) {
        setRouteResult(data);
      }
    } catch (e) {
      // Kept fallbackResult
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehId) => {
    setVehicleType(vehId);
    if (routeResult) {
      handleComputeRoute(vehId);
    }
  };

  const handleViewOnMap = () => {
    if (routeResult && routeResult.recommended_route && onRouteCalculated) {
      onRouteCalculated(routeResult.recommended_route, routeResult.alternative_routes?.[0] || null);
    }
  };

  const recRoute = routeResult?.recommended_route;
  const altRoute = routeResult?.alternative_routes?.[0];

  return (
    <div className="space-y-6">
      {/* Route Setup Card */}
      <div className="saas-card rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">AI Terrain & Travel Itinerary Planner</h2>
              <p className="text-xs text-zinc-400">Generates travel-friendly itineraries with road quality, fuel stops, and mountain pass risk analysis</p>
            </div>
          </div>
          <span className="bg-zinc-950 text-emerald-400 font-mono text-xs px-3 py-1 rounded-full border border-white/[0.08] font-semibold">
            SIH26002 Travel Engine
          </span>
        </div>

        {/* 1. Origin & Destination Searchable Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Searchable Origin */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2 relative">
            <span className="text-[11px] font-semibold text-emerald-400 block uppercase tracking-wider">
              1. Departure Point / Origin
            </span>
            <div className="relative">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-semibold flex items-center justify-between focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/40">
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
                  placeholder="Type to search origin city..."
                  className="w-full bg-transparent text-white font-semibold text-xs focus:outline-none"
                />
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              </div>

              {isOriginOpen && (
                <div className="absolute top-full mt-1.5 left-0 right-0 max-h-56 overflow-y-auto bg-zinc-950 rounded-2xl p-1.5 shadow-2xl border border-emerald-500/40 z-50 space-y-1 backdrop-blur-xl">
                  {NER_TOPOLOGY_LOCATIONS.filter(n => {
                    if (!originSearch) return true;
                    const q = originSearch.toLowerCase();
                    return n.name.toLowerCase().includes(q) || n.state.toLowerCase().includes(q);
                  }).map(n => (
                    <button
                      key={n.name}
                      onClick={() => {
                        setOrigin(n.name);
                        setOriginSearch(null);
                        setIsOriginOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs transition flex items-center justify-between ${
                        origin === n.name ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'hover:bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <span className="font-semibold">{n.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono">{n.state} • {formatElevation(n.elevation)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Searchable Destination */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2 relative">
            <span className="text-[11px] font-semibold text-cyan-400 block uppercase tracking-wider">
              2. Destination Logistics Hub
            </span>
            <div className="relative">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-semibold flex items-center justify-between focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500/40">
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
                  placeholder="Type to search destination city..."
                  className="w-full bg-transparent text-white font-semibold text-xs focus:outline-none"
                />
                <Search className="w-4 h-4 text-zinc-500 shrink-0" />
              </div>

              {isDestOpen && (
                <div className="absolute top-full mt-1.5 left-0 right-0 max-h-56 overflow-y-auto bg-zinc-950 rounded-2xl p-1.5 shadow-2xl border border-cyan-500/40 z-50 space-y-1 backdrop-blur-xl">
                  {NER_TOPOLOGY_LOCATIONS.filter(n => {
                    if (!destSearch) return true;
                    const q = destSearch.toLowerCase();
                    return n.name.toLowerCase().includes(q) || n.state.toLowerCase().includes(q);
                  }).map(n => (
                    <button
                      key={n.name}
                      onClick={() => {
                        setDestination(n.name);
                        setDestSearch(null);
                        setIsDestOpen(false);
                      }}
                      className={`w-full px-3 py-2 rounded-xl text-left text-xs transition flex items-center justify-between ${
                        destination === n.name ? 'bg-cyan-500/20 text-cyan-300 font-bold' : 'hover:bg-zinc-900 text-zinc-300'
                      }`}
                    >
                      <span className="font-semibold">{n.name}</span>
                      <span className="text-[11px] text-zinc-400 font-mono">{n.state} • {formatElevation(n.elevation)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 2. Fleet Vehicle Selector Cards */}
        <div>
          <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block mb-3">
            3. Vehicle Type & Hill Climbing Class
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {vehicleOptions.map(veh => (
              <div
                key={veh.id}
                onClick={() => handleSelectVehicle(veh.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  vehicleType === veh.id
                    ? 'bg-zinc-900/90 border-emerald-500/80 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/40'
                    : 'bg-zinc-950/80 border-white/[0.06] hover:border-white/[0.12]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center border border-white/[0.06]">
                    {veh.icon}
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 border border-white/[0.06] font-medium">
                    {veh.tag}
                  </span>
                </div>
                <div className="font-semibold text-xs text-white mb-1">{veh.title}</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{veh.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Sliders & Action Button */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950 p-4 rounded-2xl border border-white/[0.06]">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium flex items-center space-x-1.5">
                <CloudRain className="w-3.5 h-3.5 text-cyan-400" />
                <span>24h Monsoon Rain</span>
              </span>
              <span className="font-mono text-cyan-400 font-bold">{rainfallMm} mm</span>
            </div>
            <input
              type="range"
              min="0"
              max="250"
              step="5"
              value={rainfallMm}
              onChange={(e) => setRainfallMm(e.target.value)}
              className="w-full accent-cyan-400"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-300 font-medium flex items-center space-x-1.5">
                <Gauge className="w-3.5 h-3.5 text-amber-400" />
                <span>Cargo Payload Weight</span>
              </span>
              <span className="font-mono text-amber-400 font-bold">{formatWeight(cargoWeight)}</span>
            </div>
            <input
              type="range"
              min="200"
              max="16000"
              step="200"
              value={cargoWeight}
              onChange={(e) => setCargoWeight(e.target.value)}
              className="w-full accent-amber-400"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => handleComputeRoute(vehicleType)}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl text-xs shadow-lg shadow-emerald-600/20 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-emerald-200" />
              <span>{loading ? "Computing Travel Path..." : "Calculate Travel Itinerary"}</span>
            </button>
          </div>
        </div>

        {/* Toggles */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-zinc-400">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={avoidPasses}
              onChange={(e) => setAvoidPasses(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0"
            />
            <span>Avoid High Alpine Mountain Passes (&gt; 2,500m / Sela Pass)</span>
          </label>

          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className="rounded bg-zinc-800 border-zinc-700 text-emerald-500 focus:ring-0"
            />
            <span>Disaster Relief Priority (Override rough road penalties)</span>
          </label>
        </div>
      </div>

      {/* Comparative Route Results Cards */}
      {recRoute && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Bar with View On Map CTA */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/90 p-4 rounded-2xl border border-white/[0.08]">
            <div className="flex items-center space-x-2 text-xs font-semibold text-zinc-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Itinerary Generated: <strong>{recRoute.name}</strong></span>
            </div>
            <button
              onClick={handleViewOnMap}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition active:scale-95"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>View Route on Operations Map ➔</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: AI Recommended Corridor */}
            <div className="saas-card rounded-3xl p-6 border-emerald-500/50 relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl">
                {vehicleType === 'CARGO_DRONE' ? '✓ Drone Air Corridor' : '✓ AI Recommended Safe Corridor'}
              </div>

              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <ShieldCheck className="w-5 h-5" />
                <span>{recRoute.name}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block font-medium">Total Distance</span>
                  <span className="text-base font-bold font-mono text-white">{formatDistance(recRoute.total_distance_km)}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block font-medium">Travel Duration</span>
                  <span className="text-base font-bold font-mono text-cyan-400">{formatDuration(recRoute.estimated_duration_hours)}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block font-medium">Landslide Risk</span>
                  <span className="text-base font-bold font-mono text-emerald-400">{formatPercent(recRoute.composite_risk_score, true)}</span>
                </div>
                <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04]">
                  <span className="text-[10px] text-zinc-400 block font-medium">Energy / Fuel</span>
                  <span className="text-base font-bold font-mono text-amber-400">
                    {vehicleType === 'CARGO_DRONE' ? `${(recRoute.total_distance_km * 0.28).toFixed(1)} kWh` : `${Math.round(recRoute.fuel_consumption_litres)} L`}
                  </span>
                </div>
              </div>

              {/* Waypoints */}
              <div className="bg-zinc-950 p-3.5 rounded-2xl border border-white/[0.04] text-xs">
                <span className="text-zinc-400 font-semibold block mb-2 text-[11px]">
                  Journey Waypoints Sequence:
                </span>
                <div className="flex flex-wrap items-center gap-1.5 font-mono text-zinc-200">
                  {recRoute.waypoints.map((wp, idx) => (
                    <React.Fragment key={wp.name || idx}>
                      <span className="bg-zinc-900 border border-white/[0.06] px-2.5 py-1 rounded-xl text-emerald-300 font-medium text-xs">
                        {wp.name} <span className="text-zinc-500 font-normal">({formatElevation(wp.elevation_m)})</span>
                      </span>
                      {idx < recRoute.waypoints.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* Travel Conditions Summary */}
              <div className="grid grid-cols-3 gap-2 text-xs bg-zinc-950 p-3 rounded-2xl border border-white/[0.04] text-zinc-300">
                <div className="flex items-center space-x-1.5">
                  <Signal className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-[11px]">96% Telemetry Sync</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Coffee className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-[11px]">
                    {vehicleType === 'CARGO_DRONE' ? 'Drone Port Active' : 'Rest Plazas Available'}
                  </span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="text-[11px]">Pass Validated</span>
                </div>
              </div>
            </div>

            {/* Card 2: Standard Direct Route */}
            {altRoute ? (
              <div className="saas-card rounded-3xl p-6 relative opacity-90 space-y-4">
                <div className="absolute top-0 right-0 bg-zinc-800 text-zinc-400 font-semibold text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-bl-2xl">
                  Standard Direct Route
                </div>

                <div className="flex items-center space-x-2 text-zinc-300 font-bold text-sm">
                  <Navigation className="w-4 h-4 text-amber-400" />
                  <span>{altRoute.name}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04]">
                    <span className="text-[10px] text-zinc-400 block font-medium">Distance</span>
                    <span className="text-base font-bold font-mono text-white">{formatDistance(altRoute.total_distance_km)}</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04]">
                    <span className="text-[10px] text-zinc-400 block font-medium">Duration</span>
                    <span className="text-base font-bold font-mono text-zinc-300">{formatDuration(altRoute.estimated_duration_hours)}</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04]">
                    <span className="text-[10px] text-zinc-400 block font-medium">Risk Score</span>
                    <span className="text-base font-bold font-mono text-rose-400">{formatPercent(altRoute.composite_risk_score, true)}</span>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04]">
                    <span className="text-[10px] text-zinc-400 block font-medium">Passability</span>
                    <span className={`text-base font-bold font-mono ${altRoute.passable ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {altRoute.passable ? 'Open' : 'Blocked'}
                    </span>
                  </div>
                </div>

                <div className="bg-zinc-950 p-3.5 rounded-2xl border border-white/[0.04] text-xs">
                  <span className="text-zinc-400 font-semibold block mb-2 text-[11px]">
                    Direct Waypoints:
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5 font-mono text-zinc-400">
                    {altRoute.waypoints.map((wp, idx) => (
                      <React.Fragment key={wp.name || idx}>
                        <span className="bg-zinc-900 border border-white/[0.04] px-2.5 py-1 rounded-xl text-zinc-300 text-xs">
                          {wp.name}
                        </span>
                        {idx < altRoute.waypoints.length - 1 && (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {altRoute.risk_warnings && altRoute.risk_warnings.length > 0 && (
                  <div className="space-y-1 bg-rose-950/20 border border-rose-800/40 p-3 rounded-2xl text-xs text-rose-300">
                    <span className="font-semibold flex items-center space-x-1.5 text-rose-400 text-xs">
                      <AlertOctagon className="w-4 h-4" />
                      <span>Active Bottlenecks:</span>
                    </span>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-200">
                      {altRoute.risk_warnings.map((w, idx) => (
                        <li key={idx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="saas-card rounded-3xl p-6 flex items-center justify-center text-center text-zinc-400 text-xs">
                {vehicleType === 'CARGO_DRONE' ? 'Direct Unrestricted Airspace Corridor active.' : 'No alternative corridor available.'}
              </div>
            )}
          </div>

          {/* Dynamic 2D Elevation Profile Component */}
          <ElevationProfile
            profileData={recRoute.elevation_profile}
            routeName={recRoute.name}
            stats={{
              max_elevation: recRoute.max_elevation_m,
              elevation_gain: recRoute.elevation_gain_m,
              max_gradient: recRoute.max_gradient_percent
            }}
          />
        </div>
      )}
    </div>
  );
}
