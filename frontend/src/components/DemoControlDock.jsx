import React, { useState } from 'react';
import { 
  Sparkles, Play, ShieldAlert, CheckCircle2, Navigation, 
  Truck, Car, Plane, Thermometer, Shield, User, ChevronUp, 
  ChevronDown, RefreshCw, AlertTriangle, Radio, Check, Flame, X
} from 'lucide-react';
import { DEMO_USERS } from './AuthModal';

export default function DemoControlDock({
  currentUser,
  onSwitchUser,
  onRunScenario,
  onClearAllRoadblocks,
  onSimulateColdBreach,
  onNavigateToDriverNav,
  activeIncidentsCount = 0
}) {
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default for clean uncluttered view
  const [activeScenarioName, setActiveScenarioName] = useState(null);

  const handleRun = (scenarioKey, label) => {
    setActiveScenarioName(label);
    onRunScenario(scenarioKey);
    setTimeout(() => setActiveScenarioName(null), 3500);
  };

  return (
    <aside aria-label="Demo and Scenario Controls" className="fixed bottom-3 right-4 z-50 select-none font-sans">
      {!isExpanded ? (
        /* Sleek Unobtrusive Floating Capsule */
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-cyan-950/90 hover:from-purple-900 hover:to-cyan-900 text-white font-bold text-xs px-4 py-2.5 rounded-2xl shadow-2xl border border-cyan-400/40 backdrop-blur-2xl flex items-center space-x-2.5 transition active:scale-95 group ring-1 ring-white/10"
          title="Open Judge 1-Click Test Scenarios & Multi-Role Switcher"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500 shadow-sm shadow-cyan-400"></span>
          </span>
          <Sparkles className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-black tracking-wide">Test Scenarios & Roles</span>
          <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-1.5 py-0.5 rounded-full border border-cyan-400/30">
            4
          </span>
        </button>
      ) : (
        /* Expanded Floating Glass Dock */
        <div className="w-[95vw] sm:w-[720px] max-w-full rounded-3xl p-3.5 shadow-2xl border border-cyan-400/40 backdrop-blur-2xl bg-[#080c1af0] animate-fadeIn transition-all duration-300 space-y-3">
          {/* Header Bar */}
          <div className="flex items-center justify-between gap-2 border-b border-white/[0.08] pb-2 text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-black text-white tracking-wide text-xs">
                JUDGE 1-CLICK TEST & SCENARIO DOCK
              </span>
              {activeScenarioName && (
                <span className="bg-emerald-950 text-emerald-300 border border-emerald-700 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold animate-pulse">
                  ✓ {activeScenarioName}
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2">
              {/* Quick Persona Switcher */}
              <div className="hidden sm:flex items-center space-x-1 bg-zinc-950/80 p-1 rounded-2xl border border-white/[0.08]">
                {DEMO_USERS.map(u => {
                  const isCurrent = currentUser?.username === u.username;
                  const shortLabel = u.role === 'ROLE_ADMIN' ? 'Admin' :
                                     u.role === 'ROLE_BRO_INSPECTOR' ? 'BRO' :
                                     u.role === 'ROLE_DISPATCHER' ? 'Dispatch' : 
                                     `Driver (${u.name.split(' ')[0]})`;

                  return (
                    <button
                      key={u.username}
                      onClick={() => onSwitchUser(u)}
                      className={`px-2 py-0.5 rounded-xl text-[10px] font-bold transition ${
                        isCurrent
                          ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30 font-extrabold'
                          : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                      }`}
                      title={`Switch to ${u.name} (${u.roleLabel})`}
                    >
                      {shortLabel}
                    </button>
                  );
                })}
              </div>

              {/* Quick Launch Driver GPS Navigator */}
              {onNavigateToDriverNav && (
                <button
                  onClick={() => {
                    onNavigateToDriverNav();
                    setIsExpanded(false);
                  }}
                  className="bg-emerald-600/30 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/50 px-2.5 py-1 rounded-xl text-[10px] font-extrabold flex items-center space-x-1 transition shadow-sm"
                  title="Launch In-Cabin Field Driver GPS Navigator"
                >
                  <Truck className="w-3 h-3 text-emerald-300" />
                  <span>Driver GPS</span>
                </button>
              )}

              {/* Close Button */}
              <button
                onClick={() => setIsExpanded(false)}
                className="p-1 rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.08] transition"
                title="Minimize Dock"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4 Interactive Test Scenarios Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {/* Scenario 1: Sonapur Detour */}
            <button
              onClick={() => handleRun('SONAPUR_DETOUR', 'Sonapur NH-6 Detour')}
              className="bg-gradient-to-r from-cyan-950/80 to-blue-950/80 hover:from-cyan-900/90 hover:to-blue-900/90 border border-cyan-500/40 hover:border-cyan-400 p-2.5 rounded-2xl text-left transition group shadow-sm active:scale-95"
            >
              <div className="flex items-center justify-between text-cyan-300 mb-1">
                <div className="flex items-center space-x-1 font-bold text-[11px]">
                  <Play className="w-3 h-3 fill-cyan-400 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>1. Sonapur Detour</span>
                </div>
                <span className="text-[9px] font-mono bg-cyan-900/80 px-1.5 py-0.2 rounded text-cyan-200">
                  NH-6
                </span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-tight">
                Blocks NH-6 ➔ Detour via <strong>Dawki Bypass</strong>
              </p>
            </button>

            {/* Scenario 2: Sela Pass 4x4 */}
            <button
              onClick={() => handleRun('SELA_PASS_4X4', 'Sela Pass 4x4 Bypass')}
              className="bg-gradient-to-r from-amber-950/80 to-orange-950/80 hover:from-amber-900/90 hover:to-orange-900/90 border border-amber-500/40 hover:border-amber-400 p-2.5 rounded-2xl text-left transition group shadow-sm active:scale-95"
            >
              <div className="flex items-center justify-between text-amber-300 mb-1">
                <div className="flex items-center space-x-1 font-bold text-[11px]">
                  <Play className="w-3 h-3 fill-amber-400 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
                  <span>2. Sela 4x4 Bypass</span>
                </div>
                <span className="text-[9px] font-mono bg-amber-900/80 px-1.5 py-0.2 rounded text-amber-200">
                  4,170m
                </span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-tight">
                Blocks Sela Pass ➔ <strong>Sangti 4x4 Track</strong>
              </p>
            </button>

            {/* Scenario 3: Cold Chain Failure */}
            <button
              onClick={() => {
                onSimulateColdBreach();
                setIsExpanded(false);
              }}
              className="bg-gradient-to-r from-purple-950/80 to-indigo-950/80 hover:from-purple-900/90 hover:to-indigo-900/90 border border-purple-500/40 hover:border-purple-400 p-2.5 rounded-2xl text-left transition group shadow-sm active:scale-95"
            >
              <div className="flex items-center justify-between text-purple-300 mb-1">
                <div className="flex items-center space-x-1 font-bold text-[11px]">
                  <Thermometer className="w-3 h-3 text-purple-400 animate-pulse" />
                  <span>3. Cold Failure</span>
                </div>
                <span className="text-[9px] font-mono bg-purple-900/80 px-1.5 py-0.2 rounded text-purple-200">
                  +9.4°C
                </span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-tight">
                Simulates spoilage ➔ <strong>Drone Airlift</strong>
              </p>
            </button>

            {/* Scenario 4: Clear All Roadblocks */}
            <button
              onClick={() => {
                onClearAllRoadblocks();
                setActiveScenarioName("All Highways Cleared");
                setTimeout(() => setActiveScenarioName(null), 3000);
              }}
              className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900/90 hover:to-teal-900/90 border border-emerald-500/40 hover:border-emerald-400 p-2.5 rounded-2xl text-left transition group shadow-sm active:scale-95"
            >
              <div className="flex items-center justify-between text-emerald-300 mb-1">
                <div className="flex items-center space-x-1 font-bold text-[11px]">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span>4. Clear Roads</span>
                </div>
                <span className="text-[9px] font-mono bg-emerald-900/80 px-1.5 py-0.2 rounded text-emerald-200">
                  100%
                </span>
              </div>
              <p className="text-[10px] text-zinc-300 leading-tight">
                BRO Certified ➔ <strong>Restores Expressways</strong>
              </p>
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
