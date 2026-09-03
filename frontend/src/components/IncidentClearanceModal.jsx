import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, AlertTriangle, Activity, Clock, Send, 
  CheckCircle2, Trash2, X, Sliders, Lock, Sparkles, Check
} from 'lucide-react';
import { formatElevation } from '../utils/formatters';

export default function IncidentClearanceModal({
  isOpen,
  onClose,
  incident,
  currentUser,
  onUpdateProgress,
  onToggleVerify,
  onDismiss
}) {
  if (!isOpen || !incident) return null;

  const isBRO = currentUser?.role === 'ROLE_BRO_INSPECTOR' || currentUser?.role === 'ROLE_ADMIN';
  
  const [percent, setPercent] = useState(incident.clearancePercent !== undefined ? incident.clearancePercent : 0);
  const [hours, setHours] = useState(incident.clearanceHours || 4);
  const [sitrep, setSitrep] = useState('');
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (incident) {
      setPercent(incident.clearancePercent !== undefined ? incident.clearancePercent : 0);
      setHours(incident.clearanceHours || 4);
      setSitrep('');
      setSavedNotice(false);
    }
  }, [incident]);

  const presetMessages = [
    "2x Komatsu Heavy Excavators deployed. Rock clearing active.",
    "Boulder blasting completed. Single lane open for 4x4 convoys.",
    "Road bed graded and stabilized with shingle gravel.",
    "High-capacity water pumps cleared floodwater. Road operational.",
    "100% Debris cleared. Highway reopened for all freight traffic."
  ];

  const handleApplyPreset = (msg, suggestedPercent) => {
    setSitrep(msg);
    if (suggestedPercent !== undefined) {
      setPercent(suggestedPercent);
    }
  };

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (onUpdateProgress) {
      onUpdateProgress(incident.id, Number(percent), Number(hours), sitrep.trim());
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 900);
  };

  const handleReopenRoad = () => {
    if (onUpdateProgress) {
      onUpdateProgress(incident.id, 100, 0, "Official BRO Notice: 100% Clearance achieved. Highway reopened for all vehicles.");
    }
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-fadeIn">
      <div className="liquid-glass bg-[#090d18] border border-cyan-500/40 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-white space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
            <Sliders className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-lg text-white font-mono">
                Hazard Clearance Governance
              </h3>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                ADMIN AUTHORIZED
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              {incident.roadName} • {incident.hazardType} ({incident.severity})
            </p>
          </div>
        </div>

        {/* Success Alert Banner */}
        {savedNotice && (
          <div className="bg-emerald-950/80 border border-emerald-500/60 p-3 rounded-2xl flex items-center space-x-2 text-emerald-300 text-xs font-bold animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>✓ Clearance State Updated & Broadcasted to All Fleet Drivers!</span>
          </div>
        )}

        {/* Current Incident Summary Card */}
        <div className="bg-zinc-950/80 p-3.5 rounded-2xl border border-white/[0.06] space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400">Current Verification Status:</span>
            <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
              incident.verified 
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}>
              {incident.verified ? 'BRO Certified Roadblock' : 'Pending Verification'}
            </span>
          </div>
          <p className="text-zinc-300 leading-relaxed bg-zinc-900/60 p-2.5 rounded-xl border border-white/[0.04]">
            {incident.description}
          </p>
        </div>

        {/* 1. Real-Time Clearance Progress Slider */}
        <div className="bg-zinc-950/90 p-4 rounded-2xl border border-white/[0.08] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Real-Time Clearance Percentage:</span>
            </span>
            <div className="text-xl font-extrabold font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-3 py-0.5 rounded-xl shadow-inner">
              {percent}%
            </div>
          </div>

          <div className="space-y-1.5">
            <input
              type="range"
              min="0"
              max="100"
              value={percent}
              onChange={(e) => setPercent(Number(e.target.value))}
              className="w-full h-3 bg-zinc-900 rounded-lg appearance-none cursor-pointer accent-cyan-400 border border-white/10"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono px-1">
              <span>0% (Reported)</span>
              <span>25% (Excavator Deployed)</span>
              <span>50% (1-Lane Open)</span>
              <span>75% (Grading)</span>
              <span>100% (Cleared)</span>
            </div>
          </div>
        </div>

        {/* 2. Remaining Hours Input */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-zinc-950/80 p-3 rounded-2xl border border-white/[0.06] space-y-1.5">
            <label className="text-zinc-400 block font-semibold flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Estimated Hours Remaining:</span>
            </label>
            <input
              type="number"
              min="0"
              max="72"
              step="0.5"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="bg-zinc-950/80 p-3 rounded-2xl border border-white/[0.06] space-y-1.5">
            <label className="text-zinc-400 block font-semibold">Broadcasting Authority:</label>
            <div className="font-bold text-white text-xs pt-1 truncate">
              {currentUser?.name || "BRO Official"}
            </div>
            <div className="text-[10px] text-cyan-400 font-mono">
              {currentUser?.role === 'ROLE_ADMIN' ? 'Ministry of DoNER Admin' : 'BRO Task Force 88'}
            </div>
          </div>
        </div>

        {/* 3. Official SITREP News Log Composer */}
        <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/[0.06] space-y-2.5 text-xs">
          <label className="font-bold text-white uppercase tracking-wider block flex items-center space-x-1.5">
            <Send className="w-3.5 h-3.5 text-cyan-400" />
            <span>Broadcast Official SITREP News Bulletin:</span>
          </label>

          <textarea
            value={sitrep}
            onChange={(e) => setSitrep(e.target.value)}
            rows={2}
            placeholder="Type official situation update for field drivers..."
            className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-white text-xs resize-none focus:outline-none focus:border-cyan-400 leading-relaxed"
          />

          {/* Quick Preset Chips */}
          <div className="space-y-1">
            <span className="text-[10px] text-zinc-400 font-semibold block">Quick SITREP Presets:</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleApplyPreset("2x Heavy Excavators deployed on-site. Boulder clearance in progress.", 25)}
                className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-zinc-300 px-2.5 py-1 rounded-lg border border-white/[0.06] transition"
              >
                🚜 Excavators Deployed (25%)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("Debris 50% cleared. Single lane opened for regulated 4x4 convoys.", 50)}
                className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 transition"
              >
                🛣️ 1-Lane Open (50%)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset("Gravel bed stabilized. Grader smoothing bypass. Multi-axle clearance soon.", 75)}
                className="text-[10px] bg-zinc-900 hover:bg-zinc-800 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition"
              >
                🚧 Grading 75%
              </button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/[0.08]">
          <div className="flex items-center space-x-2">
            {onDismiss && (
              <button
                type="button"
                onClick={() => { onDismiss(incident.id); onClose(); }}
                className="bg-zinc-900 hover:bg-rose-950/60 text-zinc-400 hover:text-rose-300 text-xs font-semibold px-3 py-2 rounded-xl border border-white/[0.08] transition flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Dismiss Report</span>
              </button>
            )}
            {onToggleVerify && (
              <button
                type="button"
                onClick={() => onToggleVerify(incident.id)}
                className={`text-xs font-bold px-3 py-2 rounded-xl border transition ${
                  incident.verified 
                    ? 'bg-amber-950/60 text-amber-300 border-amber-600/40 hover:bg-amber-900' 
                    : 'bg-emerald-600 text-white border-emerald-500'
                }`}
              >
                {incident.verified ? "Revoke Verification" : "✓ Certify Roadblock"}
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleReopenRoad}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-400/30 flex items-center space-x-1.5 transition active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark 100% Cleared & Reopen</span>
            </button>

            <button
              type="button"
              onClick={handleBroadcast}
              className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 border border-cyan-400/30 flex items-center space-x-1.5 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast SITREP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
