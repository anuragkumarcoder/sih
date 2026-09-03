import React, { useState } from 'react';
import { 
  Compass, AlertTriangle, ShieldCheck, Database, 
  Layers, Mountain, Activity, Radio, Plus, Thermometer, Sparkles,
  User, Lock, Truck, Shield, LayoutDashboard, Navigation, RadioTower,
  Volume2, VolumeX, Terminal, Cpu
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  backendOnline, 
  aiOnline, 
  onOpenIncidentModal,
  onOpenColdChainSimulator,
  onOpenAddConvoyModal,
  onOpenAuthModal,
  currentUser
}) {
  const [audioActive, setAudioActive] = useState(true);
  const role = currentUser?.role || 'ROLE_ADMIN';

  const roleTabConfig = {
    ROLE_FIELD_DRIVER: { 
      label: 'Mountain Pilot HUD', 
      icon: <Truck className="w-3.5 h-3.5 text-emerald-400" />,
      accent: 'border-emerald-500/60 text-emerald-300'
    },
    ROLE_BRO_INSPECTOR: { 
      label: 'BRO Hazard Command', 
      icon: <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />,
      accent: 'border-amber-500/60 text-amber-300'
    },
    ROLE_DISPATCHER: { 
      label: 'Fleet Dispatch Matrix', 
      icon: <Compass className="w-3.5 h-3.5 text-cyan-400" />,
      accent: 'border-cyan-500/60 text-cyan-300'
    },
    ROLE_ADMIN: { 
      label: 'DoNER Strategic Command', 
      icon: <Shield className="w-3.5 h-3.5 text-purple-400" />,
      accent: 'border-purple-500/60 text-purple-300'
    }
  };

  const currentRoleTab = roleTabConfig[role] || roleTabConfig.ROLE_ADMIN;

  const allTabs = [
    { id: 'dashboard', label: currentRoleTab.label, icon: currentRoleTab.icon },
    { id: 'driver_nav', label: 'Driver GPS Navigator', icon: <Truck className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> },
    { id: 'map', label: 'Operations Map', icon: <Layers className="w-3.5 h-3.5 text-blue-400" /> },
    { id: 'routing', label: 'AI Route Planner', icon: <Navigation className="w-3.5 h-3.5 text-teal-400" /> },
    { id: 'hazards', label: 'Risk Lab', icon: <Activity className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'data', label: 'Data Architecture', icon: <Database className="w-3.5 h-3.5 text-indigo-400" /> },
  ];

  const navTabs = allTabs.filter(tab => 
    !currentUser || currentUser.allowedTabs.includes(tab.id)
  );

  return (
    <header className="sticky top-0 z-40 select-none font-sans">
      {/* 1. LUSION KINETIC MOUNTAIN ADVISORY & SOUNDWAVE TICKER */}
      <div className="bg-[#03050a]/90 backdrop-blur-md border-b border-white/[0.06] px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2.5 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500 shadow-sm shadow-rose-500"></span>
          </span>
          <span className="font-bold text-rose-400 uppercase tracking-widest text-[9px] bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800/40">
            Live Mountain Advisory
          </span>
          <span className="text-zinc-300 truncate text-[11px] font-medium">
            NH-13 Sela Pass (4,170m) blocked by rockfall • NH-29 Pagla Pahar single-lane open • Drone Corridors VFR Clear
          </span>
        </div>

        <div className="hidden sm:flex items-center space-x-3 text-[11px] font-mono text-zinc-400 shrink-0">
          {/* Lusion Audio Wave Simulation Pill */}
          <button
            onClick={() => setAudioActive(!audioActive)}
            className="flex items-center space-x-1.5 bg-zinc-950/80 hover:bg-zinc-900 border border-white/[0.08] px-2.5 py-0.5 rounded-full text-zinc-400 hover:text-white transition"
            title="Toggle Ambient Audio Telemetry Feed"
          >
            <div className="flex items-end space-x-0.5 h-3">
              <span className={`w-0.5 bg-cyan-400 rounded-full ${audioActive ? 'soundwave-bar' : 'h-1.5'}`} style={{ animationDelay: '0.1s' }}></span>
              <span className={`w-0.5 bg-cyan-400 rounded-full ${audioActive ? 'soundwave-bar' : 'h-2.5'}`} style={{ animationDelay: '0.3s' }}></span>
              <span className={`w-0.5 bg-cyan-400 rounded-full ${audioActive ? 'soundwave-bar' : 'h-1'}`} style={{ animationDelay: '0.2s' }}></span>
              <span className={`w-0.5 bg-cyan-400 rounded-full ${audioActive ? 'soundwave-bar' : 'h-3'}`} style={{ animationDelay: '0.4s' }}></span>
            </div>
            <span className="text-[10px] text-zinc-400 font-sans font-semibold">
              {audioActive ? 'Telemetry Online' : 'Muted'}
            </span>
          </button>

          <span className="text-cyan-400 flex items-center space-x-1.5 font-sans font-semibold bg-cyan-950/40 px-2.5 py-0.5 rounded-full border border-cyan-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Terrain Engine v2.0</span>
          </span>
        </div>
      </div>

      {/* 2. FLOATING LIQUID GLASS HEADER BAR */}
      <div className="bg-[#05070e]/80 backdrop-blur-2xl border-b border-white/[0.08] px-4 sm:px-6 py-2.5">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-4">
          
          {/* Futuristic Brand Identity */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 via-teal-600 to-indigo-700 flex items-center justify-center text-white shadow-xl shadow-cyan-500/25 group-hover:scale-105 group-hover:shadow-cyan-500/40 transition-all duration-300 ring-1 ring-white/20">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-black text-sm tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-400">
                  NER LOGISTICS
                </span>
                <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[9px] font-mono px-2 py-0.2 rounded-full font-bold shadow-sm">
                  SIH26002
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 tracking-wider block font-medium">
                North Eastern Accessibility Platform
              </span>
            </div>
          </div>

          {/* Center Navigation Pill Bar */}
          <nav className="hidden md:flex items-center space-x-1 bg-zinc-950/80 p-1 rounded-2xl border border-white/[0.08] shadow-inner">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 relative ${
                    isActive
                      ? 'bg-zinc-800 text-white shadow-md border border-white/[0.12]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Pods */}
          <div className="flex items-center space-x-2.5">
            {/* Dispatch Convoy Button */}
            <button
              onClick={onOpenAddConvoyModal}
              className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-emerald-600/25 border border-emerald-400/30 transition active:scale-95 whitespace-nowrap"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>+ Dispatch Convoy</span>
            </button>

            {/* Cold Chain Failure Simulation Trigger */}
            <button
              onClick={onOpenColdChainSimulator}
              className="hidden lg:flex items-center space-x-1.5 bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-cyan-600/25 border border-cyan-400/30 transition active:scale-95 whitespace-nowrap"
            >
              <Thermometer className="w-3.5 h-3.5 text-cyan-200 animate-pulse" />
              <span>Test Cold Failure</span>
            </button>

            {/* Report Hazard Action */}
            <button
              onClick={onOpenIncidentModal}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-rose-600/30 border border-rose-400/30 transition active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Report Hazard</span>
              <span className="sm:hidden">Report</span>
            </button>

            {/* Active User RBAC Persona Switcher */}
            {currentUser && (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center space-x-2.5 bg-zinc-950 hover:bg-zinc-900 border border-white/[0.12] hover:border-purple-500/40 px-3.5 py-1.5 rounded-xl transition-all duration-200 text-left cursor-pointer group shadow-md"
                title="Click to Switch User Role / Inspect JWT"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-300 group-hover:scale-105 transition-transform">
                  <User className="w-4 h-4" />
                </div>
                <div className="hidden xl:block">
                  <div className="text-[11px] font-bold text-white leading-tight flex items-center space-x-1">
                    <span>{currentUser.name.split(' ')[0]}</span>
                    <span className="text-[9px] font-mono text-purple-400 font-extrabold bg-purple-950/80 px-1.5 py-0.2 rounded border border-purple-800/60">
                      {currentUser.role.replace('ROLE_', '')}
                    </span>
                  </div>
                  <span className="text-[9px] text-zinc-400 block font-normal leading-tight">RBAC Active</span>
                </div>
              </button>
            )}

            {/* Microservice Health Indicators */}
            <div className="hidden 2xl:flex items-center space-x-2 border-l border-white/[0.08] pl-3">
              <div className="flex items-center space-x-1.5 text-[11px] bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-white/[0.06]">
                <span className={`w-2 h-2 rounded-full ${backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="text-zinc-400">Spring: <strong className="text-zinc-200">{backendOnline ? 'Online' : 'Mock'}</strong></span>
              </div>
              <div className="flex items-center space-x-1.5 text-[11px] bg-zinc-950 px-2.5 py-1.5 rounded-xl border border-white/[0.06]">
                <span className={`w-2 h-2 rounded-full ${aiOnline ? 'bg-cyan-400 animate-pulse' : 'bg-purple-400'}`} />
                <span className="text-zinc-400">AI: <strong className="text-zinc-200">{aiOnline ? 'FastAPI' : 'Loaded'}</strong></span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
