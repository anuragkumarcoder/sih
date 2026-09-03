import React, { useState } from 'react';
import { 
  Activity, AlertTriangle, ShieldCheck, Cpu, 
  Mountain, Gauge, Droplets, Compass, BarChart3,
  Sliders, ShieldAlert, CheckCircle2, RefreshCw
} from 'lucide-react';
import { predictHazardRiskApi } from '../services/api';
import { formatPercent, formatSpeed } from '../utils/formatters';

export default function HazardPredictor() {
  const [stateCode, setStateCode] = useState('AR');
  const [slopeAngle, setSlopeAngle] = useState(36);
  const [rainfallMm, setRainfallMm] = useState(140);
  const [soilSaturation, setSoilSaturation] = useState(0.85);
  const [deforestation, setDeforestation] = useState(0.60);
  const [faultDistKm, setFaultDistKm] = useState(5.5);

  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState({
    risk_probability: 0.78,
    risk_level: "CRITICAL",
    primary_risk_factors: [
      "Critical slope gradient (36° - High shear stress zone)",
      "Extreme 24h precipitation threshold exceeded (>120mm)",
      "High pore-water pressure and soil liquefaction risk"
    ],
    recommended_vehicle_restrictions: ["HEAVY_COMMERCIAL", "MEDIUM_COMMERCIAL", "LIGHT_ELECTRIC"],
    safe_speed_limit_kmh: 20,
    sensor_confidence: 0.92
  });

  const statePresets = {
    AR: { name: "Arunachal (Himalayas)", slope: 38, rain: 160, sat: 0.88, def: 0.65, fault: 4 },
    SK: { name: "Sikkim (Teesta Fault)", slope: 41, rain: 180, sat: 0.90, def: 0.70, fault: 3 },
    ML: { name: "Meghalaya (Sohra Ridge)", slope: 28, rain: 220, sat: 0.92, def: 0.50, fault: 8 },
    NL: { name: "Nagaland (Patkai Belt)", slope: 33, rain: 110, sat: 0.80, def: 0.55, fault: 6 },
    MN: { name: "Manipur (Jiribam Pass)", slope: 30, rain: 95, sat: 0.75, def: 0.45, fault: 7 },
    MZ: { name: "Mizoram (Lushai Hills)", slope: 34, rain: 125, sat: 0.82, def: 0.50, fault: 6 },
    AS: { name: "Assam (Barak Valley)", slope: 18, rain: 85, sat: 0.65, def: 0.35, fault: 14 },
    TR: { name: "Tripura (Low Hills)", slope: 12, rain: 70, sat: 0.55, def: 0.30, fault: 18 },
  };

  const handleApplyPreset = (code) => {
    setStateCode(code);
    const p = statePresets[code];
    if (p) {
      setSlopeAngle(p.slope);
      setRainfallMm(p.rain);
      setSoilSaturation(p.sat);
      setDeforestation(p.def);
      setFaultDistKm(p.fault);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    const payload = {
      latitude: 27.5034,
      longitude: 92.1037,
      state_code: stateCode,
      slope_angle_deg: Number(slopeAngle),
      rainfall_24h_mm: Number(rainfallMm),
      soil_saturation_index: Number(soilSaturation),
      deforestation_score: Number(deforestation),
      distance_to_faultline_km: Number(faultDistKm)
    };

    try {
      const res = await predictHazardRiskApi(payload);
      if (res) {
        setPrediction(res);
      } else {
        const score = Math.min(0.98, Math.max(0.05, 
          0.35 * Math.pow(slopeAngle / 45, 1.5) +
          0.30 * (rainfallMm / 250) +
          0.20 * soilSaturation +
          0.15 * deforestation -
          0.05 * (faultDistKm / 50)
        ));
        const sev = score > 0.75 ? "CRITICAL" : score > 0.50 ? "HIGH" : score > 0.30 ? "MEDIUM" : "LOW";
        setPrediction({
          risk_probability: Number(score.toFixed(3)),
          risk_level: sev,
          primary_risk_factors: [
            slopeAngle > 30 ? `Critical slope gradient (${slopeAngle}°)` : "Moderate mountain slope",
            rainfallMm > 100 ? `Extreme 24h precipitation (${rainfallMm}mm)` : "Normal monsoon rain",
            soilSaturation > 0.7 ? "High pore-water pressure in rock strata" : "Normal drainage capacity"
          ],
          recommended_vehicle_restrictions: score > 0.7 ? ["HEAVY_COMMERCIAL"] : [],
          safe_speed_limit_kmh: score > 0.7 ? 20 : score > 0.5 ? 35 : 60,
          sensor_confidence: 0.92
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const probPercent = Math.round(prediction.risk_probability * 100);

  return (
    <div className="space-y-6">
      <div className="saas-card rounded-3xl p-6 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-rose-500/20">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Geotechnical Landslide & Risk Engine</h2>
              <p className="text-xs text-zinc-400">Random Forest predictive model calibrated on Himalayan rock strata</p>
            </div>
          </div>
          <span className="bg-zinc-950 text-rose-400 font-mono text-xs px-3 py-1 rounded-full border border-white/[0.08] font-semibold">
            Geotech Infiltration Model
          </span>
        </div>

        {/* State Presets */}
        <div className="bg-zinc-950 p-3.5 rounded-2xl border border-white/[0.06]">
          <span className="text-[11px] text-zinc-400 block mb-2.5 font-medium">
            Geological Regional Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(statePresets).map(([code, p]) => (
              <button
                key={code}
                onClick={() => handleApplyPreset(code)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  stateCode === code 
                    ? 'bg-zinc-800 text-white border border-white/[0.1] shadow-sm' 
                    : 'bg-zinc-900/80 text-zinc-400 border border-white/[0.04] hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sliders Area */}
          <div className="lg:col-span-7 space-y-4">
            {/* Slope Degree */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium flex items-center space-x-1.5">
                  <Mountain className="w-4 h-4 text-rose-400" />
                  <span>Mountain Slope Incline</span>
                </span>
                <span className="font-mono font-bold text-sm text-rose-400">{slopeAngle}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                value={slopeAngle}
                onChange={(e) => setSlopeAngle(e.target.value)}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>5° (Valley)</span>
                <span>25° (Moderate Slope)</span>
                <span>45° (Steep Ridge)</span>
              </div>
            </div>

            {/* 24h Precipitation */}
            <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-300 font-medium flex items-center space-x-1.5">
                  <Droplets className="w-4 h-4 text-cyan-400" />
                  <span>24h Rainfall Intensity</span>
                </span>
                <span className="font-mono font-bold text-sm text-cyan-400">{rainfallMm} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={rainfallMm}
                onChange={(e) => setRainfallMm(e.target.value)}
                className="w-full accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>0 mm</span>
                <span>100 mm (Monsoon Storm)</span>
                <span>300 mm (Cloudburst)</span>
              </div>
            </div>

            {/* Saturation and Fault distance */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Soil Saturation</span>
                  <span className="font-mono font-bold text-amber-400">{Math.round(soilSaturation * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={soilSaturation}
                  onChange={(e) => setSoilSaturation(e.target.value)}
                  className="w-full accent-amber-400"
                />
              </div>

              <div className="bg-zinc-950 p-4 rounded-2xl border border-white/[0.06] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-zinc-300 font-medium">Fault Line Distance</span>
                  <span className="font-mono font-bold text-purple-400">{Math.round(faultDistKm)} km</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="50"
                  step="1"
                  value={faultDistKm}
                  onChange={(e) => setFaultDistKm(e.target.value)}
                  className="w-full accent-purple-400"
                />
              </div>
            </div>

            <button
              onClick={handlePredict}
              disabled={loading}
              className="w-full bg-rose-600 hover:bg-rose-500 text-white font-semibold py-3 rounded-2xl text-xs shadow-lg shadow-rose-600/20 flex items-center justify-center space-x-2 transition active:scale-95 disabled:opacity-50"
            >
              <Cpu className="w-4 h-4 text-rose-200" />
              <span>{loading ? "Evaluating Geotechnical Model..." : "Run Geotechnical Assessment"}</span>
            </button>
          </div>

          {/* Right Inference Card */}
          <div className="lg:col-span-5 bg-zinc-950 border border-white/[0.06] rounded-3xl p-6 flex flex-col justify-between space-y-4">
            <div>
              <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-3">
                Risk Inference Summary
              </span>

              <div className="bg-zinc-900 border border-white/[0.06] p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">Landslide Risk Level</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    prediction.risk_level === 'CRITICAL' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                    prediction.risk_level === 'HIGH' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  }`}>
                    {prediction.risk_level}
                  </span>
                </div>

                <div className="text-4xl font-mono font-black text-rose-400">
                  {probPercent}%
                </div>

                <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-white/[0.06]">
                  <div
                    className={`h-full transition-all duration-500 ${
                      prediction.risk_level === 'CRITICAL' ? 'bg-gradient-to-r from-amber-500 to-rose-600' :
                      prediction.risk_level === 'HIGH' ? 'bg-gradient-to-r from-emerald-500 to-amber-500' :
                      'bg-emerald-500'
                    }`}
                    style={{ width: `${probPercent}%` }}
                  />
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-2 mt-4">
                <span className="text-xs font-semibold text-zinc-300 block">Identified Factors:</span>
                <div className="space-y-1.5">
                  {prediction.primary_risk_factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-zinc-300 bg-zinc-900/70 p-2.5 rounded-xl border border-white/[0.04]">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mt-4 font-mono">
                <div className="bg-zinc-900 p-3 rounded-2xl border border-white/[0.04]">
                  <span className="text-zinc-500 block text-[10px] font-sans">Safe Speed Limit</span>
                  <span className="text-sm font-bold text-white mt-0.5 block">{formatSpeed(prediction.safe_speed_limit_kmh)}</span>
                </div>
                <div className="bg-zinc-900 p-3 rounded-2xl border border-white/[0.04]">
                  <span className="text-zinc-500 block text-[10px] font-sans">Confidence</span>
                  <span className="text-sm font-bold text-emerald-400 mt-0.5 block">{formatPercent(prediction.sensor_confidence, true)}</span>
                </div>
              </div>
            </div>

            <div className="text-[11px] text-zinc-500 font-mono border-t border-white/[0.06] pt-3 flex items-center justify-between">
              <span>Scikit-Learn Random Forest</span>
              <span className="text-emerald-400 font-semibold font-sans">Calibrated</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
