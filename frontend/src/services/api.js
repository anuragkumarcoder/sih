const BACKEND_URL = "http://localhost:8080/api/v1";
const AI_SERVICE_URL = "http://localhost:8000/api/v1";

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${BACKEND_URL}/master/districts`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function checkAIHealth() {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/health`, { signal: AbortSignal.timeout(1500) });
    return res.ok;
  } catch (e) {
    return false;
  }
}

export async function fetchDistricts() {
  try {
    const res = await fetch(`${BACKEND_URL}/master/districts`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function fetchWarehouses() {
  try {
    const res = await fetch(`${BACKEND_URL}/master/warehouses`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function fetchActiveIncidents() {
  try {
    const res = await fetch(`${BACKEND_URL}/incidents/active`);
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function reportIncidentApi(incidentData) {
  try {
    const res = await fetch(`${BACKEND_URL}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(incidentData)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}

export async function optimizeRouteApi(requestPayload) {
  // First try direct AI Microservice if reachable
  try {
    const res = await fetch(`${AI_SERVICE_URL}/routing/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  // Next try Spring Boot backend route optimizer gateway
  try {
    const res = await fetch(`${BACKEND_URL}/routes/optimize`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}

  return null;
}

export async function predictHazardRiskApi(hazardPayload) {
  try {
    const res = await fetch(`${AI_SERVICE_URL}/hazards/predict-risk`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hazardPayload)
    });
    if (res.ok) return await res.json();
  } catch (e) {}
  return null;
}
