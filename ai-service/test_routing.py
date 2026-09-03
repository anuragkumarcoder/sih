import pytest
from fastapi.testclient import TestClient
from main import app
from schemas import VehicleType, Severity

client = TestClient(app)

def test_health():
    res = client.get("/api/v1/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "HEALTHY"
    assert data["active_nodes_count"] > 10

def test_network_nodes():
    res = client.get("/api/v1/network/nodes")
    assert res.status_code == 200
    data = res.json()
    assert "nodes" in data
    node_names = [n["name"] for n in data["nodes"]]
    assert "Guwahati" in node_names
    assert "Tawang" in node_names
    assert "Shillong" in node_names
    assert "Kohima" in node_names

def test_route_optimization_guwahati_to_tawang():
    payload = {
        "origin": {"lat": 26.1445, "lng": 91.7362, "name": "Guwahati"},
        "destination": {"lat": 27.5861, "lng": 91.8653, "name": "Tawang"},
        "vehicle_type": "HEAVY_COMMERCIAL",
        "weather": {
            "rainfall_24h_mm": 110.0,
            "is_monsoon_active": True
        },
        "active_incidents": []
    }
    res = client.post("/api/v1/routing/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "recommended_route" in data
    rec = data["recommended_route"]
    assert rec["total_distance_km"] > 300
    assert rec["max_elevation_m"] > 3000
    assert len(rec["elevation_profile"]) > 0
    assert len(rec["segments"]) > 0

def test_route_with_active_landslide_avoidance():
    # Place a critical landslide on Dimapur - Kohima corridor
    payload = {
        "origin": {"lat": 26.1445, "lng": 91.7362, "name": "Guwahati"},
        "destination": {"lat": 24.8170, "lng": 93.9368, "name": "Imphal"},
        "vehicle_type": "HEAVY_COMMERCIAL",
        "active_incidents": [
            {
                "incident_id": "INC-001",
                "hazard_type": "LANDSLIDE",
                "severity": "CRITICAL",
                "location": {"lat": 25.792, "lng": 93.917}, # Between Dimapur & Kohima (NH-29 Pagla Pahar)
                "impact_radius_km": 15.0,
                "passable_by_4x4": False
            }
        ]
    }
    res = client.post("/api/v1/routing/optimize", json=payload)
    assert res.status_code == 200
    data = res.json()
    rec = data["recommended_route"]
    assert rec is not None

def test_hazard_risk_prediction():
    payload = {
        "latitude": 27.5034,
        "longitude": 92.1037,
        "state_code": "AR",
        "slope_angle_deg": 38.5,
        "rainfall_24h_mm": 185.0,
        "soil_saturation_index": 0.88,
        "deforestation_score": 0.65,
        "distance_to_faultline_km": 4.2
    }
    res = client.post("/api/v1/hazards/predict-risk", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["risk_probability"] > 0.5
    assert data["risk_level"] in ["HIGH", "CRITICAL"]
    assert len(data["primary_risk_factors"]) > 0
