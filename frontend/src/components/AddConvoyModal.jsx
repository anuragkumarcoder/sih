import React, { useState } from 'react';
import { 
  Truck, Car, Plane, Navigation, Plus, X, 
  Sparkles, CheckCircle2, Box, Gauge, Mountain, MapPin, Fuel
} from 'lucide-react';
import { NER_TOPOLOGY_LOCATIONS } from '../data/mockMasterData';

export default function AddConvoyModal({
  isOpen,
  onClose,
  onAddVehicle,
  currentUser
}) {
  if (!isOpen) return null;

  const [vehicleType, setVehicleType] = useState('HEAVY_COMMERCIAL');
  const [vehicleId, setVehicleId] = useState(`NER-TRUCK-AS${Math.floor(10 + Math.random() * 89)}-${Math.floor(1000 + Math.random() * 9000)}`);
  const [driverName, setDriverName] = useState('Karma Dorjee');
  const [origin, setOrigin] = useState('Guwahati');
  const [destination, setDestination] = useState('Shillong');
  const [cargo, setCargo] = useState('Life-Saving Medical Consignment & Rations (3,200 kg)');

  const handleTypeChange = (type) => {
    setVehicleType(type);
    const prefix = type === 'CARGO_DRONE' ? 'NER-DRONE-AIR' : type === 'OFFROAD_4X4' ? 'NER-4X4-AR03' : 'NER-TRUCK-AS01';
    const randNum = type === 'CARGO_DRONE' ? `0${Math.floor(8 + Math.random() * 5)}` : `${Math.floor(1000 + Math.random() * 9000)}`;
    setVehicleId(`${prefix}-${randNum}`);

    if (type === 'CARGO_DRONE') {
      setDriverName(`Autonomous Pilot (AI-0${Math.floor(8 + Math.random() * 5)})`);
      setCargo('Emergency Anti-Venom & Blood Plasma (45 kg)');
    } else if (type === 'OFFROAD_4X4') {
      setDriverName('Tsering Norbu');
      setCargo('Alpine Disaster Telecom Equipment (850 kg)');
    } else {
      setDriverName('Karma Dorjee');
      setCargo('Medical Vaccines & Ration Supplies (4,200 kg)');
    }
  };

  const handleQuickPreset = (preset) => {
    handleTypeChange(preset.type);
    setOrigin(preset.origin);
    setDestination(preset.dest);
    setCargo(preset.cargo);
    setDriverName(preset.driver);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const originObj = NER_TOPOLOGY_LOCATIONS.find(n => n.name === origin) || { lat: 26.1445, lng: 91.7362, elevation: 55 };

    const newVehicle = {
      vehicleId: vehicleId.trim() || `NER-VEH-${Date.now().toString().slice(-4)}`,
      driverName: driverName.trim() || 'Assigned Pilot',
      type: vehicleType,
      lat: Number((originObj.lat + (Math.random() * 0.04 - 0.02)).toFixed(4)),
      lng: Number((originObj.lng + (Math.random() * 0.04 - 0.02)).toFixed(4)),
      altitude: originObj.elevation || 150,
      speedKmh: vehicleType === 'CARGO_DRONE' ? 88 : vehicleType === 'OFFROAD_4X4' ? 38 : 52,
      heading: Math.floor(Math.random() * 360),
      engineTemp: vehicleType === 'CARGO_DRONE' ? 42 : 84,
      fuel: 100,
      battery: vehicleType === 'CARGO_DRONE' ? 98 : 95,
      cargo: cargo.trim() || 'General Freight',
      status: vehicleType === 'CARGO_DRONE' ? 'AIRBORNE_RELIEF' : 'EN_ROUTE',
      origin,
      destination,
      nextStop: `${destination} Gateway Transit Depot`,
      etaMinutes: vehicleType === 'CARGO_DRONE' ? 18 : 65
    };

    // Close the modal instantly so backdrop never freezes the UI
    onClose();

    if (onAddVehicle) {
      onAddVehicle(newVehicle);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-fadeIn">
      <div 
        className="liquid-glass bg-[#090d18] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-zinc-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 border-b border-white/[0.08] pb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 ring-1 ring-white/20">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-extrabold text-base text-white font-mono">
                Dispatch New Fleet Convoy
              </h3>
              <span className="bg-cyan-950 text-cyan-300 border border-cyan-700 text-[9px] font-mono px-2 py-0.5 rounded-full font-bold">
                LIVE GPS ENGINE
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Deploy a new vehicle, 4x4, or cargo drone onto the North East road network
            </p>
          </div>
        </div>

        {/* 1-Click Corridor Presets */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
            ⚡ 1-Click Convoy Presets:
          </span>
          <div className="grid grid-cols-3 gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleQuickPreset({
                type: 'HEAVY_COMMERCIAL',
                origin: 'Guwahati',
                dest: 'Shillong',
                cargo: 'Pharma Vaccines & Ration (4,500 kg)',
                driver: 'Lalthangliana Sailo'
              })}
              className="bg-zinc-950/80 hover:bg-zinc-900 border border-white/[0.08] p-2 rounded-xl text-left transition"
            >
              <span className="text-[10px] font-bold text-cyan-400 block font-mono">🚛 NH-6 Freight</span>
              <span className="text-[10px] text-zinc-300 truncate block">Guwahati ➔ Shillong</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset({
                type: 'OFFROAD_4X4',
                origin: 'Gangtok',
                dest: 'Mangan',
                cargo: 'High Altitude Medical Kit (1,100 kg)',
                driver: 'Karma Dorjee'
              })}
              className="bg-zinc-950/80 hover:bg-zinc-900 border border-white/[0.08] p-2 rounded-xl text-left transition"
            >
              <span className="text-[10px] font-bold text-amber-400 block font-mono">🚙 Sikkim 4x4</span>
              <span className="text-[10px] text-zinc-300 truncate block">Gangtok ➔ Mangan</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickPreset({
                type: 'CARGO_DRONE',
                origin: 'Imphal',
                dest: 'Moreh',
                cargo: 'Anti-Venom Vials (40 kg)',
                driver: 'Autonomous Pilot (AI-09)'
              })}
              className="bg-zinc-950/80 hover:bg-zinc-900 border border-white/[0.08] p-2 rounded-xl text-left transition"
            >
              <span className="text-[10px] font-bold text-purple-400 block font-mono">🛸 Aerial Drone</span>
              <span className="text-[10px] text-zinc-300 truncate block">Imphal ➔ Moreh</span>
            </button>
          </div>
        </div>

        {/* Dispatch Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Vehicle Type Switcher */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-white uppercase tracking-wider block">
              Vehicle Mode:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('HEAVY_COMMERCIAL')}
                className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1 transition ${
                  vehicleType === 'HEAVY_COMMERCIAL'
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-zinc-950/60 hover:bg-zinc-900 border-white/[0.06] text-zinc-400'
                }`}
              >
                <Truck className="w-4 h-4 text-cyan-400" />
                <span className="text-xs">Heavy Truck</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('OFFROAD_4X4')}
                className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1 transition ${
                  vehicleType === 'OFFROAD_4X4'
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold shadow-md shadow-amber-500/20'
                    : 'bg-zinc-950/60 hover:bg-zinc-900 border-white/[0.06] text-zinc-400'
                }`}
              >
                <Car className="w-4 h-4 text-amber-400" />
                <span className="text-xs">4x4 Offroad</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('CARGO_DRONE')}
                className={`p-2.5 rounded-xl border flex flex-col items-center space-y-1 transition ${
                  vehicleType === 'CARGO_DRONE'
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold shadow-md shadow-purple-500/20'
                    : 'bg-zinc-950/60 hover:bg-zinc-900 border-white/[0.06] text-zinc-400'
                }`}
              >
                <Plane className="w-4 h-4 text-purple-400" />
                <span className="text-xs">Cargo Drone</span>
              </button>
            </div>
          </div>

          {/* Vehicle ID & Driver Name */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 block font-semibold">Registration Tag:</label>
              <input
                type="text"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block font-semibold">Assigned Pilot / Driver:</label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {/* Origin & Destination Hubs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-zinc-400 block font-semibold">Origin Staging Base:</label>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {NER_TOPOLOGY_LOCATIONS.map(n => (
                  <option key={n.name} value={n.name} className="bg-zinc-900 text-white">
                    {n.name} ({n.state})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-zinc-400 block font-semibold">Destination Hub:</label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full bg-zinc-950 border border-white/10 rounded-xl px-2.5 py-2 text-white text-xs focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {NER_TOPOLOGY_LOCATIONS.map(n => (
                  <option key={n.name} value={n.name} className="bg-zinc-900 text-white">
                    {n.name} ({n.state})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Cargo Payload Manifest */}
          <div className="space-y-1 text-xs">
            <label className="text-zinc-400 block font-semibold flex items-center space-x-1">
              <Box className="w-3.5 h-3.5 text-amber-400" />
              <span>Consignment Cargo Description & Weight:</span>
            </label>
            <input
              type="text"
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
              required
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-700 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-600/30 border border-cyan-400/30 flex items-center space-x-2 transition active:scale-95 cursor-pointer"
            >
              <Navigation className="w-4 h-4 text-white" />
              <span>🚀 Launch & Track Convoy</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
