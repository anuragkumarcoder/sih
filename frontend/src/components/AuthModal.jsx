import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, User, Key, CheckCircle2, 
  X, LogIn, Sparkles, Shield, AlertTriangle, Truck, Compass, Database
} from 'lucide-react';

export const DEMO_USERS = [
  {
    username: "admin@doner.gov.in",
    name: "Dr. T. Sangma",
    role: "ROLE_ADMIN",
    roleLabel: "DoNER Central Administrator",
    department: "Ministry of Development of North Eastern Region",
    clearance: "Level 5 (Unrestricted Full Access)",
    allowedTabs: ["dashboard", "driver_nav", "map", "routing", "hazards", "data"],
    badgeColor: "bg-purple-950 text-purple-300 border-purple-800"
  },
  {
    username: "dispatcher@nerlogistics.in",
    name: "Pranab Barman",
    role: "ROLE_DISPATCHER",
    roleLabel: "Regional Fleet Dispatcher",
    department: "Guwahati Central Gateway Logistics Hub",
    clearance: "Level 4 (Routing & Cold Chain Control)",
    allowedTabs: ["dashboard", "driver_nav", "map", "routing", "hazards"],
    badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-800"
  },
  {
    username: "inspector.norbu@bro.gov.in",
    name: "Maj. Tsering Norbu",
    role: "ROLE_BRO_INSPECTOR",
    roleLabel: "BRO Road Clearance Inspector",
    department: "Border Roads Task Force 88 (Sela Pass Sector)",
    clearance: "Level 3 (Hazard Verification & Roadblocks)",
    allowedTabs: ["dashboard", "driver_nav", "map", "hazards"],
    badgeColor: "bg-amber-950 text-amber-300 border-amber-800"
  },
  {
    username: "driver.biren@truckfleet.in",
    name: "Biren Gogoi",
    role: "ROLE_FIELD_DRIVER",
    roleLabel: "Assam Multi-Axle Freight Pilot",
    department: "Assam Strategic Logistics Unit",
    assignedVehicleId: "NER-TRUCK-AS01-9921",
    clearance: "Level 2 (Driver HUD & SOS Incident Report)",
    allowedTabs: ["dashboard", "driver_nav", "map"],
    badgeColor: "bg-emerald-950 text-emerald-300 border-emerald-800"
  },
  {
    username: "driver.tsering@offroad.in",
    name: "Tsering Norbu (Driver)",
    role: "ROLE_FIELD_DRIVER",
    roleLabel: "Arunachal High-Alpine 4x4 Pilot",
    department: "Tawang High-Altitude Unit",
    assignedVehicleId: "NER-4X4-AR03-1044",
    clearance: "Level 2 (Driver HUD & SOS Incident Report)",
    allowedTabs: ["dashboard", "driver_nav", "map"],
    badgeColor: "bg-amber-950 text-amber-300 border-amber-800"
  },
  {
    username: "driver.kevichusa@nagaland.in",
    name: "Kevichusa Angami",
    role: "ROLE_FIELD_DRIVER",
    roleLabel: "Nagaland Heavy Convoy Pilot",
    department: "Dimapur-Kohima Heavy Freight",
    assignedVehicleId: "NER-TRUCK-NL07-5512",
    clearance: "Level 2 (Driver HUD & SOS Incident Report)",
    allowedTabs: ["dashboard", "driver_nav", "map"],
    badgeColor: "bg-cyan-950 text-cyan-300 border-cyan-800"
  }
];

export default function AuthModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onLogin 
}) {
  const [selectedUser, setSelectedUser] = useState(currentUser || DEMO_USERS[0]);
  const [jwtToken, setJwtToken] = useState(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbkBkb25lci5nb3YuaW4iLCJyb2xlcyI6WyJST0xFX0FETUlOIl0sImlhdCI6MTczMDU5ODAwMCwiZXhwIjoxNzMwNjg0NDAwfQ.siH26002_ner_secure_signature"
  );
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    const mockJwt = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIke3VzZXIudXNlcm5hbWV9Iiwicm9sZXMiOlsiJHt1c2VyLnJvbGV9Il0sImlhdCI6MTczMDU5ODAwMCwiZXhwIjoxNzMwNjg0NDAwfQ.siH26002_${user.role.toLowerCase()}_signature`;
    setJwtToken(mockJwt);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (onLogin) {
      onLogin(selectedUser, jwtToken);
    }
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-fadeIn">
      <div className="saas-card bg-[#090d18] border border-white/[0.1] rounded-3xl max-w-xl w-full p-6 shadow-2xl relative text-white space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-white/[0.06] pb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-purple-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-zinc-400">Spring Security 6 + JWT Authentication & API Route Permissions</p>
          </div>
        </div>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <div className="font-extrabold text-lg text-emerald-400">Authentication Verified!</div>
            <p className="text-xs text-zinc-400">Logged in as <strong>{selectedUser.name}</strong> ({selectedUser.role}). UI permissions updated.</p>
          </div>
        ) : (
          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            {/* 1. Quick Role Switcher Presets */}
            <div>
              <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                Select User Role (1-Click Demo Login)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {DEMO_USERS.map(u => (
                  <div
                    key={u.role}
                    onClick={() => handleSelectUser(u)}
                    className={`p-3 rounded-2xl border cursor-pointer transition space-y-1 ${
                      selectedUser.role === u.role
                        ? 'bg-zinc-900 border-purple-500/80 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/40'
                        : 'bg-zinc-950/80 border-white/[0.06] hover:border-white/[0.12]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs font-semibold">{u.name}</strong>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border font-bold ${u.badgeColor}`}>
                        {u.role.replace('ROLE_', '')}
                      </span>
                    </div>
                    <div className="text-[11px] text-zinc-400">{u.roleLabel}</div>
                    <div className="text-[10px] text-zinc-500 truncate">{u.department}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Active User RBAC Clearance Details */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Granted Role:</span>
                <span className={`font-mono text-xs px-2.5 py-1 rounded-full border font-bold ${selectedUser.badgeColor}`}>
                  {selectedUser.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 font-medium">Security Clearance:</span>
                <span className="text-emerald-400 font-bold font-mono text-[11px]">{selectedUser.clearance}</span>
              </div>
              <div className="pt-2 border-t border-white/[0.04]">
                <span className="text-[11px] text-zinc-400 font-medium block mb-1">Permitted UI Tabs:</span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {selectedUser.allowedTabs.map(tab => (
                    <span key={tab} className="bg-zinc-900 border border-white/[0.08] text-cyan-300 px-2.5 py-1 rounded-lg">
                      ✓ {tab.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. JWT Token Inspector */}
            <div className="space-y-1">
              <span className="text-[11px] font-semibold text-zinc-400 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-purple-400" />
                <span>Spring Security Signed JWT Bearer Token:</span>
              </span>
              <div className="bg-zinc-950 p-2.5 rounded-xl border border-white/[0.06] font-mono text-[10px] text-zinc-400 break-all select-all">
                {jwtToken}
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 hover:from-purple-500 hover:to-blue-500 text-white font-bold py-3 rounded-2xl text-xs shadow-xl shadow-purple-600/25 flex items-center justify-center space-x-2 transition active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>Authenticate as {selectedUser.name.split(' ')[0]} ({selectedUser.role.replace('ROLE_', '')})</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
