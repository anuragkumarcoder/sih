from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List
import uvicorn

from schemas import (
    RouteOptimizationRequest, RouteOptimizationResponse,
    HazardPredictionRequest, HazardPredictionResponse,
    LatLng
)
from ner_graph import NER_NODES, NER_EDGES
from optimizer import route_optimizer_engine
from hazard_model import hazard_engine

app = FastAPI(
    title="NER Smart Logistics - AI Terrain & Accessibility Intelligence API",
    description="Microservice for predictive route optimization across difficult terrains in the North Eastern Region of India (SIH26002).",
    version="1.0.0"
)

# Enable CORS for Frontend & Gateway integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "NER-AI-Predictive-Routing-Microservice",
        "region": "North Eastern Region (NER)",
        "active_nodes_count": len(NER_NODES),
        "active_corridors_count": len(NER_EDGES),
        "ai_models_loaded": ["TerrainHazardPredictor", "MultiObjectiveAStarOptimizer"]
    }

@app.get("/api/v1/network/nodes")
def get_ner_network_nodes():
    """Returns all pre-indexed North Eastern transport nodes and logistical depots."""
    return {
        "count": len(NER_NODES),
        "nodes": [
            {"id": k, "name": k, **v} for k, v in NER_NODES.items()
        ]
    }

@app.get("/api/v1/network/corridors")
def get_ner_network_corridors():
    """Returns all mapped highway segments, base gradients, and risk ratings."""
    return {
        "count": len(NER_EDGES),
        "corridors": [
            {"source": u, "target": v, **attrs} for u, v, attrs in NER_EDGES
        ]
    }

@app.post("/api/v1/routing/optimize", response_model=RouteOptimizationResponse)
def optimize_route(req: RouteOptimizationRequest):
    """
    Computes terrain-resilient, weather-adapted multi-criteria optimal route.
    Penalizes landslides, flash floods, steep gradient passes, and heavy commercial truck limits.
    """
    try:
        return route_optimizer_engine.optimize_route(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Route optimization failed: {str(e)}")

@app.post("/api/v1/hazards/predict-risk", response_model=HazardPredictionResponse)
def predict_hazard_risk(req: HazardPredictionRequest):
    """
    Predicts geotechnical landslide & road collapse probability based on slope, precipitation, and soil saturation.
    """
    try:
        return hazard_engine.predict_hazard(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hazard prediction failed: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
