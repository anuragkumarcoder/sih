import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from typing import Dict, Any, List, Tuple
from schemas import HazardPredictionRequest, HazardPredictionResponse, Severity, VehicleType

class TerrainHazardPredictor:
    def __init__(self):
        self._is_trained = False
        self.classifier = RandomForestClassifier(n_estimators=50, random_state=42)
        self.severity_regressor = GradientBoostingRegressor(n_estimators=50, random_state=42)
        self._train_initial_model()

    def _train_initial_model(self):
        """Pre-trains model on realistic geotechnical synthetic dataset for Himalayan/Patkai mountain terrain."""
        np.random.seed(42)
        n_samples = 1200
        
        # Features: [slope_deg, rain_24h_mm, soil_saturation, deforestation, fault_dist_km]
        slope = np.random.uniform(5.0, 45.0, n_samples)
        rain = np.random.uniform(0.0, 300.0, n_samples)
        soil_sat = np.random.uniform(0.1, 0.95, n_samples)
        deforest = np.random.uniform(0.05, 0.9, n_samples)
        fault_dist = np.random.uniform(1.0, 50.0, n_samples)

        # Realistic physical formula for landslide triggering factor
        # Higher slope (>25 deg) + high rain (>100mm) + high soil sat + high deforestation -> very high risk
        risk_score = (
            0.35 * (slope / 45.0)**1.5 +
            0.30 * (rain / 250.0) +
            0.20 * soil_sat +
            0.15 * deforest -
            0.05 * (fault_dist / 50.0)
        )
        risk_score = np.clip(risk_score, 0.0, 1.0)
        
        # Binary target: 1 = Obstruction/Landslide occurred, 0 = Clear
        y_binary = (risk_score > 0.48).astype(int)
        
        X = np.column_stack([slope, rain, soil_sat, deforest, fault_dist])
        self.classifier.fit(X, y_binary)
        self.severity_regressor.fit(X, risk_score)
        self._is_trained = True

    def predict_hazard(self, req: HazardPredictionRequest) -> HazardPredictionResponse:
        features = np.array([[
            req.slope_angle_deg,
            req.rainfall_24h_mm,
            req.soil_saturation_index,
            req.deforestation_score,
            req.distance_to_faultline_km
        ]])
        
        prob = float(self.severity_regressor.predict(features)[0])
        prob = max(0.02, min(0.98, prob))
        
        risk_factors = []
        if req.rainfall_24h_mm > 120.0:
            risk_factors.append("Extreme 24h precipitation threshold exceeded (>120mm)")
        elif req.rainfall_24h_mm > 60.0:
            risk_factors.append("Moderate to heavy monsoon precipitation")
            
        if req.slope_angle_deg > 30.0:
            risk_factors.append(f"Critical slope gradient ({req.slope_angle_deg:.1f}° - High shear stress zone)")
            
        if req.soil_saturation_index > 0.75:
            risk_factors.append("High pore-water pressure and soil liquefaction risk")
            
        if req.deforestation_score > 0.6:
            risk_factors.append("Severe loss of root cohesion due to slope destabilization")

        if not risk_factors:
            risk_factors.append("Normal geotechnical baseline stability")

        # Determine severity level
        if prob > 0.75:
            severity = Severity.CRITICAL
            speed_limit = 20
            restrictions = [VehicleType.HEAVY_COMMERCIAL, VehicleType.MEDIUM_COMMERCIAL, VehicleType.LIGHT_ELECTRIC]
        elif prob > 0.50:
            severity = Severity.HIGH
            speed_limit = 35
            restrictions = [VehicleType.HEAVY_COMMERCIAL]
        elif prob > 0.30:
            severity = Severity.MEDIUM
            speed_limit = 50
            restrictions = []
        else:
            severity = Severity.LOW
            speed_limit = 65
            restrictions = []

        return HazardPredictionResponse(
            risk_probability=round(prob, 3),
            risk_level=severity,
            primary_risk_factors=risk_factors,
            recommended_vehicle_restrictions=restrictions,
            safe_speed_limit_kmh=speed_limit,
            sensor_confidence=0.92
        )

# Global singleton instance
hazard_engine = TerrainHazardPredictor()
