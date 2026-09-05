"""
FastAPI REST API Routes for NER LandslideGuard
Implements all 7 required endpoints with full documentation and Pydantic validation.
"""

from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Optional, Dict, Any
from app.schemas.prediction import PredictionRequest, PredictionResponse
from app.schemas.common import (
    RiskZoneSchema,
    IncidentSchema,
    AlertSchema,
    WeatherSchema,
    FieldReportCreate,
    FieldReportSchema
)
from app.services.prediction_service import prediction_service
from app.models.data_models import FIELD_REPORTS

router = APIRouter(prefix="/api", tags=["Disaster Management & AI Prediction"])

@router.get("/health", summary="Service Health Check")
def health_check():
    """Returns the operational status of the AI prediction backend."""
    return {
        "status": "healthy",
        "service": "NER LandslideGuard AI Engine",
        "version": "1.0.0",
        "region_coverage": "8 States of Northeast India (NER)"
    }

@router.post(
    "/predict-risk",
    response_model=PredictionResponse,
    status_code=status.HTTP_200_OK,
    summary="Predict Landslide Risk from Geotechnical & Weather Features",
    description="Calculates composite landslide risk score (0-100), risk level category (LOW, MODERATE, HIGH, CRITICAL), confidence metric, explainability factor contributions, and recommended SOP directive."
)
def predict_landslide_risk(payload: PredictionRequest) -> PredictionResponse:
    try:
        result = prediction_service.predict_landslide_risk(payload)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Inference error: {str(e)}"
        )

@router.get(
    "/risk-zones",
    response_model=List[RiskZoneSchema],
    summary="Get Northeast India Risk Zones",
    description="Returns active landslide risk zones across the 8 Northeastern states with live hydrological telemetry and population exposure figures."
)
def get_risk_zones(
    district: Optional[str] = Query(None, description="Filter by district name"),
    state: Optional[str] = Query(None, description="Filter by state (e.g. Sikkim, Meghalaya)"),
    level: Optional[str] = Query(None, description="Filter by risk level (LOW, MODERATE, HIGH, CRITICAL)")
):
    return prediction_service.get_all_risk_zones(district=district, state=state, level=level)

@router.get(
    "/risk-zones/{zone_id}",
    response_model=RiskZoneSchema,
    summary="Get Risk Zone Details by ID",
    description="Fetches specific geotechnical parameters, sensors, and critical infrastructure for a designated risk zone."
)
def get_risk_zone_by_id(zone_id: str):
    zone = prediction_service.get_risk_zone_by_id(zone_id)
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Risk zone '{zone_id}' not found"
        )
    return zone

@router.post(
    "/reports",
    response_model=FieldReportSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Submit Citizen or Field Officer Hazard Report",
    description="Registers a new field observation (e.g. tension crack, rockfall, road block) and runs automated risk scoring."
)
def submit_field_report(report: FieldReportCreate):
    try:
        created = prediction_service.create_field_report(report.dict())
        return created
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit report: {str(e)}"
        )

@router.get(
    "/reports",
    response_model=List[FieldReportSchema],
    summary="List Citizen & Field Reports",
    description="Lists all submitted field hazard reports."
)
def get_field_reports():
    return FIELD_REPORTS

@router.get(
    "/incidents",
    response_model=List[IncidentSchema],
    summary="Get Historical & Recent Landslide Incidents",
    description="Retrieves historical landslide records and active disaster incident responses in Northeast India."
)
def get_incidents(
    state: Optional[str] = Query(None, description="Filter incidents by state")
):
    return prediction_service.get_all_incidents(state=state)

@router.get(
    "/alerts",
    response_model=List[AlertSchema],
    summary="Get Early Warning Alerts & Disaster Bulletins",
    description="Fetches active RED, ORANGE, and YELLOW early warning advisories issued by GSI / NDMA / SDMAs."
)
def get_alerts(
    level: Optional[str] = Query(None, description="Filter alerts by level (RED, ORANGE, YELLOW)")
):
    return prediction_service.get_all_alerts(level=level)

@router.get(
    "/weather",
    response_model=List[WeatherSchema],
    summary="Get Automatic Weather Station (AWS) Observations",
    description="Returns real-time AWS meteorological data including 24h rainfall, forecasts, humidity, and wind conditions."
)
def get_weather(
    district: Optional[str] = Query(None, description="Filter weather by district")
):
    return prediction_service.get_all_weather(district=district)
