import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, ShieldAlert, Zap, Clock, Thermometer, 
  CheckCircle2, ArrowRight, Plane, Building2, Radio, 
  RotateCcw, Sparkles, X, ChevronRight, Fuel, ShieldCheck
} from 'lucide-react';
import { NER_WAREHOUSES_DATA, NER_TOPOLOGY_LOCATIONS } from '../data/mockMasterData';
import { formatDuration, formatElevation, formatDistance } from '../utils/formatters';

export default function ColdChainSimulatorModal({ 
  isOpen, 
  onClose, 
  onTriggerDiversion, 
  onResetSimulation 
}) {
  const [simulationState, setSimulationState] = useState('IDLE'); // 'IDLE', 'BREACH_ACTIVE', 'DIVERSIFIED', 'DRONE_DISPATCHED'
  const [chamberTemp, setChamberTemp] = useState(4.2);
  const [countdownSeconds, setCountdownSeconds] = useState(2700); // 45 minutes
  const [selectedVehicle, setSelectedVehicle] = useState('NER-TRUCK-AS01-9921');
  const [droneEta, setDroneEta] = useState(14);

  // Selected vehicle & cargo details
  const vaccineCargo = {
    batchId: "COV-VAX-2026-NER-8891",
    type: "Polio, Measles & Rabies Vaccines",
    quantity: "4,200 Doses (Cold Chain Priority 1)",
    safeRange: "+2.0°C to +8.0°C",
    criticalDegradationTemp: "+10.0°C",
    currentOrigin: "Guwahati Central Gateway",
    originalDestination: "Tawang High-Altitude Depot"
  };

  // Nearest cold storage depot calculated by AI
  const nearestDepot = {
    code: "WH-GHY-CENTRAL",
    name: "Guwahati Central Gateway Logistics Hub",
    distanceKm: 42,
    etaMinutes: 22,
    coldCapacityMT: 3500,
    availableSpace: "Optimal (Backup generator active)",
    contact: "Pranab Barman (+91-94350-11223)"
  };

  // Timer effect when breach is active
  useEffect(() => {
    let timer;
    if (simulationState === 'BREACH_ACTIVE') {
      timer = setInterval(() => {
        setChamberTemp(prev => Number(Math.min(13.5, prev + 0.35).toFixed(1)));
        setCountdownSeconds(prev => Math.max(0, prev - 15));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [simulationState]);

  if (!isOpen) return null;

  const handleStartMalfunction = () => {
    setSimulationState('BREACH_ACTIVE');
    setChamberTemp(8.6);
    setCountdownSeconds(2400); // 40 mins
  };

  const handleExecuteRoadDiversion = () => {
    setSimulationState('DIVERSIFIED');
    if (onTriggerDiversion) {
      onTriggerDiversion({
        type: 'ROAD_DIVERSION',
        targetDepot: nearestDepot,
        vehicleId: selectedVehicle,
        chamberTemp: chamberTemp
      });
    }
  };

  const handleExecuteDroneAirlift = () => {
    setSimulationState('DRONE_DISPATCHED');
    if (onTriggerDiversion) {
      onTriggerDiversion({
        type: 'DRONE_AIRLIFT',
        targetDepot: nearestDepot,
        vehicleId: selectedVehicle,
        chamberTemp: chamberTemp
      });
    }
  };

  const handleReset = () => {
    setSimulationState('IDLE');
    setChamberTemp(4.2);
    setCountdownSeconds(2700);
    if (onResetSimulation) {
      onResetSimulation();
    }
  };

  const minutesRemaining = Math.floor(countdownSeconds / 60);
  const secondsRemaining = countdownSeconds % 60;
  const isTempCritical = chamberTemp > 8.0;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none">
      <div className="saas-card bg-[#090d18] border border-white/[0.1] rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative text-white space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-white/[0.06] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Cold-Chain Vaccine Malfunction & AI Diversion Simulator</h3>
            <p className="text-xs text-zinc-400">Tests real-time IoT thermal breach detection and automated depot diversion</p>
          </div>
        </div>

        {/* 1. Cargo & Reefer Status Overview */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-xs">
              <span className="text-zinc-400 block font-medium">Active Vaccine Payload:</span>
              <strong className="text-white text-sm">{vaccineCargo.type}</strong>
            </div>
            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-1 rounded-full font-bold">
              Batch: {vaccineCargo.batchId}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-xs">
            <div className="bg-zinc-900 p-2.5 rounded-xl border border-white/[0.04]">
              <span className="text-zinc-500 block text-[10px] font-sans">Safe Temperature</span>
              <span className="text-emerald-400 font-bold">{vaccineCargo.safeRange}</span>
            </div>
            <div className="bg-zinc-900 p-2.5 rounded-xl border border-white/[0.04]">
              <span className="text-zinc-500 block text-[10px] font-sans">Critical Threshold</span>
              <span className="text-rose-400 font-bold">&gt; +10.0°C</span>
            </div>
            <div className="bg-zinc-900 p-2.5 rounded-xl border border-white/[0.04]">
              <span className="text-zinc-500 block text-[10px] font-sans">Quantity</span>
              <span className="text-white font-bold">{vaccineCargo.quantity.split(' ')[0]} Doses</span>
            </div>
          </div>
        </div>

        {/* 2. Live Simulation Telemetry Chamber */}
        <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
          isTempCritical 
            ? 'bg-rose-950/30 border-rose-500/50 shadow-lg shadow-rose-900/20' 
            : 'bg-zinc-950 border-white/[0.06]'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-3 h-3 rounded-full ${isTempCritical ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
              <span className="font-bold text-xs uppercase tracking-wider text-zinc-300">
                {simulationState === 'IDLE' ? 'Chamber Status: Optimal (+4.2°C)' : '🚨 REEFER REFRIGERATION MALFUNCTION DETECTED'}
              </span>
            </div>
            <span className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${
              isTempCritical ? 'bg-rose-950 text-rose-300 border-rose-800 animate-pulse' : 'bg-emerald-950 text-emerald-300 border-emerald-800'
            }`}>
              {isTempCritical ? 'THERMAL BREACH' : 'SAFE'}
            </span>
          </div>

          {/* Temperature & Countdown Dials */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900 p-4 rounded-2xl border border-white/[0.06] text-center space-y-1">
              <span className="text-xs text-zinc-400 font-sans">Live Chamber Temp</span>
              <div className={`text-3xl font-mono font-black ${isTempCritical ? 'text-rose-400' : 'text-emerald-400'}`}>
                +{chamberTemp}°C
              </div>
              <span className="text-[10px] text-zinc-500 font-sans block">
                {isTempCritical ? 'Exceeding +8°C safety margin' : 'Within normal cold envelope'}
              </span>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-white/[0.06] text-center space-y-1">
              <span className="text-xs text-zinc-400 font-sans">Spoilage Countdown Buffer</span>
              <div className={`text-3xl font-mono font-black ${isTempCritical ? 'text-amber-400 animate-pulse' : 'text-zinc-300'}`}>
                {minutesRemaining}m {secondsRemaining < 10 ? `0${secondsRemaining}` : secondsRemaining}s
              </div>
              <span className="text-[10px] text-zinc-500 font-sans block">
                Estimated thermal inertia remaining
              </span>
            </div>
          </div>
        </div>

        {/* 3. AI Automated Decision & Actions */}
        {simulationState === 'IDLE' && (
          <div className="space-y-3">
            <button
              onClick={handleStartMalfunction}
              className="w-full bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 hover:from-rose-500 hover:to-amber-500 text-white font-bold py-3.5 rounded-2xl text-xs shadow-xl shadow-rose-600/30 flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <Zap className="w-4 h-4 text-white" />
              <span>Trigger Mobile Cooling Malfunction Test</span>
            </button>
          </div>
        )}

        {simulationState === 'BREACH_ACTIVE' && (
          <div className="space-y-3 bg-zinc-950 p-4 rounded-2xl border border-cyan-500/40">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs">
              <Sparkles className="w-4 h-4" />
              <span>AI Automated Emergency Salvage Options Calculated:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* Option A: Road Diversion */}
              <div 
                onClick={handleExecuteRoadDiversion}
                className="bg-zinc-900 hover:bg-zinc-850 p-3.5 rounded-2xl border border-emerald-500/40 cursor-pointer transition hover:border-emerald-400 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-emerald-400 flex items-center space-x-1.5">
                    <Building2 className="w-4 h-4" />
                    <span>Option A: Road Diversion</span>
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold">
                    ETA: {nearestDepot.etaMinutes}m
                  </span>
                </div>
                <div className="text-xs text-white font-medium">{nearestDepot.name}</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Fastest accessible certified cold storage facility. Arrives in <strong>22 min</strong> (well within 40 min countdown buffer).
                </p>
                <div className="text-[10px] text-emerald-400 font-bold flex items-center space-x-1 pt-1">
                  <span>Execute Road Diversion</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>

              {/* Option B: Drone Extraction */}
              <div 
                onClick={handleExecuteDroneAirlift}
                className="bg-zinc-900 hover:bg-zinc-850 p-3.5 rounded-2xl border border-purple-500/40 cursor-pointer transition hover:border-purple-400 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-purple-400 flex items-center space-x-1.5">
                    <Plane className="w-4 h-4" />
                    <span>Option B: Drone Extraction</span>
                  </span>
                  <span className="text-[10px] font-mono bg-purple-950 text-purple-300 px-2 py-0.5 rounded font-bold">
                    ETA: 14m
                  </span>
                </div>
                <div className="text-xs text-white font-medium">Airlift to Destination Hospital Helipad</div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Dispatches Autonomous Cargo Drone (AI-07) with active cooling cold-box to fly directly to truck coordinates.
                </p>
                <div className="text-[10px] text-purple-400 font-bold flex items-center space-x-1 pt-1">
                  <span>Dispatch Drone Airlift</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Post-Diversion Confirmation */}
        {(simulationState === 'DIVERSIFIED' || simulationState === 'DRONE_DISPATCHED') && (
          <div className="bg-emerald-950/40 border border-emerald-500/50 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>
                  {simulationState === 'DIVERSIFIED' 
                    ? 'Emergency Road Diversion Active: In Transit to Guwahati Cold Hub' 
                    : 'Drone Airlift Dispatched: Autonomous Intercept in 14 min'}
                </span>
              </div>
              <span className="text-[10px] font-mono bg-emerald-900 text-emerald-200 px-2 py-0.5 rounded font-bold">
                PROTECTED
              </span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {simulationState === 'DIVERSIFIED'
                ? `The AI has plotted an emergency priority route to ${nearestDepot.name}. Driver navigation updated with green-channel convoy priority.`
                : 'Autonomous Medical Drone (AI-07) is en route to rendezvous with the truck at the nearest flat staging bay.'}
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleReset}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Simulation</span>
              </button>
              <button
                onClick={onClose}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                View on Operations Map
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
