/**
 * High-End SaaS Formatting Utilities
 * Eliminates ugly multi-decimal numbers, formatting numbers cleanly.
 */

export function formatDistance(km) {
  if (km === null || km === undefined) return '0 km';
  const val = Number(km);
  return `${Math.round(val).toLocaleString()} km`;
}

export function formatDuration(hours) {
  if (hours === null || hours === undefined) return '0h';
  const h = Number(hours);
  const wholeHours = Math.floor(h);
  const minutes = Math.round((h - wholeHours) * 60);
  if (wholeHours === 0) return `${minutes}m`;
  if (minutes === 0) return `${wholeHours}h`;
  return `${wholeHours}h ${minutes}m`;
}

export function formatElevation(meters) {
  if (meters === null || meters === undefined) return '0 m';
  return `${Math.round(Number(meters)).toLocaleString()} m`;
}

export function formatPercent(value, isRatio = false) {
  if (value === null || value === undefined) return '0%';
  const num = Number(value);
  const pct = isRatio ? num * 100 : num;
  return `${Math.round(pct)}%`;
}

export function formatCoords(lat, lng) {
  if (!lat || !lng) return '--';
  const latNum = Number(lat);
  const lngNum = Number(lng);
  const latDir = latNum >= 0 ? 'N' : 'S';
  const lngDir = lngNum >= 0 ? 'E' : 'W';
  return `${Math.abs(latNum).toFixed(2)}° ${latDir}, ${Math.abs(lngNum).toFixed(2)}° ${lngDir}`;
}

export function formatWeight(kg) {
  if (!kg) return '0 kg';
  return `${Math.round(Number(kg)).toLocaleString()} kg`;
}

export function formatSpeed(kmh) {
  if (!kmh) return '0 km/h';
  return `${Math.round(Number(kmh))} km/h`;
}

export function formatTemperature(celsius) {
  if (!celsius) return '0°C';
  return `${Math.round(Number(celsius))}°C`;
}

export function formatGrade(percent) {
  if (!percent) return '0%';
  const num = Number(percent);
  return `${num.toFixed(1)}%`;
}
