import React, { useState } from 'react';
import { 
  Database, ShieldCheck, Zap, HardDrive, 
  Table, Layers, FileJson, CheckCircle2, Lock, Send, Search, Sparkles
} from 'lucide-react';
import { 
  NER_DISTRICTS_DATA, NER_WAREHOUSES_DATA, NER_LOGISTICS_NODES_DATA, 
  INITIAL_ACTIVE_INCIDENTS, INITIAL_FLEET_VEHICLES 
} from '../data/mockMasterData';
import { formatElevation, formatSpeed } from '../utils/formatters';

export default function DataArchitectureView() {
  const [selectedRelationalTab, setSelectedRelationalTab] = useState('warehouses');
  const [selectedMongoTab, setSelectedMongoTab] = useState('telemetry');
  const [searchTerm, setSearchTerm] = useState('');
  const [mongoTelemetryDocs, setMongoTelemetryDocs] = useState(INITIAL_FLEET_VEHICLES);
  const [simulatedPacketCount, setSimulatedPacketCount] = useState(24);

  const handleSimulateTelemetryPacket = () => {
    const randomVeh = INITIAL_FLEET_VEHICLES[Math.floor(Math.random() * INITIAL_FLEET_VEHICLES.length)];
    const newDoc = {
      ...randomVeh,
      vehicleId: randomVeh.vehicleId,
      lat: Number((randomVeh.lat + (Math.random() * 0.02 - 0.01)).toFixed(4)),
      lng: Number((randomVeh.lng + (Math.random() * 0.02 - 0.01)).toFixed(4)),
      speedKmh: Math.floor(Math.random() * 35 + 25),
      altitude: Math.floor(Math.random() * 2000 + 100),
      timestamp: new Date().toLocaleTimeString()
    };
    setMongoTelemetryDocs(prev => [newDoc, ...prev.slice(0, 6)]);
    setSimulatedPacketCount(prev => prev + 1);
  };

  const filteredWarehouses = NER_WAREHOUSES_DATA.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDistricts = NER_DISTRICTS_DATA.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNodes = NER_LOGISTICS_NODES_DATA.filter(n =>
    n.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Architecture Card */}
      <div className="saas-card rounded-3xl p-6 shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Hybrid Database Architecture</h2>
              <p className="text-xs text-zinc-400">Relational ACID storage paired with high-velocity geospatial logging</p>
            </div>
          </div>
          <span className="bg-zinc-950 text-cyan-400 font-mono text-xs px-3 py-1 rounded-full border border-white/[0.08] font-semibold">
            Dual Workload Model
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2">
            <div className="flex items-center space-x-2 text-sky-400 font-semibold text-xs uppercase tracking-wider">
              <Lock className="w-4 h-4" />
              <span>Relational Tier (MySQL 8.0) — Strict ACID</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Entities: <strong className="text-white">User, Role, DistrictNER, Warehouse, LogisticsNode</strong>.
              Manages administrative user accounts, district vulnerability profiles, and regional warehouse capacity.
            </p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-xs uppercase tracking-wider">
              <Zap className="w-4 h-4" />
              <span>NoSQL Tier (MongoDB 7.0) — High-Velocity Geospatial</span>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Entities: <strong className="text-white">VehicleTelemetry, RouteLog, AccessibilityIncident, LiveAlert</strong>.
              Uses <code className="text-emerald-300 bg-zinc-900 px-1.5 py-0.5 rounded font-mono">2dsphere</code> indexing for sub-millisecond radius searches.
            </p>
          </div>
        </div>
      </div>

      {/* Dual Database Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MySQL Explorer */}
        <div className="saas-card rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center space-x-2 text-sky-400 font-bold text-sm">
                <Table className="w-4 h-4" />
                <span>MySQL Master Data</span>
              </div>
              <div className="flex space-x-1 bg-zinc-950 p-1 rounded-xl border border-white/[0.06] text-xs">
                <button
                  onClick={() => setSelectedRelationalTab('warehouses')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${selectedRelationalTab === 'warehouses' ? 'bg-sky-600 text-white' : 'text-zinc-400'}`}
                >
                  Warehouses
                </button>
                <button
                  onClick={() => setSelectedRelationalTab('districts')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${selectedRelationalTab === 'districts' ? 'bg-sky-600 text-white' : 'text-zinc-400'}`}
                >
                  Districts
                </button>
                <button
                  onClick={() => setSelectedRelationalTab('nodes')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${selectedRelationalTab === 'nodes' ? 'bg-sky-600 text-white' : 'text-zinc-400'}`}
                >
                  Nodes
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search master data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto max-h-[380px] bg-zinc-950 rounded-2xl border border-white/[0.04] p-2">
              {selectedRelationalTab === 'warehouses' && (
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-mono text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Hub Name</th>
                      <th className="p-2.5">State</th>
                      <th className="p-2.5">Stock</th>
                      <th className="p-2.5">Cold Storage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
                    {filteredWarehouses.map(w => (
                      <tr key={w.code} className="hover:bg-zinc-900/50 transition">
                        <td className="p-2.5 text-sky-400 font-bold">{w.code}</td>
                        <td className="p-2.5 font-sans text-white font-medium">{w.name}</td>
                        <td className="p-2.5 text-zinc-400">{w.stateCode}</td>
                        <td className="p-2.5 text-emerald-400 font-semibold">{w.stockMT.toLocaleString()} / {w.capacityMT.toLocaleString()} MT</td>
                        <td className="p-2.5 text-cyan-400">{w.coldStorageMT.toLocaleString()} MT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedRelationalTab === 'districts' && (
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-mono text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="p-2.5">District</th>
                      <th className="p-2.5">State</th>
                      <th className="p-2.5">Elevation</th>
                      <th className="p-2.5">Terrain</th>
                      <th className="p-2.5">Risk</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
                    {filteredDistricts.map(d => (
                      <tr key={d.id} className="hover:bg-zinc-900/50 transition">
                        <td className="p-2.5 text-white font-sans font-medium">{d.name}</td>
                        <td className="p-2.5 text-zinc-400">{d.stateCode}</td>
                        <td className="p-2.5 text-amber-400">{formatElevation(d.elevation)}</td>
                        <td className="p-2.5 text-zinc-300 font-sans">{d.terrain}</td>
                        <td className="p-2.5 text-rose-400 font-bold">{d.vulnerability}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {selectedRelationalTab === 'nodes' && (
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-zinc-900/80 text-zinc-400 font-mono text-[10px] uppercase sticky top-0">
                    <tr>
                      <th className="p-2.5">Code</th>
                      <th className="p-2.5">Node Name</th>
                      <th className="p-2.5">Type</th>
                      <th className="p-2.5">Capacity</th>
                      <th className="p-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
                    {filteredNodes.map(n => (
                      <tr key={n.code} className="hover:bg-zinc-900/50 transition">
                        <td className="p-2.5 text-emerald-400 font-bold">{n.code}</td>
                        <td className="p-2.5 font-sans text-white font-medium">{n.name}</td>
                        <td className="p-2.5 text-zinc-400">{n.type}</td>
                        <td className="p-2.5 text-cyan-400">{n.capacityTons} T/day</td>
                        <td className="p-2.5 text-emerald-400 font-semibold">Active</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono border-t border-white/[0.06] pt-3 flex justify-between items-center">
            <span>MySQL 8.0 InnoDB</span>
            <span className="text-sky-400 font-semibold">ACID Compliant</span>
          </div>
        </div>

        {/* MongoDB Explorer */}
        <div className="saas-card rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] pb-3 mb-4">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
                <FileJson className="w-4 h-4" />
                <span>MongoDB Geospatial Logs</span>
              </div>
              <div className="flex space-x-1 bg-zinc-950 p-1 rounded-xl border border-white/[0.06] text-xs">
                <button
                  onClick={() => setSelectedMongoTab('telemetry')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${selectedMongoTab === 'telemetry' ? 'bg-emerald-600 text-white' : 'text-zinc-400'}`}
                >
                  Live Telemetry
                </button>
                <button
                  onClick={() => setSelectedMongoTab('incidents')}
                  className={`px-3 py-1 rounded-lg font-semibold transition ${selectedMongoTab === 'incidents' ? 'bg-emerald-600 text-white' : 'text-zinc-400'}`}
                >
                  Incidents ({INITIAL_ACTIVE_INCIDENTS.length})
                </button>
              </div>
            </div>

            {/* Ingestion Simulator */}
            <div className="flex items-center justify-between bg-zinc-950 p-3 rounded-2xl border border-white/[0.06] mb-3 text-xs">
              <div className="font-mono text-[11px] text-zinc-400">
                Packets Ingested: <strong className="text-emerald-400">{simulatedPacketCount}</strong>
              </div>
              <button
                onClick={handleSimulateTelemetryPacket}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1.5 transition active:scale-95 shadow-md shadow-emerald-600/20"
              >
                <Send className="w-3 h-3" />
                <span>Inject GPS Telemetry Packet</span>
              </button>
            </div>

            {/* Formatted Clean Documents */}
            <div className="overflow-y-auto max-h-[380px] bg-zinc-950 rounded-2xl border border-white/[0.04] p-3 font-mono text-[11px] text-zinc-300 space-y-2.5">
              {selectedMongoTab === 'telemetry' && mongoTelemetryDocs.map((veh, i) => (
                <div key={`${veh.vehicleId}_${i}`} className="bg-zinc-900/80 p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <div className="text-emerald-400 font-semibold flex items-center justify-between text-xs">
                    <span>{veh.vehicleId}</span>
                    <span className="text-[10px] text-zinc-500">{veh.timestamp || 'Live Stream'}</span>
                  </div>
                  <pre className="text-zinc-300 overflow-x-auto text-[10px] leading-relaxed">
{JSON.stringify({
  "_id": `66d4f9b8c0a1e0001${i}`,
  "vehicleId": veh.vehicleId,
  "driver": veh.driverName,
  "location": {
    "type": "Point",
    "coordinates": [Number(veh.lng.toFixed(2)), Number(veh.lat.toFixed(2))]
  },
  "speed": `${formatSpeed(veh.speedKmh)}`,
  "altitude": `${formatElevation(veh.altitude)}`,
  "fuel": `${Math.round(veh.fuel)}%`,
  "temp": `${Math.round(veh.engineTemp)}°C`
}, null, 2)}
                  </pre>
                </div>
              ))}

              {selectedMongoTab === 'incidents' && INITIAL_ACTIVE_INCIDENTS.map((inc, i) => (
                <div key={inc.id} className="bg-zinc-900/80 p-3 rounded-xl border border-white/[0.06] space-y-1">
                  <div className="text-rose-400 font-semibold flex items-center justify-between text-xs">
                    <span>{inc.id} ({inc.hazardType})</span>
                    <span className="text-[10px] text-zinc-500">{inc.reportedTime}</span>
                  </div>
                  <pre className="text-zinc-300 overflow-x-auto text-[10px] leading-relaxed">
{JSON.stringify({
  "_id": `66d4fa12b9d0e1102${i}`,
  "hazard": inc.hazardType,
  "severity": inc.severity,
  "road": inc.roadName,
  "location": {
    "type": "Point",
    "coordinates": [Number(inc.lng.toFixed(2)), Number(inc.lat.toFixed(2))]
  },
  "clearanceHours": inc.clearanceHours,
  "passable4x4": inc.passableBy4x4
}, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono border-t border-white/[0.06] pt-3 flex justify-between items-center">
            <span>2dsphere Geospatial Index</span>
            <span className="text-emerald-400 font-semibold">MongoDB WiredTiger</span>
          </div>
        </div>
      </div>
    </div>
  );
}
