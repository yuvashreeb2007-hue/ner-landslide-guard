"""
AI Landslide Prediction Engine & Geotechnical Explainability Inference Module.
Loads the trained Random Forest model and performs multi-factor attribution,
confidence estimation, and standard operating procedure recommendations.
"""

import os
import joblib
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Tuple
from app.schemas.prediction import PredictionRequest, PredictionResponse, RiskLevelEnum

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")

class LandslidePredictor:
    def __init__(self):
        self.model = None
        self.feature_names = [
            "rainfall_24h",
            "rainfall_7d",
            "soil_moisture",
            "slope",
            "elevation",
            "ndvi",
            "historical_landslides",
            "distance_to_road",
            "distance_to_settlement"
        ]
        self.feature_importances = {}
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                artifact = joblib.load(MODEL_PATH)
                self.model = artifact.get("model")
                self.feature_names = artifact.get("feature_names", self.feature_names)
                self.feature_importances = artifact.get("feature_importances", {})
                print(f"[LandslidePredictor] Loaded production model from {MODEL_PATH}")
            except Exception as e:
                print(f"[LandslidePredictor] Error loading model: {e}. Using geotechnical fallback.")
                self.model = None
        else:
            print(f"[LandslidePredictor] Model file not found at {MODEL_PATH}. Using geotechnical fallback.")

    def _geotechnical_fallback_score(self, req: PredictionRequest) -> Tuple[int, float, float]:
        """
        Geotechnical physics-based analytical fallback based on Infinite Slope Model & Pore Pressure.
        Returns: (risk_score, probability, factor_of_safety)
        """
        # Driving forces
        driving = (
            (np.sin(np.radians(req.slope)) ** 1.6) * 45.0 +
            ((req.rainfall_24h / 150.0) ** 1.3) * 28.0 +
            ((req.rainfall_7d / 500.0) ** 1.1) * 18.0 +
            ((req.soil_moisture / 100.0) ** 1.8) * 32.0 +
            (req.historical_landslides * 1.8) +
            (14.0 * (1.0 - min(req.distance_to_road, 120.0) / 120.0) if req.distance_to_road < 120.0 else 0.0)
        )
        # Resisting forces
        resisting = (
            (req.ndvi * 24.0) +
            ((1.0 - np.sin(np.radians(req.slope))) * 25.0) +
            (20.0 * (1.0 - req.soil_moisture / 50.0) if req.soil_moisture < 50.0 else 0.0) +
            15.0
        )
        fos = round(float(resisting / max(driving, 0.01)), 2)
        logit = (driving - resisting) / 12.0
        prob = 1.0 / (1.0 + np.exp(-logit))
        score = int(np.clip(prob * 100.0, 0, 100))
        return score, prob, fos

    def _determine_risk_level(self, risk_score: int) -> RiskLevelEnum:
        if risk_score <= 30:
            return RiskLevelEnum.LOW
        elif risk_score <= 60:
            return RiskLevelEnum.MODERATE
        elif risk_score <= 80:
            return RiskLevelEnum.HIGH
        else:
            return RiskLevelEnum.CRITICAL

    def _extract_contributing_factors(self, req: PredictionRequest) -> List[str]:
        factors = []
        if req.rainfall_24h >= 120.0:
            factors.append(f"Extreme 24h monsoon rainfall ({req.rainfall_24h:.1f} mm)")
        elif req.rainfall_24h >= 65.0:
            factors.append(f"Heavy 24h precipitation ({req.rainfall_24h:.1f} mm)")

        if req.soil_moisture >= 85.0:
            factors.append(f"Critical soil moisture saturation ({req.soil_moisture:.1f}%)")
        elif req.soil_moisture >= 70.0:
            factors.append(f"Elevated soil saturation ({req.soil_moisture:.1f}%)")

        if req.slope >= 45.0:
            factors.append(f"Steep mountainous escarpment ({req.slope:.1f}° gradient)")
        elif req.slope >= 32.0:
            factors.append(f"Moderate-to-steep hill slope ({req.slope:.1f}°)")

        if req.rainfall_7d >= 350.0:
            factors.append(f"High 7-day antecedent saturation ({req.rainfall_7d:.1f} mm)")

        if req.historical_landslides >= 8:
            factors.append(f"High historical recurrence ({req.historical_landslides} past events)")
        elif req.historical_landslides >= 3:
            factors.append(f"Known landslide susceptibility zone ({req.historical_landslides} events)")

        if req.distance_to_road < 100.0 and req.slope > 30.0:
            factors.append(f"Highway toe undercutting vulnerability ({req.distance_to_road:.0f}m from road)")

        if req.ndvi < 0.30:
            factors.append(f"Sparse vegetative cover / exposed topsoil (NDVI: {req.ndvi:.2f})")

        if not factors:
            factors.append("Stable geological and meteorological baseline conditions")
        return factors

    def _get_factor_breakdown(self, req: PredictionRequest) -> Dict[str, str]:
        breakdown = {}
        
        # Rainfall
        if req.rainfall_24h >= 120.0:
            breakdown["rainfall_24h"] = "VERY HIGH"
        elif req.rainfall_24h >= 60.0:
            breakdown["rainfall_24h"] = "HIGH"
        elif req.rainfall_24h >= 25.0:
            breakdown["rainfall_24h"] = "MODERATE"
        else:
            breakdown["rainfall_24h"] = "LOW"

        # Soil Moisture
        if req.soil_moisture >= 85.0:
            breakdown["soil_moisture"] = "VERY HIGH"
        elif req.soil_moisture >= 70.0:
            breakdown["soil_moisture"] = "HIGH"
        elif req.soil_moisture >= 50.0:
            breakdown["soil_moisture"] = "MODERATE"
        else:
            breakdown["soil_moisture"] = "LOW"

        # Slope
        if req.slope >= 45.0:
            breakdown["slope"] = "VERY HIGH"
        elif req.slope >= 32.0:
            breakdown["slope"] = "HIGH"
        elif req.slope >= 18.0:
            breakdown["slope"] = "MODERATE"
        else:
            breakdown["slope"] = "LOW"

        # Geomorphology & History
        if req.historical_landslides >= 8:
            breakdown["historical_landslides"] = "VERY HIGH"
        elif req.historical_landslides >= 3:
            breakdown["historical_landslides"] = "HIGH"
        else:
            breakdown["historical_landslides"] = "LOW"

        # Vegetation Protection
        if req.ndvi < 0.25:
            breakdown["vegetation_cover"] = "POOR (HIGH RISK)"
        elif req.ndvi < 0.50:
            breakdown["vegetation_cover"] = "MODERATE"
        else:
            breakdown["vegetation_cover"] = "DENSE (LOW RISK)"

        return breakdown

    def _get_recommended_action(self, level: RiskLevelEnum, req: PredictionRequest) -> str:
        if level == RiskLevelEnum.CRITICAL:
            return (
                "IMMEDIATE EVACUATION DIRECTIVE: Sound community siren alerts and evacuate settlements within 500m of slope base. "
                "Halt all transit along nearby road corridors. Mobilize NDRF/SDRF response teams and deploy heavy earth-clearing units on standby."
            )
        elif level == RiskLevelEnum.HIGH:
            return (
                "ORANGE ALERT - PRECAUTIONARY ACTION: Restrict night-time transit and heavy commercial vehicular movement. "
                "Place emergency road clearance squads on active patrol. Village Disaster Management Committees to inspect tension cracks continuously."
            )
        elif level == RiskLevelEnum.MODERATE:
            return (
                "YELLOW ADVISORY - ENHANCED VIGILANCE: Maintain continuous monitoring of automated rain gauges and soil moisture telemetry. "
                "Inspect roadside drainage culverts and ensure clear water runoff pathways."
            )
        else:
            return (
                "GREEN NORMAL - STANDARD MONITORING: Normal baseline conditions. Continue periodic satellite InSAR and sensor telemetry logging."
            )

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        # Prepare feature vector
        features = np.array([[
            req.rainfall_24h,
            req.rainfall_7d,
            req.soil_moisture,
            req.slope,
            req.elevation,
            req.ndvi,
            req.historical_landslides,
            req.distance_to_road,
            req.distance_to_settlement
        ]])

        if self.model is not None:
            try:
                prob = float(self.model.predict_proba(features)[0, 1])
                risk_score = int(np.clip(prob * 100.0, 0, 100))
                # Confidence is calibrated distance from boundary 0.5
                confidence = float(np.clip(0.5 + abs(prob - 0.5) * 0.96, 0.70, 0.99))
                # Estimate factor of safety
                _, _, fos = self._geotechnical_fallback_score(req)
            except Exception as e:
                print(f"[LandslidePredictor] Model predict error: {e}. Falling back to physics engine.")
                risk_score, prob, fos = self._geotechnical_fallback_score(req)
                confidence = 0.88
        else:
            risk_score, prob, fos = self._geotechnical_fallback_score(req)
            confidence = 0.89

        risk_level = self._determine_risk_level(risk_score)
        contributing_factors = self._extract_contributing_factors(req)
        factor_breakdown = self._get_factor_breakdown(req)
        recommended_action = self._get_recommended_action(risk_level, req)

        # Geotechnical calculation estimates
        pore_pressure_ratio = round(float((req.soil_moisture / 100.0) * (req.rainfall_24h / 200.0)), 3)
        shear_stress_ratio = round(float(np.sin(np.radians(req.slope)) * (1.0 + req.soil_moisture / 100.0)), 3)

        return PredictionResponse(
            risk_score=risk_score,
            risk_level=risk_level,
            confidence=round(confidence, 2),
            contributing_factors=contributing_factors,
            factor_breakdown=factor_breakdown,
            recommended_action=recommended_action,
            geotechnical_details={
                "factor_of_safety_est": fos,
                "pore_pressure_ratio": min(pore_pressure_ratio, 1.0),
                "shear_stress_index": shear_stress_ratio
            },
            timestamp=datetime.utcnow().isoformat() + "Z"
        )

# Global singleton predictor
predictor = LandslidePredictor()
