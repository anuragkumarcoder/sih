import React, { useState } from 'react';
import { Truck, Activity, Radio, Mountain, BatteryCharging, Gauge, Compass, Fuel, CheckCircle2, User, Eye, Navigation } from 'lucide-react';
import { formatElevation, formatSpeed, formatTemperature } from '../utils/formatters';

export default function TelemetryStreamFeed({ 
  fleetVehicles, 
  currentUser, 
  onSelectVehicle 
}) {
  const [driverViewMode, setDriverViewMode] = useState('ASSIGNED'); // 'ASSIGNED', 'ALL'
  const isDriver = currentUser?.role === 'ROLE_FIELD_DRIVER';

  // Filter vehicles if in Driver mode
  const displayedVehicles = (isDriver && driverViewMode === 'ASSIGNED')
    ? fleetVehicles.filter(v => v.vehicleId === 'NER-TRUCK-AS01-9921' || v.driverName.includes('Biren'))
    : fleetVehicles;

  return (
    <div className="liquid-glass rounded-2xl p-3 sm:p-4 shadow-xl space-y-3 select-none">
      <div className="flex flex-wrap items-center justify-between border-b border-white/[0.06] pb-2 gap-2">
        <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
          <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          </div>
          <span>
            {isDriver && driverViewMode === 'ASSIGNED' ? 'My Assigned Vehicle Cockpit HUD' : 'Live Fleet Telemetry Stream'}
          </span>
        </div>

        {/* Role-Based Controls for Driver vs Dispatcher */}
        <div className="flex items-center space-x-2">
          {isDriver && (
            <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-white/[0.08] text-[11px] font-semibold">
              <button
                onClick={() => setDriverViewMode('ASSIGNED')}
                className={`px-2.5 py-0.5 rounded-md transition ${
                  driverViewMode === 'ASSIGNED' ? 'bg-zinc-800 text-emerald-400 shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                My Vehicle
              </button>
              <button
                onClick={() => setDriverViewMode('ALL')}
                className={`px-2.5 py-0.5 rounded-md transition ${
                  driverViewMode === 'ALL' ? 'bg-zinc-800 text-cyan-400 shadow-sm' : 'text-zinc-400 hover:text-white'
                }`}
              >
                All ({fleetVehicles.length})
              </button>
            </div>
          )}

          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full font-semibold flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{displayedVehicles.length} Transponders Live</span>
          </span>
        </div>
      </div>

      {/* Fleet Cards Grid (Clickable to Inspect Journey & Checkpoints) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {displayedVehicles.map(v => (
          <div 
            key={v.vehicleId}
            onClick={() => onSelectVehicle && onSelectVehicle(v)}
            className="bg-zinc-950/70 p-3 rounded-xl border border-white/[0.06] hover:border-cyan-500/50 hover:bg-zinc-900/60 transition-all duration-200 space-y-2 group cursor-pointer shadow-sm active:scale-98"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono font-bold text-xs text-white block group-hover:text-cyan-300 transition-colors flex items-center space-x-1">
                  <span>{v.vehicleId}</span>
                  <Eye className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-[10px] text-zinc-400">{v.driverName}</span>
              </div>
              <span className={`text-[9px] font-mono px-2 py-0.2 rounded-full font-bold uppercase ${
                v.type === 'CARGO_DRONE' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                v.type === 'OFFROAD_4X4' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                'bg-cyan-950 text-cyan-300 border border-cyan-800'
              }`}>
                {v.type === 'CARGO_DRONE' ? 'Drone' : v.type === 'OFFROAD_4X4' ? '4x4' : 'Truck'}
              </span>
            </div>

            <div className="text-[10px] text-zinc-300 bg-zinc-900/80 px-2 py-1 rounded-lg border border-white/[0.04] flex items-center justify-between">
              <span className="text-zinc-500">Route:</span>
              <span className="font-bold text-emerald-400">{v.origin} ➔ {v.destination}</span>
            </div>

            <div className="grid grid-cols-2 gap-1 text-[11px] font-mono bg-zinc-900/40 p-1.5 rounded-lg">
              <div className="flex items-center space-x-1 text-zinc-300">
                <Gauge className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{formatSpeed(v.speedKmh)}</span>
              </div>
              <div className="flex items-center space-x-1 text-zinc-300">
                <Mountain className="w-3 h-3 text-amber-400 shrink-0" />
                <span>{formatElevation(v.altitude)}</span>
              </div>
              <div className="flex items-center space-x-1 text-zinc-300">
                <Fuel className="w-3 h-3 text-cyan-400 shrink-0" />
                <span>{Math.round(v.fuel)}% fuel</span>
              </div>
              <div className="flex items-center space-x-1 text-zinc-300">
                <Activity className="w-3 h-3 text-rose-400 shrink-0" />
                <span>{formatTemperature(v.engineTemp)}</span>
              </div>
            </div>

            <div className="text-[9px] text-zinc-400 flex items-center justify-between pt-0.5 border-t border-zinc-900">
              <span className="truncate max-w-[140px]">{v.cargo.split('(')[0]}</span>
              <span className="text-cyan-400 font-medium group-hover:underline flex items-center space-x-0.5">
                <span>Inspect</span>
                <Navigation className="w-2.5 h-2.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
