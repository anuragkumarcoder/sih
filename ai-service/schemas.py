from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class VehicleType(str, Enum):
    HEAVY_COMMERCIAL = "HEAVY_COMMERCIAL"      # Large trucks (NH only, sensitive to high grade)
    MEDIUM_COMMERCIAL = "MEDIUM_COMMERCIAL"    # 6-wheelers
    OFFROAD_4X4 = "OFFROAD_4X4"                # 4x4 pickup / emergency response
    CARGO_DRONE = "CARGO_DRONE"                # Aerial delivery for medical/urgent
    LIGHT_ELECTRIC = "LIGHT_ELECTRIC"          # Intra-valley delivery

class HazardType(str, Enum):
    LANDSLIDE = "LANDSLIDE"
    FLASH_FLOOD = "FLASH_FLOOD"
    ROAD_SUBSIDENCE = "ROAD_SUBSIDENCE"
    BRIDGE_COLLAPSE = "BRIDGE_COLLAPSE"
    HEAVY_FOG = "HEAVY_FOG"
    SNOW_ICE = "SNOW_ICE"
    PROTEST_BLOCKADE = "PROTEST_BLOCKADE"

class Severity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class LatLng(BaseModel):
    lat: float
    lng: float
    name: Optional[str] = None
    elevation_m: Optional[float] = None

class ActiveIncident(BaseModel):
    incident_id: str
    hazard_type: HazardType
    severity: Severity
    location: LatLng
    road_name: Optional[str] = None
    landmark: Optional[str] = None
    danger_key: Optional[str] = None
    status: Optional[str] = "ACTIVE"
    verified: Optional[bool] = True
    impact_radius_km: float = 6.0
    passable_by_4x4: bool = False
    reported_at: Optional[str] = None

class WeatherCondition(BaseModel):
    rainfall_24h_mm: float = 0.0
    is_monsoon_active: bool = False
    fog_visibility_m: float = 5000.0
    temperature_c: float = 22.0

class RouteOptimizationRequest(BaseModel):
    origin: LatLng
    destination: LatLng
    vehicle_type: VehicleType = VehicleType.MEDIUM_COMMERCIAL
    cargo_weight_kg: float = 3000.0
    is_hazardous_cargo: bool = False
    is_emergency_relief: bool = False
    weather: Optional[WeatherCondition] = Field(default_factory=WeatherCondition)
    active_incidents: Optional[List[ActiveIncident]] = Field(default_factory=list)
    avoid_high_altitude_passes: bool = False

class ElevationPoint(BaseModel):
    distance_km: float
    elevation_m: float
    gradient_percent: float
    hazard_risk_score: float

class RouteSegment(BaseModel):
    from_node: str
    to_node: str
    distance_km: float
    duration_minutes: float
    road_type: str
    surface_quality: str
    avg_grade_percent: float
    landslide_risk_score: float
    polyline: List[List[float]] # [[lat, lng], ...]

class OptimizedRoute(BaseModel):
    route_id: str
    name: str
    strategy: str # "AI_SAFE_TERRAIN", "FASTEST_STANDARD", "EMERGENCY_RELIEF"
    total_distance_km: float
    estimated_duration_hours: float
    avg_elevation_m: float
    max_elevation_m: float
    elevation_gain_m: float
    max_gradient_percent: float
    composite_risk_score: float # 0.0 (Safe) to 1.0 (Extreme)
    fuel_consumption_litres: float
    co2_emissions_kg: float
    passable: bool
    risk_warnings: List[str]
    segments: List[RouteSegment]
    elevation_profile: List[ElevationPoint]
    waypoints: List[LatLng]

class RouteOptimizationResponse(BaseModel):
    status: str
    origin_name: str
    destination_name: str
    recommended_route: OptimizedRoute
    alternative_routes: List[OptimizedRoute]
    weather_summary: Dict[str, Any]
    active_hazard_count: int

class HazardPredictionRequest(BaseModel):
    latitude: float
    longitude: float
    state_code: str # "AS", "ML", "AR", "NL", "MN", "MZ", "TR", "SK"
    slope_angle_deg: float
    rainfall_24h_mm: float
    soil_saturation_index: float # 0.0 to 1.0
    deforestation_score: float # 0.0 to 1.0
    distance_to_faultline_km: float

class HazardPredictionResponse(BaseModel):
    risk_probability: float
    risk_level: Severity
    primary_risk_factors: List[str]
    recommended_vehicle_restrictions: List[VehicleType]
    safe_speed_limit_kmh: int
    sensor_confidence: float
