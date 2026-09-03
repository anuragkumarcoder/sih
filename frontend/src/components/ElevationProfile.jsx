import React, { useState } from 'react';
import { Mountain, TrendingUp, AlertTriangle, Compass, Activity } from 'lucide-react';
import { formatDistance, formatElevation, formatGrade, formatPercent } from '../utils/formatters';

export default function ElevationProfile({ profileData, routeName, stats }) {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!profileData || profileData.length === 0) {
    return (
      <div className="saas-card rounded-3xl p-8 text-center text-zinc-400">
        <Mountain className="w-8 h-8 mx-auto text-zinc-600 mb-2" />
        <p className="text-xs">Select origin and destination to compute 2D mountain elevation profile.</p>
      </div>
    );
  }

  const width = 750;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 35, left: 55 };

  const minElev = 0;
  const maxElev = Math.max(...profileData.map(p => p.elevation_m), 4200);
  const maxDist = profileData[profileData.length - 1].distance_km || 100;

  const getX = (dist) => padding.left + (dist / maxDist) * (width - padding.left - padding.right);
  const getY = (elev) => height - padding.bottom - ((elev - minElev) / (maxElev - minElev)) * (height - padding.top - padding.bottom);

  const pointsString = profileData.map(p => `${getX(p.distance_km)},${getY(p.elevation_m)}`).join(' ');
  const areaPath = `M ${getX(0)},${height - padding.bottom} L ${pointsString} L ${getX(maxDist)},${height - padding.bottom} Z`;
  const linePath = `M ${pointsString}`;

  return (
    <div className="saas-card rounded-3xl p-5 shadow-2xl space-y-4">
      {/* Header & Stats Cards */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-sm">
            <Mountain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-xs text-white uppercase tracking-wider">
              Mountain Elevation Cross-Section
            </h3>
            <p className="text-[11px] text-zinc-400">{routeName || 'North Eastern Mountain Corridor'}</p>
          </div>
        </div>

        {stats && (
          <div className="flex items-center space-x-2 text-xs font-mono">
            <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/[0.06] shadow-inner">
              <span className="text-zinc-500 text-[10px] font-sans">Peak: </span>
              <span className="font-bold text-amber-400">{formatElevation(stats.max_elevation || stats.max_elevation_m)}</span>
            </div>
            <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/[0.06] shadow-inner">
              <span className="text-zinc-500 text-[10px] font-sans">Gain: </span>
              <span className="font-bold text-emerald-400">+{formatElevation(stats.elevation_gain || stats.elevation_gain_m)}</span>
            </div>
            <div className="bg-zinc-950 px-3 py-1.5 rounded-xl border border-white/[0.06] shadow-inner">
              <span className="text-zinc-500 text-[10px] font-sans">Max Slope: </span>
              <span className="font-bold text-rose-400">{formatGrade(stats.max_gradient || stats.max_gradient_percent)}</span>
            </div>
          </div>
        )}
      </div>

      {/* Futuristic SVG Altitude Graph */}
      <div className="relative w-full overflow-x-auto bg-zinc-950/90 rounded-2xl p-2 border border-white/[0.06] shadow-inner">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[500px]">
          <defs>
            <linearGradient id="elevationGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#030712" stopOpacity="0.0" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[1000, 2000, 3000, 4000].map(elev => {
            const y = getY(elev);
            return (
              <g key={elev}>
                <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" strokeWidth="0.8" />
                <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="#71717a" fontSize="10" fontFamily="JetBrains Mono, monospace">
                  {elev}m
                </text>
              </g>
            );
          })}

          <line x1={padding.left} y1={getY(0)} x2={width - padding.right} y2={getY(0)} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <text x={padding.left - 8} y={getY(0) + 4} textAnchor="end" fill="#71717a" fontSize="10" fontFamily="JetBrains Mono, monospace">0m</text>

          {/* Distance Ticks */}
          {[0, Math.round(maxDist / 3), Math.round((2 * maxDist) / 3), Math.round(maxDist)].map((d, idx) => (
            <text key={idx} x={getX(d)} y={height - 10} textAnchor="middle" fill="#71717a" fontSize="10" fontFamily="JetBrains Mono, monospace">
              {d} km
            </text>
          ))}

          {/* Elevation Area & Glowing Line */}
          <path d={areaPath} fill="url(#elevationGrad)" />
          <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)" />

          {/* Interactive Data Nodes */}
          {profileData.map((p, idx) => {
            const cx = getX(p.distance_km);
            const cy = getY(p.elevation_m);
            const isHigh = p.elevation_m > 3000;
            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={isHigh ? 4 : 2.5}
                fill={isHigh ? "#f59e0b" : "#10b981"}
                stroke="#ffffff"
                strokeWidth={isHigh ? 1.5 : 1}
                className="cursor-pointer transition-transform hover:scale-150"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredPoint && (
          <div className="absolute top-4 right-4 bg-zinc-900/95 border border-cyan-500/50 p-2.5 rounded-xl text-xs font-mono shadow-2xl backdrop-blur-md pointer-events-none animate-fadeIn space-y-0.5">
            <div className="text-zinc-400 text-[10px]">Checkpoint at {hoveredPoint.distance_km} km</div>
            <div className="text-emerald-400 font-bold">Elevation: {formatElevation(hoveredPoint.elevation_m)}</div>
            <div className="text-zinc-300 text-[10px]">Slope: {formatGrade(hoveredPoint.gradient_percent)}</div>
          </div>
        )}
      </div>
    </div>
  );
}
