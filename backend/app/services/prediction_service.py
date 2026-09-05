"""
Prediction Service Layer for NER LandslideGuard
Handles business logic, model caching, batch predictions, and risk analytics.
"""

from typing import List, Dict, Any, Optional
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.ml.predictor import predictor
from app.models.data_models import RISK_ZONES, INCIDENTS, ALERTS, WEATHER_DATA, FIELD_REPORTS
from datetime import datetime
import uuid

class PredictionService:
    @staticmethod
    def predict_landslide_risk(request: PredictionRequest) -> PredictionResponse:
        """Executes ML inference on the provided meteorological and geotechnical parameters."""
        return predictor.predict(request)

    @staticmethod
    def get_all_risk_zones(district: Optional[str] = None, state: Optional[str] = None, level: Optional[str] = None) -> List[Dict[str, Any]]:
        """Retrieves and filters real-time risk zones across Northeast India."""
        zones = RISK_ZONES
        if district:
            zones = [z for z in zones if z["district"].lower() == district.lower()]
        if state:
            zones = [z for z in zones if z["state"].lower() == state.lower()]
        if level:
            zones = [z for z in zones if z["riskLevel"].upper() == level.upper()]
        return zones

    @staticmethod
    def get_risk_zone_by_id(zone_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves detailed geotechnical profile for a specific risk zone."""
        for z in RISK_ZONES:
            if z["id"].lower() == zone_id.lower():
                return z
        return None

    @staticmethod
    def create_field_report(report_data: Dict[str, Any]) -> Dict[str, Any]:
        """Saves a new citizen or field officer hazard report into memory store."""
        new_id = f"REP-{datetime.utcnow().year}-{str(uuid.uuid4())[:6].upper()}"
        
        # Calculate AI risk score based on hazard type and urgency
        base_score = 45
        if report_data.get("urgencyLevel") == "CRITICAL":
            base_score = 88
        elif report_data.get("urgencyLevel") == "URGENT":
            base_score = 72
        if report_data.get("roadBlocked"):
            base_score += 10
            
        report_record = {
            "id": new_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "verificationStatus": "PENDING_VERIFICATION",
            "aiRiskScore": min(base_score, 100),
            **report_data
        }
        FIELD_REPORTS.insert(0, report_record)
        return report_record

    @staticmethod
    def get_all_incidents(state: Optional[str] = None) -> List[Dict[str, Any]]:
        if state:
            return [inc for inc in INCIDENTS if inc["state"].lower() == state.lower()]
        return INCIDENTS

    @staticmethod
    def get_all_alerts(level: Optional[str] = None) -> List[Dict[str, Any]]:
        if level:
            return [alt for alt in ALERTS if alt["level"].upper() == level.upper()]
        return ALERTS

    @staticmethod
    def get_all_weather(district: Optional[str] = None) -> List[Dict[str, Any]]:
        if district:
            return [w for w in WEATHER_DATA if w["district"].lower() == district.lower()]
        return WEATHER_DATA

prediction_service = PredictionService()
