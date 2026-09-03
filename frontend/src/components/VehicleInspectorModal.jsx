import React from 'react';
import { 
  Truck, User, MapPin, Gauge, Mountain, Fuel, Activity, 
  Clock, ShieldAlert, CheckCircle2, ChevronRight, Navigation, 
  X, Phone, Radio, Thermometer, Box, AlertTriangle, Crosshair, ArrowRight
} from 'lucide-react';
import { formatDistance, formatElevation, formatSpeed, formatTemperature, formatDuration } from '../utils/formatters';

export default function VehicleInspectorModal({ 
  isOpen, 
  onClose, 
  vehicle, 
  onTrackOnMap 
}) {
  if (!isOpen || !vehicle) return null;

  // Rich Journey Milestones based on vehicle route
  const getMilestones = (veh) => {
    if (veh.type === 'CARGO_DRONE') {
      return [
        { name: "Shillong Air Port (Helipad 1)", time: "10:00 AM", status: "COMPLETED", elev: 1525 },
        { name: "Mawkdok Valley Air Waypoint", time: "10:08 AM", status: "CURRENT", elev: 1680 },
        { name: "Sohra Civil Hospital Helipad", time: "10:18 AM (ETA)", status: "UPCOMING", elev: 1430 }
      ];
    }
    if (veh.vehicleId === 'NER-4X4-AR03-1044') {
      return [
        { name: "Bomdila Mountain Base", time: "07:30 AM", status: "COMPLETED", elev: 2415 },
        { name: "Dirang Valley Relief Station", time: "09:45 AM", status: "CURRENT", elev: 1560 },
        { name: "Sela Pass North Tunnel (Crawl)", time: "11:15 AM (ETA)", status: "UPCOMING", elev: 4170 },
        { name: "Tawang High-Altitude Depot", time: "02:30 PM (ETA)", status: "UPCOMING", elev: 3048 }
      ];
    }
    if (veh.vehicleId === 'NER-TRUCK-NL07-5512') {
      return [
        { name: "Dimapur Railway Freight Siding", time: "06:00 AM", status: "COMPLETED", elev: 145 },
        { name: "Medziphema Transit Hub", time: "08:30 AM", status: "COMPLETED", elev: 360 },
        { name: "Zubza Gorge Viaduct (Approaching)", time: "10:15 AM", status: "CURRENT", elev: 720 },
        { name: "Kohima Hill Capital Depot", time: "12:45 PM (ETA)", status: "UPCOMING", elev: 1444 }
      ];
    }
    // Default Heavy Truck (NER-TRUCK-AS01-9921)
    return [
      { name: "Guwahati Central Gateway Hub", time: "05:30 AM", status: "COMPLETED", elev: 55 },
      { name: "Nagaon Transit Food Plaza", time: "08:15 AM", status: "COMPLETED", elev: 62 },
      { name: "Kolia Bhomora Brahmaputra Bridge", time: "10:20 AM", status: "CURRENT", elev: 185 },
      { name: "Tezpur Bridge Logistics Terminal", time: "11:05 AM (ETA)", status: "UPCOMING", elev: 48 },
      { name: "Bhalukpong ILP Gate Checkpost", time: "01:30 PM (ETA)", status: "UPCOMING", elev: 213 }
    ];
  };

  const milestones = getMilestones(vehicle);
  const isDrone = vehicle.type === 'CARGO_DRONE';
  const is4x4 = vehicle.type === 'OFFROAD_4X4';

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-fadeIn">
      <div className="saas-card bg-[#090d18] border border-white/[0.1] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3.5 border-b border-white/[0.06] pb-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg ${
            isDrone ? 'bg-gradient-to-br from-purple-500 to-indigo-700 shadow-purple-500/20' :
            is4x4 ? 'bg-gradient-to-br from-amber-500 to-orange-700 shadow-amber-500/20' :
            'bg-gradient-to-br from-cyan-500 to-blue-700 shadow-cyan-500/20'
          }`}>
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-lg text-white font-mono">{vehicle.vehicleId}</h3>
              <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border font-bold uppercase ${
                isDrone ? 'bg-purple-950 text-purple-300 border-purple-800' :
                is4x4 ? 'bg-amber-950 text-amber-300 border-amber-800' :
                'bg-cyan-950 text-cyan-300 border-cyan-800'
              }`}>
                {isDrone ? 'Autonomous Drone' : is4x4 ? '4x4 Offroad Utility' : 'Heavy 16T Commercial'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 flex items-center space-x-1.5 pt-0.5">
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span>Pilot / Driver: <strong className="text-zinc-200">{vehicle.driverName}</strong></span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400 font-mono">Transponder Online</span>
            </p>
          </div>
        </div>

        {/* 1. Live Telemetry Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-zinc-500 font-sans block flex items-center space-x-1">
              <Gauge className="w-3 h-3 text-emerald-400" />
              <span>Current Speed</span>
            </span>
            <span className="text-lg font-bold text-emerald-400">{formatSpeed(vehicle.speedKmh)}</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-zinc-500 font-sans block flex items-center space-x-1">
              <Mountain className="w-3 h-3 text-amber-400" />
              <span>GPS Altitude</span>
            </span>
            <span className="text-lg font-bold text-amber-400">{formatElevation(vehicle.altitude)}</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-zinc-500 font-sans block flex items-center space-x-1">
              <Fuel className="w-3 h-3 text-cyan-400" />
              <span>{isDrone ? 'Battery Charge' : 'Diesel Fuel'}</span>
            </span>
            <span className="text-lg font-bold text-cyan-400">{Math.round(vehicle.fuel)}%</span>
          </div>

          <div className="bg-zinc-950 p-3 rounded-2xl border border-white/[0.04] space-y-1">
            <span className="text-[10px] text-zinc-500 font-sans block flex items-center space-x-1">
              <Activity className="w-3 h-3 text-rose-400" />
              <span>Engine Temp</span>
            </span>
            <span className="text-lg font-bold text-rose-400">{formatTemperature(vehicle.engineTemp)}</span>
          </div>
        </div>

        {/* 2. Journey Progress & Where Reached Ribbon */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center space-x-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              <span>Live Transit Progress & Checkpoints:</span>
            </span>
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800 px-2.5 py-0.5 rounded-full font-bold">
              {vehicle.origin} ➔ {vehicle.destination}
            </span>
          </div>

          {/* Stepper Timeline */}
          <div className="space-y-2.5 pt-1">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all duration-200 ${
                m.status === 'CURRENT' 
                  ? 'bg-blue-950/40 border-blue-500/50 shadow-md shadow-blue-900/20' 
                  : m.status === 'COMPLETED' 
                  ? 'bg-zinc-900/60 border-white/[0.04] opacity-85' 
                  : 'bg-zinc-900/30 border-white/[0.03] opacity-60'
              }">
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] ${
                    m.status === 'COMPLETED' ? 'bg-emerald-500 text-black' :
                    m.status === 'CURRENT' ? 'bg-blue-500 text-white animate-pulse' :
                    'bg-zinc-800 text-zinc-400'
                  }`}>
                    {m.status === 'COMPLETED' ? '✓' : idx + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-white flex items-center space-x-1.5">
                      <span>{m.name}</span>
                      {m.status === 'CURRENT' && (
                        <span className="text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 px-1.5 py-0.2 rounded">
                          CURRENT LOCATION
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      Elevation: {formatElevation(m.elev)}
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono text-xs">
                  <span className={`font-bold ${
                    m.status === 'CURRENT' ? 'text-cyan-300' :
                    m.status === 'COMPLETED' ? 'text-emerald-400' :
                    'text-zinc-500'
                  }`}>
                    {m.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Cargo Manifest Details */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400 font-medium flex items-center space-x-1.5">
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>Manifest: <strong className="text-white">{vehicle.cargo}</strong></span>
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded font-semibold">
              Verified
            </span>
          </div>
        </div>

        {/* 4. Action Buttons */}
        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={() => {
              if (onTrackOnMap) {
                onTrackOnMap(vehicle);
              }
              onClose();
            }}
            className="flex-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-2xl text-xs shadow-xl shadow-blue-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
          >
            <Crosshair className="w-4 h-4 text-white" />
            <span>Track Live Camera on Map</span>
          </button>
          
          <button
            onClick={onClose}
            className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-semibold px-5 py-3 rounded-2xl text-xs transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
