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
    AlertEvaluationRequest,
    AlertEvaluationResponse,
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
    level: Optional[str] = Query(None, description="Filter alerts by level (CRITICAL, DANGER, WARNING, WATCH, INFO)")
):
    return prediction_service.get_all_alerts(level=level)

@router.post(
    "/alerts/evaluate",
    response_model=AlertEvaluationResponse,
    status_code=status.HTTP_200_OK,
    summary="Evaluate Geotechnical & Weather Inputs Against Alert Rules",
    description="Evaluates risk score, 24h rainfall, soil moisture saturation, slope, IoT sensor alarms, and verified field reports to determine alert severity tier."
)
def evaluate_alert_rules(payload: AlertEvaluationRequest) -> AlertEvaluationResponse:
    matched_rules = []
    reasons = []
    severity_rank = 0  # 0: INFO, 1: WATCH, 2: WARNING, 3: DANGER, 4: CRITICAL

    if payload.riskScore >= 80:
        severity_rank = max(severity_rank, 4)
        matched_rules.append("RULE-01-CRIT-RISK (Risk Score >= 80)")
        reasons.append(f"Composite AI landslide risk score is critical ({payload.riskScore}/100)")
    elif payload.riskScore >= 60:
        severity_rank = max(severity_rank, 2)
        matched_rules.append("RULE-02-WARN-RISK (Risk Score >= 60)")
        reasons.append(f"High risk index ({payload.riskScore}/100) on vulnerable geological formation")
    elif payload.riskScore >= 40:
        severity_rank = max(severity_rank, 1)

    if payload.rainfall24h > 120:
        severity_rank = max(severity_rank, 3)
        severity_rank = min(4, severity_rank + 1)
        matched_rules.append("RULE-03-EXTREME-RAIN (24h Rainfall > 120mm)")
        reasons.append(f"Extreme 24h rainfall ({payload.rainfall24h} mm) exceeding regional threshold")
    elif payload.rainfall24h > 70 and payload.slope > 25:
        severity_rank = max(severity_rank, 2)
        severity_rank = min(4, severity_rank + 1)
        matched_rules.append("RULE-04-HIGH-RAIN (24h Rainfall > 70mm on Steep Slope)")
        reasons.append(f"Heavy 24h rainfall ({payload.rainfall24h} mm) on acute slope ({payload.slope}°)")

    if payload.soilMoisture >= 85:
        severity_rank = max(severity_rank, 3)
        matched_rules.append("RULE-05-SOIL-SATURATION (Soil Moisture >= 85%)")
        reasons.append(f"Critical soil moisture saturation ({payload.soilMoisture}%) with pore-water pressure spike")

    if payload.criticalSensorTriggered:
        severity_rank = 4
        matched_rules.append("RULE-06-SENSOR-CRITICAL (Geotechnical Sensor Threshold Exceeded)")
        reasons.append("Active IoT inclinometer/extensometer sensor alarm triggered")

    if payload.verifiedFieldReportsCount >= 1 and payload.riskScore >= 50:
        severity_rank = min(4, severity_rank + 1)
        matched_rules.append(f"RULE-07-VERIFIED-REPORT-BOOST ({payload.verifiedFieldReportsCount} Verified Ground Reports)")
        reasons.append(f"{payload.verifiedFieldReportsCount} verified field reports confirm ground fissures or active slide")

    ranks = ["INFO", "WATCH", "WARNING", "DANGER", "CRITICAL"]
    severity = ranks[severity_rank]
    triggered = severity_rank >= 1

    actions = {
        "CRITICAL": "Mandatory immediate evacuation of valley and toe settlements. Total highway closure. Mobilize NDRF/SDRF emergency search & rescue teams.",
        "DANGER": "Issue pre-evacuation alert to vulnerable households. Restrict heavy traffic on mountain corridors.",
        "WARNING": "Advise residents to avoid steep cut-slopes and stream gullies. Put road clearance equipment on standby.",
        "WATCH": "Monitor live IoT sensor telemetry. Maintain communication with local village disaster management committees.",
        "INFO": "Continue standard baseline surveillance."
    }

    titles = {
        "CRITICAL": f"CRITICAL LANDSLIDE WARNING: Immediate Slope Failure Threat in {payload.district}",
        "DANGER": f"DANGER ADVISORY: Severe Geotechnical Destabilization in {payload.district}",
        "WARNING": f"LANDSLIDE WARNING: Heavy Rainfall & Elevated Risk in {payload.district}",
        "WATCH": f"LANDSLIDE WATCH: Saturated Soil & Moderate Vulnerability in {payload.district}",
        "INFO": f"ROUTINE MONITORING: Normal Geotechnical Conditions in {payload.district}"
    }

    reason_str = ". ".join(reasons) + "." if reasons else "Geotechnical indices within regular baseline parameters."

    pop_mult = 1.0 if severity == "CRITICAL" else 0.75 if severity == "DANGER" else 0.5 if severity == "WARNING" else 0.25
    affected_pop = int(payload.populationExposed * pop_mult)

    return AlertEvaluationResponse(
        triggered=triggered,
        severity=severity,
        title=titles.get(severity, f"Advisory for {payload.district}"),
        message=f"Landslide hazard status for {payload.location} ({payload.district}, {payload.state}) calculated as {severity}.",
        reason=reason_str,
        recommendedAction=actions.get(severity, "Maintain surveillance."),
        affectedPopulation=affected_pop,
        matchedRules=matched_rules,
        deliveryChannels=["APP", "SMS", "PUSH"]
    )

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
