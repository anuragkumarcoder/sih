import React, { useState } from 'react';
import { 
  ShieldCheck, AlertTriangle, Truck, Compass, Database, Activity, 
  Layers, MapPin, Gauge, Mountain, Fuel, Radio, Thermometer, Box, 
  CheckCircle2, Clock, Navigation, Zap, Phone, Shield, User, 
  TrendingUp, BarChart3, AlertOctagon, ChevronRight, Sparkles,
  ArrowUpRight, RefreshCw, Send, Check, Play, Car, Plane, RadioTower,
  Cpu, Lock, Flame, Trash2, CheckCircle, Edit3, Sliders, Globe,
  Crosshair, Battery, Disc, Compass as InclineIcon, Search
} from 'lucide-react';
import { 
  formatDistance, formatDuration, formatElevation, 
  formatPercent, formatSpeed, formatTemperature, formatGrade
} from '../utils/formatters';
import IncidentClearanceModal from './IncidentClearanceModal';
import AdminAITestingCockpit from './AdminAITestingCockpit';
import { DEMO_USERS } from './AuthModal';

export default function RoleDashboardView({ 
  currentUser, 
  fleetVehicles, 
  activeIncidents, 
  plannedRoute,
  onQuickRoutePlan,
  onIncidentToggle,
  onNavigateToMap,
  onNavigateToDriverNav,
  onOpenIncidentModal,
  onOpenColdChainSimulator,
  onOpenAddConvoyModal,
  onSelectVehicle,
  onToggleVerifyIncident,
  onDismissIncident,
  onUpdateIncidentProgress,
  onSwitchUser
}) {
  const role = currentUser?.role || 'ROLE_ADMIN';

  // Driver HUD State
  const [driverSosSent, setDriverSosSent] = useState(false);
  const [driverColdTemp, setDriverColdTemp] = useState(4.2);

  // Clearance Modal State
  const [clearanceModalIncident, setClearanceModalIncident] = useState(null);
  const [isClearanceModalOpen, setIsClearanceModalOpen] = useState(false);

  // Incident Governance Search Filter
  const [incidentSearchQuery, setIncidentSearchQuery] = useState('');

  const isBRO = role === 'ROLE_BRO_INSPECTOR' || role === 'ROLE_ADMIN';

  const handleDriverSos = () => {
    setDriverSosSent(true);
    setTimeout(() => setDriverSosSent(false), 5000);
  };

  const handleOpenClearance = (inc) => {
    setClearanceModalIncident(inc);
    setIsClearanceModalOpen(true);
  };

  const myVehicle = fleetVehicles.find(v => v.vehicleId === currentUser?.assignedVehicleId) || 
                    fleetVehicles.find(v => v.driverName?.toLowerCase().includes(currentUser?.name?.split(' ')[0]?.toLowerCase())) || 
                    fleetVehicles[0];

  /* --------------------------------------------------------------------------------------------------
     1. 🏔️ ROLE_FIELD_DRIVER: FIGHTER-JET TITANIUM & CYBER-EMERALD PILOT COCKPIT HUD
     -------------------------------------------------------------------------------------------------- */
  if (role === 'ROLE_FIELD_DRIVER') {
    const driverUsers = DEMO_USERS.filter(u => u.role === 'ROLE_FIELD_DRIVER');

    return (
      <div className="space-y-4 animate-fadeIn select-none font-sans w-full">
        {/* Lusion Cockpit Top Hero Bar */}
        <div className="liquid-glass rounded-3xl p-5 shadow-2xl border border-emerald-500/30 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-4">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 flex items-center justify-center text-white shadow-xl shadow-emerald-500/30 ring-1 ring-white/20">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-white font-mono tracking-tight">{myVehicle.vehicleId}</h2>
                  <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-extrabold shadow-sm">
                    TACTICAL PILOT HUD ACTIVE
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Assigned Pilot: <strong className="text-white">{currentUser.name}</strong> • Unit: {currentUser.department}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {/* 🔀 DRIVER SHIFT / CONVOY SELECTOR */}
              <div className="bg-zinc-950/90 px-3 py-2 rounded-2xl border border-emerald-500/40 flex items-center space-x-2 shadow-sm">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] text-zinc-400 font-sans font-semibold">Driver Shift:</span>
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

              <button
                onClick={onNavigateToDriverNav || onNavigateToMap}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-500 text-white border border-emerald-400/50 text-xs font-black px-4 py-2.5 rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center space-x-2 transition active:scale-95 animate-pulse"
              >
                <Navigation className="w-4 h-4 text-emerald-200 fill-emerald-200" />
                <span>LAUNCH IN-CABIN GPS NAVIGATOR</span>
              </button>

              <button
                onClick={handleDriverSos}
                className={`px-4 py-2.5 rounded-2xl text-xs font-black shadow-lg flex items-center space-x-2 transition active:scale-95 ${
                  driverSosSent 
                    ? 'bg-emerald-600 text-white animate-pulse' 
                    : 'bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white shadow-rose-600/30 border border-rose-400/30'
                }`}
              >
                <AlertOctagon className="w-4 h-4" />
                <span>{driverSosSent ? "✓ SOS TRANSMITTED TO BRO" : "🚨 EMERGENCY SOS"}</span>
              </button>
            </div>
          </div>

          {/* Turn-by-Turn GPS Live Guidance Ribbon */}
          <div className="mt-3.5 bg-gradient-to-r from-zinc-950/90 via-blue-950/40 to-zinc-950/90 p-3.5 rounded-2xl border border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 block font-bold uppercase tracking-wider">
                  Next GPS Navigation Action (In 3.8 km)
                </span>
                <span className="text-xs font-extrabold text-white">
                  Cross Kolia Bhomora Brahmaputra Bridge ➔ Continue toward Tezpur Bypass
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-5 text-xs font-mono">
              <div>
                <span className="text-zinc-500 text-[10px] block">Next Rest Plaza</span>
                <span className="text-amber-400 font-bold">Tezpur Oasis (28 km)</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[10px] block">Destination ETA</span>
                <span className="text-emerald-400 font-bold">11:05 AM (45 min)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tactical Digital Instrument Cluster */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {/* Speed Dial */}
          <div className="liquid-glass rounded-3xl p-4.5 border border-white/[0.1] flex flex-col justify-between space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center space-x-1.5 font-bold text-zinc-300 text-xs">
                <Gauge className="w-4 h-4 text-emerald-400" />
                <span>Speed Telemetry</span>
              </span>
              <span className="text-[10px] font-mono bg-zinc-900 text-emerald-400 px-2 py-0.5 rounded-full border border-white/[0.06] font-bold">
                Limit 50
              </span>
            </div>
            <div className="text-center py-1.5">
              <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400 tracking-tight">
                {Math.round(myVehicle.speedKmh)} <span className="text-xs text-zinc-400 font-sans font-normal">km/h</span>
              </div>
              <span className="text-[10px] text-zinc-500 block font-mono">Optimal Mountain Cruising Pace</span>
            </div>
          </div>

          {/* Elevation & Mountain Grade */}
          <div className="liquid-glass rounded-3xl p-4.5 border border-white/[0.1] flex flex-col justify-between space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center space-x-1.5 font-bold text-zinc-300 text-xs">
                <Mountain className="w-4 h-4 text-amber-400" />
                <span>Elevation & Pitch</span>
              </span>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800/60 font-black">
                +4.8% Grade
              </span>
            </div>
            <div className="text-center py-1.5">
              <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400 tracking-tight">
                {myVehicle.altitude} <span className="text-xs text-zinc-400 font-sans font-normal">m</span>
              </div>
              <span className="text-[10px] text-zinc-500 block font-mono">Brahmaputra Valley Basin</span>
            </div>
          </div>

          {/* Dual Fuel Tanks */}
          <div className="liquid-glass rounded-3xl p-4.5 border border-white/[0.1] flex flex-col justify-between space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center space-x-1.5 font-bold text-zinc-300 text-xs">
                <Fuel className="w-4 h-4 text-cyan-400" />
                <span>Fuel Autonomy</span>
              </span>
              <span className="text-[10px] font-mono text-cyan-300 font-bold">380 km Range</span>
            </div>
            <div className="text-center py-1.5">
              <div className="text-3xl sm:text-4xl font-black font-mono text-cyan-400 tracking-tight">
                {Math.round(myVehicle.fuel)}%
              </div>
              <span className="text-[10px] text-zinc-500 block font-mono">Dual Diesel Tanks Nominal</span>
            </div>
          </div>

          {/* Cold-Chain Vital Signs */}
          <div className="liquid-glass rounded-3xl p-4.5 border border-white/[0.1] flex flex-col justify-between space-y-2 relative overflow-hidden group">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center space-x-1.5 font-bold text-zinc-300 text-xs">
                <Thermometer className="w-4 h-4 text-purple-400" />
                <span>Vaccine Chamber</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-black">
                +2° to +8°C
              </span>
            </div>
            <div className="text-center py-1.5">
              <div className="text-3xl sm:text-4xl font-black font-mono text-purple-300 tracking-tight">
                +{driverColdTemp}°C
              </div>
              <span className="text-[10px] text-zinc-500 block font-mono">IoT Peltier Solid-State Chill</span>
            </div>
          </div>
        </div>

        {/* Cargo Waybill & Live Road Blockage Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Waybill Card */}
          <div className="liquid-glass rounded-3xl p-5 border border-white/[0.08] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Box className="w-4 h-4 text-amber-400" />
                <span>Payload Manifest & Electronic Waybill</span>
              </span>
              <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2.5 py-0.5 rounded-full border border-white/[0.08]">
                WAYBILL #NER-88902-WB
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
                <span className="text-zinc-500 text-[10px] font-semibold block">Consignment Contents:</span>
                <div className="font-bold text-white text-xs pt-0.5">{myVehicle.cargo}</div>
                <div className="text-zinc-400 text-[11px] pt-0.5">Cold Chain Strict Storage Required (+2°C to +8°C)</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-white/[0.06]">
                  <span className="text-zinc-500 text-[10px] font-sans block">Consignor Depot</span>
                  <strong className="text-white text-xs">{myVehicle.origin} Central Base</strong>
                </div>
                <div className="bg-zinc-950/80 p-3 rounded-2xl border border-white/[0.06]">
                  <span className="text-zinc-500 text-[10px] font-sans block">Consignee Depot</span>
                  <strong className="text-emerald-400 text-xs">{myVehicle.destination} Logistics Hub</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Road Clearance & SITREP Feed for Driver */}
          <div className="liquid-glass rounded-3xl p-5 border border-white/[0.08] space-y-3.5">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
              <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
                <Activity className="w-4 h-4 text-rose-400" />
                <span>Road Blockages & Clearance Timeline</span>
              </span>
              <button
                onClick={onOpenIncidentModal}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 underline"
              >
                Report Road Hazard +
              </button>
            </div>

            <div className="space-y-3 text-xs">
              {activeIncidents.slice(0, 2).map(inc => {
                const progress = inc.clearancePercent !== undefined ? inc.clearancePercent : 0;
                const latestNews = inc.clearanceUpdates?.[0];

                return (
                  <div key={inc.id} className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.08] space-y-2.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs flex items-center space-x-2">
                        <AlertTriangle className={`w-4 h-4 ${inc.verified ? 'text-rose-400' : 'text-amber-400'}`} />
                        <span>{inc.roadName}</span>
                      </strong>
                      <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        inc.verified ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {inc.verified ? 'BRO Verified' : 'Unverified'}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                        <span>Clearance: <strong className="text-cyan-400">{progress}%</strong></span>
                        <span>Estimated Remaining: <strong className="text-amber-400">{inc.clearanceHours} Hours</strong></span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-white/10">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Latest News SITREP */}
                    {latestNews && (
                      <div className="bg-zinc-900/90 p-2 rounded-xl border border-white/[0.04] text-[11px] text-zinc-300 space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-cyan-400 font-mono font-bold">
                          <span>Latest BRO Broadcast ({latestNews.time}):</span>
                        </div>
                        <p className="text-[11px] text-zinc-200">{latestNews.message}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------------------------------
     2. 🚨 ROLE_BRO_INSPECTOR: INDUSTRIAL CARBON & HAZARD AMBER MOUNTAIN COMMAND
     -------------------------------------------------------------------------------------------------- */
  if (role === 'ROLE_BRO_INSPECTOR') {
    return (
      <div className="space-y-4 animate-fadeIn select-none font-sans w-full">
        {/* BRO Header */}
        <div className="liquid-glass rounded-3xl p-5 shadow-2xl border border-amber-500/30 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 flex items-center justify-center text-white shadow-xl shadow-amber-500/30 ring-1 ring-white/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-white font-mono">BRO Task Force 88 Alpine Command</h2>
                  <span className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                    CLEARANCE GOVERNANCE & SITREP DISPATCH
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Officer Commanding: <strong className="text-white">{currentUser.name}</strong> • Clearance: {currentUser.clearance}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              <button
                onClick={onOpenIncidentModal}
                className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-amber-600/30 flex items-center space-x-2 transition active:scale-95"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Broadcast Official Roadblock</span>
              </button>

              <button
                onClick={onNavigateToMap}
                className="bg-zinc-950/80 hover:bg-zinc-900 text-white border border-white/[0.1] text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md flex items-center space-x-2 transition"
              >
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Open Tactical Map</span>
              </button>
            </div>
          </div>

          {/* Mountain Pass Status Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-rose-950/40 p-3.5 rounded-2xl border border-rose-500/40 space-y-1">
              <span className="text-rose-300 font-bold block flex items-center justify-between text-xs">
                <span>NH-13 Sela Pass (4,170m)</span>
                <span className="text-[10px] bg-rose-900 text-rose-200 px-2 py-0.5 rounded font-mono font-black">BLOCKED</span>
              </span>
              <p className="text-zinc-300 text-[11px]">120m rockfall debris. Bulldozer clearance active.</p>
            </div>

            <div className="bg-amber-950/40 p-3.5 rounded-2xl border border-amber-500/40 space-y-1">
              <span className="text-amber-300 font-bold block flex items-center justify-between text-xs">
                <span>NH-29 Pagla Pahar (1,200m)</span>
                <span className="text-[10px] bg-amber-900 text-amber-200 px-2 py-0.5 rounded font-mono font-black">1 LANE OPEN</span>
              </span>
              <p className="text-zinc-300 text-[11px]">70% stabilized. Regulated single-lane crawl.</p>
            </div>

            <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/40 space-y-1">
              <span className="text-emerald-300 font-bold block flex items-center justify-between text-xs">
                <span>NH-37 Kaziranga Corridor</span>
                <span className="text-[10px] bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-mono font-black">CLEAR</span>
              </span>
              <p className="text-zinc-300 text-[11px]">Unrestricted commercial multi-axle freight movement.</p>
            </div>
          </div>
        </div>

        {/* Hazard Governance, Progress Bars & SITREP News Dispatcher Queue */}
        <div className="liquid-glass rounded-3xl p-5 border border-white/[0.08] space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>Live Blockage Clearance Governance Queue ({activeIncidents.length} Records)</span>
            </span>

            {/* Incident Search Filter Input */}
            <div className="flex items-center space-x-2 bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-white/[0.08] focus-within:border-amber-400/80 focus-within:ring-1 focus-within:ring-amber-400/30">
              <Search className="w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={incidentSearchQuery}
                onChange={(e) => setIncidentSearchQuery(e.target.value)}
                placeholder="Search landslides (e.g. NH-6, Sonapur)..."
                className="bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none w-48 sm:w-60 font-semibold"
              />
              {incidentSearchQuery && (
                <button 
                  onClick={() => setIncidentSearchQuery('')}
                  className="text-zinc-400 hover:text-white text-xs font-bold px-1"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="space-y-3.5">
            {activeIncidents.filter(inc => {
              if (!incidentSearchQuery) return true;
              const q = incidentSearchQuery.toLowerCase();
              return (
                (inc.roadName && inc.roadName.toLowerCase().includes(q)) ||
                (inc.landmark && inc.landmark.toLowerCase().includes(q)) ||
                (inc.hazardType && inc.hazardType.toLowerCase().includes(q)) ||
                (inc.severity && inc.severity.toLowerCase().includes(q)) ||
                (inc.description && inc.description.toLowerCase().includes(q))
              );
            }).map(inc => {
              const isVer = inc.verified;
              const progress = inc.clearancePercent !== undefined ? inc.clearancePercent : 0;

              return (
                <div 
                  key={inc.id} 
                  className={`p-4.5 rounded-3xl border transition space-y-3 ${
                    isVer 
                      ? 'bg-zinc-950/80 border-emerald-500/30' 
                      : 'bg-amber-950/20 border-amber-500/40'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <strong className="text-white text-sm">{inc.roadName}</strong>
                      <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        inc.severity === 'CRITICAL' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        inc.severity === 'HIGH' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}>
                        {inc.hazardType} • {inc.severity}
                      </span>
                    </div>

                    <span className={`text-[10px] font-mono px-3 py-1 rounded-full font-bold uppercase flex items-center space-x-1.5 ${
                      isVer ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-700 animate-pulse'
                    }`}>
                      {isVer ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      <span>{isVer ? "BRO CERTIFIED ROADBLOCK" : "PENDING BRO VERIFICATION"}</span>
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed bg-black/40 p-3 rounded-2xl border border-white/[0.04]">
                    {inc.description}
                  </p>

                  {/* 📊 Clearance Progress Meter */}
                  <div className="bg-zinc-900/90 p-3.5 rounded-2xl border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-zinc-400 font-sans font-semibold">Clearance Progress Level:</span>
                      <strong className="text-cyan-400 text-sm font-black">{progress}%</strong>
                    </div>

                    <div className="w-full bg-zinc-950 rounded-full h-3 overflow-hidden border border-white/10">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          progress >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
                          progress >= 40 ? 'bg-gradient-to-r from-cyan-500 to-blue-500' :
                          'bg-gradient-to-r from-amber-500 to-orange-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono pt-1">
                      <span>Machinery: <strong className="text-emerald-400">{inc.machineryDeployed || "Excavators Active"}</strong></span>
                      <span>ETA Remaining: <strong className="text-amber-400">{inc.clearanceHours} Hours</strong></span>
                    </div>
                  </div>

                  {/* 📰 News SITREPs */}
                  {inc.clearanceUpdates && inc.clearanceUpdates.length > 0 && (
                    <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-2xl border border-white/[0.04]">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
                        Official Clearance News Logs:
                      </span>
                      {inc.clearanceUpdates.map((u, i) => (
                        <div key={i} className="text-[11px] text-zinc-300 flex items-baseline justify-between border-b border-zinc-900 pb-1.5">
                          <span>• {u.message}</span>
                          <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-2 font-bold">{u.time}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Inspector Action Buttons */}
                  <div className="flex items-center justify-end space-x-2.5 pt-1.5 border-t border-white/[0.08]">
                    <button
                      onClick={() => handleOpenClearance(inc)}
                      className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition active:scale-95"
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Manage Clearance & SITREP</span>
                    </button>

                    <button
                      onClick={() => onToggleVerifyIncident && onToggleVerifyIncident(inc.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold shadow-md flex items-center space-x-2 transition active:scale-95 ${
                        isVer 
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30' 
                          : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{isVer ? "Revoke" : "✓ Certify"}</span>
                    </button>

                    {onDismissIncident && (
                      <button
                        onClick={() => onDismissIncident(inc.id)}
                        className="bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 p-2 rounded-xl border border-white/[0.08] transition"
                        title="Dismiss false or cleared report"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 🛠️ MODAL */}
        <IncidentClearanceModal
          isOpen={isClearanceModalOpen}
          onClose={() => setIsClearanceModalOpen(false)}
          incident={clearanceModalIncident}
          currentUser={currentUser}
          onUpdateProgress={onUpdateIncidentProgress}
          onToggleVerify={onToggleVerifyIncident}
          onDismiss={onDismissIncident}
        />
      </div>
    );
  }

  /* --------------------------------------------------------------------------------------------------
     3. ⚡ ROLE_DISPATCHER: OCEANIC NEON CYAN & ULTRAVIOLET FLEET DISPATCH MATRIX
     -------------------------------------------------------------------------------------------------- */
  if (role === 'ROLE_DISPATCHER') {
    return (
      <div className="space-y-4 animate-fadeIn select-none font-sans w-full">
        {/* Dispatcher Header */}
        <div className="liquid-glass rounded-3xl p-5 shadow-2xl border border-cyan-500/30 space-y-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-cyan-500/30 ring-1 ring-white/20">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-lg font-black text-white font-mono">Central Logistics Dispatcher Console</h2>
                  <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                    MULTI-MODAL FLEET & AIRLIFT COMMAND
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  Duty Dispatcher: <strong className="text-white">{currentUser.name}</strong> • Hub: {currentUser.department}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2.5">
              {onOpenAddConvoyModal && (
                <button
                  onClick={onOpenAddConvoyModal}
                  className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/25 border border-emerald-400/30 flex items-center space-x-2 transition active:scale-95"
                >
                  <Truck className="w-4 h-4" />
                  <span>+ Dispatch New Convoy</span>
                </button>
              )}

              <button
                onClick={onOpenColdChainSimulator}
                className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-cyan-600/25 border border-cyan-400/30 flex items-center space-x-2 transition active:scale-95"
              >
                <Thermometer className="w-4 h-4 animate-pulse" />
                <span>Simulate Cold Breach</span>
              </button>

              <button
                onClick={onNavigateToMap}
                className="bg-zinc-950/80 hover:bg-zinc-900 text-white border border-white/[0.1] text-xs font-bold px-4 py-2.5 rounded-2xl shadow-md flex items-center space-x-2 transition"
              >
                <Navigation className="w-4 h-4 text-cyan-400" />
                <span>Open Operations Map</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-sans block font-semibold">Active Fleet Convoys</span>
              <strong className="text-white text-base font-black">{fleetVehicles.length} Units (100% Online)</strong>
            </div>
            <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-sans block font-semibold">Cold-Chain Temperature</span>
              <strong className="text-emerald-400 text-base font-black">99.4% Nominal</strong>
            </div>
            <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-sans block font-semibold">Drone Corridors Open</span>
              <strong className="text-purple-400 text-base font-black">2 Clear (95 km/h)</strong>
            </div>
            <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
              <span className="text-[10px] text-zinc-500 font-sans block font-semibold">Active Mountain Detours</span>
              <strong className="text-amber-400 text-base font-black">1 Sela Bypass</strong>
            </div>
          </div>
        </div>

        {/* Live Fleet Dispatch Grid */}
        <div className="liquid-glass rounded-3xl p-5 border border-white/[0.08] space-y-3.5">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
            <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Fleet Dispatch Matrix (Click to Inspect)</span>
            </span>
            <span className="text-[11px] font-mono text-zinc-400">
              Transponders 2.5s WebSocket Sync
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {fleetVehicles.map(veh => (
              <div
                key={veh.vehicleId}
                onClick={() => onSelectVehicle && onSelectVehicle(veh)}
                className="bg-zinc-950/80 p-4 rounded-2xl border border-white/[0.08] hover:border-cyan-500/50 hover:bg-zinc-900/70 cursor-pointer transition-all duration-200 space-y-2.5 group shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold text-white font-mono text-xs group-hover:text-cyan-300 transition-colors">
                      {veh.vehicleId}
                    </div>
                    <span className="text-[11px] text-zinc-400">Pilot: {veh.driverName}</span>
                  </div>
                  <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${
                    veh.type === 'CARGO_DRONE' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                    veh.type === 'OFFROAD_4X4' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                    'bg-cyan-950 text-cyan-300 border-cyan-800'
                  }`}>
                    {veh.type === 'CARGO_DRONE' ? 'Drone' : veh.type === 'OFFROAD_4X4' ? '4x4' : 'Truck'}
                  </span>
                </div>

                <div className="bg-zinc-900/80 p-2.5 rounded-xl border border-white/[0.04] flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400 font-semibold">Corridor:</span>
                  <span className="font-bold text-emerald-400">{veh.origin} ➔ {veh.destination}</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-zinc-900/40 p-2 rounded-xl">
                  <div>
                    <span className="text-[9px] text-zinc-500 font-sans block">Speed</span>
                    <strong className="text-emerald-400">{formatSpeed(veh.speedKmh)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-sans block">Altitude</span>
                    <strong className="text-amber-400">{formatElevation(veh.altitude)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-500 font-sans block">Energy</span>
                    <strong className="text-cyan-400">{Math.round(veh.fuel)}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------------------------------
     4. 👑 ROLE_ADMIN: IMPERIAL VIOLET & OBSIDIAN MINISTRY OF DoNER STRATEGIC COMMAND
     -------------------------------------------------------------------------------------------------- */
  return (
    <div className="space-y-4 animate-fadeIn select-none font-sans w-full">
      {/* Admin Executive Header */}
      <div className="liquid-glass rounded-3xl p-5 shadow-2xl border border-purple-500/30 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 via-indigo-600 to-blue-700 flex items-center justify-center text-white shadow-xl shadow-purple-500/30 ring-1 ring-white/20">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-white font-mono">Ministry of DoNER Command Center</h2>
                <span className="bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold">
                  LEVEL 5 UNRESTRICTED CLEARANCE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Administrator: <strong className="text-white">{currentUser.name}</strong> • {currentUser.department}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onNavigateToMap}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-lg shadow-emerald-600/25 border border-emerald-400/30 flex items-center space-x-2 transition active:scale-95"
            >
              <Navigation className="w-4 h-4" />
              <span>Full-Screen GIS Map Canvas</span>
            </button>
          </div>
        </div>

        {/* Executive KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-sans block font-semibold">Regional Accessibility</span>
            <strong className="text-emerald-400 text-xl font-black">88.4%</strong>
            <span className="text-[10px] text-zinc-500 block pt-0.5">8 NE States Connected</span>
          </div>

          <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-sans block font-semibold">Active Bottlenecks</span>
            <strong className="text-rose-400 text-xl font-black">{activeIncidents.length} Zones</strong>
            <span className="text-[10px] text-zinc-500 block pt-0.5">Sela Pass Rerouted</span>
          </div>

          <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-sans block font-semibold">Hybrid DB Latency</span>
            <strong className="text-cyan-400 text-xl font-black">3.8 ms</strong>
            <span className="text-[10px] text-zinc-500 block pt-0.5">MySQL + MongoDB 2dsphere</span>
          </div>

          <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06]">
            <span className="text-[10px] text-zinc-500 font-sans block font-semibold">Drone Speed Rating</span>
            <strong className="text-purple-400 text-xl font-black">95 km/h</strong>
            <span className="text-[10px] text-zinc-500 block pt-0.5">Autonomous Air Corridor</span>
          </div>
        </div>
      </div>

      {/* 🤖 ADMIN-ONLY AI TESTING & SIMULATION COCKPIT */}
      <AdminAITestingCockpit
        currentUser={currentUser}
        fleetVehicles={fleetVehicles}
        activeIncidents={activeIncidents}
        plannedRoute={plannedRoute}
        onQuickRoutePlan={onQuickRoutePlan}
        onIncidentToggle={onIncidentToggle}
        onNavigateToMap={onNavigateToMap}
      />

      {/* 8 North Eastern States Strategic Matrix */}
      <div className="liquid-glass rounded-3xl p-5 border border-white/[0.08] space-y-3.5">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-2.5">
          <span className="text-xs font-black text-white uppercase tracking-wider flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            <span>North Eastern Regional Connectivity Matrix (8 States)</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            Real-Time State Logistics Readiness
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { state: "Assam", hub: "Guwahati Central", status: "100% OPERATIONAL", color: "text-emerald-400", border: "border-emerald-500/30" },
            { state: "Arunachal Pradesh", hub: "Tawang & Bomdila", status: "SELA DETOUR ACTIVE", color: "text-amber-400", border: "border-amber-500/30" },
            { state: "Meghalaya", hub: "Shillong Gateway", status: "DRONE CORRIDOR OPEN", color: "text-purple-400", border: "border-purple-500/30" },
            { state: "Sikkim", hub: "Gangtok High Pass", status: "TEESTA FAULT NOMINAL", color: "text-emerald-400", border: "border-emerald-500/30" },
            { state: "Nagaland", hub: "Dimapur - Kohima", status: "ZUBZA VIADUCT CLEAR", color: "text-emerald-400", border: "border-emerald-500/30" },
            { state: "Manipur", hub: "Imphal Central", status: "NH-37 ESCORT CLEAR", color: "text-emerald-400", border: "border-emerald-500/30" },
            { state: "Mizoram", hub: "Aizawl Logistics Hub", status: "SILCHAR LINK ACTIVE", color: "text-emerald-400", border: "border-emerald-500/30" },
            { state: "Tripura", hub: "Agartala Inland Port", status: "NW-16 HIGHWAY OPEN", color: "text-emerald-400", border: "border-emerald-500/30" }
          ].map(s => (
            <div key={s.state} className={`bg-zinc-950/80 p-3.5 rounded-2xl border ${s.border} space-y-1 hover:border-white/[0.2] transition`}>
              <strong className="text-white text-xs block">{s.state}</strong>
              <div className="text-zinc-400 text-[11px] truncate">{s.hub}</div>
              <span className={`text-[10px] font-mono font-black block pt-0.5 ${s.color}`}>
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
