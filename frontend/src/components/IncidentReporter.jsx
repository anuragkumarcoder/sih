import React, { useState } from 'react';
import { AlertTriangle, X, MapPin, Send, CheckCircle2, CloudRain, Clock, Mountain, ShieldAlert, User, ShieldCheck } from 'lucide-react';
import { reportIncidentApi } from '../services/api';
import { NER_TOPOLOGY_LOCATIONS } from '../data/mockMasterData';

export default function IncidentReporter({ 
  isOpen, 
  onClose, 
  onIncidentAdded,
  currentUser 
}) {
  const [hazardType, setHazardType] = useState('LANDSLIDE');
  const [severity, setSeverity] = useState('HIGH');
  const [selectedNearNode, setSelectedNearNode] = useState('Sela_Pass');
  const [lat, setLat] = useState(27.5034);
  const [lng, setLng] = useState(92.1037);
  const [roadName, setRoadName] = useState('NH-13 (Trans-Arunachal Highway)');
  const [landmark, setLandmark] = useState('Near Sela Pass Tunnel approach, km 68');
  const [description, setDescription] = useState('Rockfall debris observed blocking road stretch. Passing restricted.');
  const [clearanceHours, setClearanceHours] = useState(8);
  const [passableBy4x4, setPassableBy4x4] = useState(false);
  const [rainfallMm, setRainfallMm] = useState(95);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const isOfficial = currentUser?.role === 'ROLE_BRO_INSPECTOR' || currentUser?.role === 'ROLE_ADMIN';

  const handleNodeChange = (nodeName) => {
    setSelectedNearNode(nodeName);
    const n = NER_TOPOLOGY_LOCATIONS.find(loc => loc.name === nodeName);
    if (n) {
      setLat(n.lat);
      setLng(n.lng);
      setLandmark(`Near ${n.name} transit junction`);
      if (nodeName.includes('Sela')) setRoadName('NH-13 (Trans-Arunachal Highway)');
      else if (nodeName.includes('Kohima') || nodeName.includes('Dimapur')) setRoadName('NH-29 (Dimapur-Kohima Road)');
      else if (nodeName.includes('Shillong') || nodeName.includes('Sohra')) setRoadName('SH-5 (Shillong-Cherrapunji Highway)');
      else setRoadName(`NH corridor near ${n.name}`);
    }
  };

  const presetDescriptions = [
    "Rockfall debris observed on mountain slope. Passing restricted.",
    "Active mudslide following continuous rainfall. Traffic moving in single file.",
    "Road subsidence and edge depression. Unsafe for heavy 16T multi-axle trucks.",
    "Waterlogging near bridge culvert. High clearance 4x4 vehicles can pass.",
    "Fallen tree and boulder obstructing downhill lane."
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const payload = {
      hazardType,
      severity,
      latitude: Number(lat),
      longitude: Number(lng),
      roadName,
      landmark,
      description,
      estimatedClearanceHours: Number(clearanceHours),
      passableBy4x4,
      rainfallAtIncidentMm: Number(rainfallMm),
      photoUrls: []
    };

    try {
      await reportIncidentApi(payload);
      
      const newInc = {
        id: `INC-LIVE-${Date.now().toString().slice(-4)}`,
        hazardType,
        severity,
        lat: Number(lat),
        lng: Number(lng),
        roadName,
        landmark,
        description,
        clearanceHours: Number(clearanceHours),
        clearancePercent: isOfficial ? 20 : 0,
        passableBy4x4,
        verified: isOfficial, // Official BRO Inspectors & Admins verify immediately; Drivers submit for verification
        verifiedBy: isOfficial ? (currentUser?.name || "BRO Task Force 88") : `Field Report by ${currentUser?.name || "Driver"} (Pending BRO Verification)`,
        reportedBy: currentUser?.name || "Field Driver",
        reporterRole: currentUser?.role || "ROLE_FIELD_DRIVER",
        machineryDeployed: isOfficial ? "BRO Heavy Equipment Dispatched" : "Awaiting Official Site Inspection",
        rainfallMm: Number(rainfallMm),
        reportedTime: "Just now",
        status: isOfficial ? "OFFICIAL_VERIFIED" : "PENDING_VERIFICATION",
        clearanceUpdates: isOfficial ? [
          {
            time: "Just now",
            author: currentUser?.name || "BRO Inspector",
            message: `Certified Roadblock issued on ${roadName}. Initial clearance target: ${clearanceHours}h.`,
            progressPercent: 20
          }
        ] : []
      };

      if (onIncidentAdded) {
        onIncidentAdded(newInc);
      }

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1300);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans select-none animate-fadeIn">
      <div className="saas-card bg-[#090d18] border border-white/[0.12] rounded-3xl max-w-lg w-full p-6 shadow-2xl relative text-white space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-zinc-400 hover:text-white p-1.5 rounded-xl hover:bg-zinc-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 border-b border-white/[0.06] pb-4">
          <div className={`p-3 rounded-2xl ${isOfficial ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400' : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'}`}>
            {isOfficial ? <ShieldCheck className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="font-bold text-base text-white">
              {isOfficial ? "Official Roadblock Certification" : "Report Field Hazard"}
            </h3>
            <p className="text-xs text-zinc-400">
              {isOfficial 
                ? "BRO Authority: Issue certified roadblock advisory & deploy machinery" 
                : "Driver SOS: Submits unverified report to BRO for field verification"}
            </p>
          </div>
        </div>

        {/* Verification Status Notice */}
        {!isOfficial && (
          <div className="bg-amber-950/40 border border-amber-500/30 p-3 rounded-2xl text-xs text-amber-300 space-y-1">
            <div className="flex items-center space-x-1.5 font-bold">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Multi-Tier Verification Active:</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Your submission will be tagged as <strong className="text-amber-400 font-mono">PENDING BRO VERIFICATION</strong>. Commercial routes will not be altered until certified by a Border Roads Organisation Inspector.
            </p>
          </div>
        )}

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <div className="font-bold text-base text-emerald-400">
              {isOfficial ? "Official Roadblock Certified & Broadcasted!" : "Hazard Report Submitted for Verification!"}
            </div>
            <p className="text-xs text-zinc-400">
              {isOfficial ? "Excavator dispatch authorized." : "BRO Sector Patrol notified for on-site validation."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Hazard Classification</label>
                <select
                  value={hazardType}
                  onChange={(e) => setHazardType(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500"
                >
                  <option value="LANDSLIDE">Mountain Landslide</option>
                  <option value="FLASH_FLOOD">River Flash Flood</option>
                  <option value="ROAD_SUBSIDENCE">Road Subsidence / Sinking</option>
                  <option value="BRIDGE_COLLAPSE">Bridge Structural Hazard</option>
                  <option value="HEAVY_FOG">Dense Alpine Fog</option>
                  <option value="SNOW_ICE">Snow / Black Ice</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-rose-500"
                >
                  <option value="CRITICAL">CRITICAL (Total Blockage)</option>
                  <option value="HIGH">HIGH (Single Lane / High Risk)</option>
                  <option value="MEDIUM">MEDIUM (Caution Required)</option>
                  <option value="LOW">LOW (Advisory)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 block">Nearby Mountain Node / Corridor</label>
              <select
                value={selectedNearNode}
                onChange={(e) => handleNodeChange(e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500"
              >
                {NER_TOPOLOGY_LOCATIONS.map(n => (
                  <option key={n.name} value={n.name}>{n.name} ({n.state})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-zinc-400 block">Highway / Corridor Identifier</label>
              <input
                type="text"
                value={roadName}
                onChange={(e) => setRoadName(e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-cyan-500"
                placeholder="e.g. NH-13 Trans-Arunachal Highway"
              />
            </div>

            {/* Quick Description Presets */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-400 block">Observed Hazard Details</label>
              <select
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-1.5 text-zinc-300 text-[11px] focus:outline-none mb-1"
              >
                <option value="">-- Choose Observation Preset --</option>
                {presetDescriptions.map((desc, i) => (
                  <option key={i} value={desc}>{desc}</option>
                ))}
              </select>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white font-normal text-xs focus:outline-none focus:border-cyan-500 resize-none"
                placeholder="Describe exact conditions observed on the ground..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">Clearance Time (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="72"
                  value={clearanceHours}
                  onChange={(e) => setClearanceHours(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 block mb-1">24h Rainfall (mm)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={rainfallMm}
                  onChange={(e) => setRainfallMm(e.target.value)}
                  className="w-full bg-zinc-950 border border-white/[0.08] rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="passable4x4"
                checked={passableBy4x4}
                onChange={(e) => setPassableBy4x4(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-cyan-500 focus:ring-0"
              />
              <label htmlFor="passable4x4" className="text-xs text-zinc-300 cursor-pointer">
                Passable by 4x4 Emergency Vehicles with high ground clearance
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className={`w-full font-bold py-3 rounded-2xl text-xs shadow-xl flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50 ${
                isOfficial 
                  ? 'bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-500 hover:to-orange-500 text-white shadow-amber-600/30' 
                  : 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/30'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>
                {submitting ? "Transmitting..." : isOfficial ? "Broadcast Verified Roadblock" : "Submit Hazard for BRO Verification"}
              </span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
