from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class RiskZoneSchema(BaseModel):
    id: str
    name: str
    district: str
    state: str
    latitude: float
    longitude: float
    riskScore: int
    riskLevel: RiskLevel
    rainfall24h: float
    rainfall7d: float
    soilMoisture: float
    slope: float
    elevation: float
    historicalLandslides: int
    populationExposed: int
    status: str
    criticalInfrastructure: List[str] = []
    sensorsActive: int = 0
    lastUpdated: str

class IncidentSchema(BaseModel):
    id: str
    title: str
    district: str
    state: str
    latitude: float
    longitude: float
    severity: str
    status: str
    timestamp: str
    rainfallAtEvent: float
    casualties: int
    roadBlocked: bool
    description: str
    teamsDispatched: List[str] = []

class AlertSchema(BaseModel):
    id: str
    title: str
    level: str  # CRITICAL, DANGER, WARNING, WATCH, INFO
    category: str
    district: str
    state: str
    message: str
    actionRequired: str
    issuedAt: str
    validUntil: str
    bulletinNumber: str
    affectedPopulation: int
    reason: Optional[str] = None
    status: str = "ACTIVE"
    deliveryChannels: List[str] = ["APP", "SMS", "PUSH"]

class AlertEvaluationRequest(BaseModel):
    district: str
    state: str
    location: str
    riskScore: int = Field(..., ge=0, le=100)
    rainfall24h: float = Field(..., ge=0)
    soilMoisture: float = Field(..., ge=0, le=100)
    slope: float = Field(..., ge=0, le=90)
    criticalSensorTriggered: bool = False
    verifiedFieldReportsCount: int = 0
    populationExposed: int = 5000

class AlertEvaluationResponse(BaseModel):
    triggered: bool
    severity: str  # CRITICAL, DANGER, WARNING, WATCH, INFO
    title: str
    message: str
    reason: str
    recommendedAction: str
    affectedPopulation: int
    matchedRules: List[str]
    deliveryChannels: List[str]

class WeatherSchema(BaseModel):
    district: str
    state: str
    temperature: float
    humidity: int
    rainfallCurrent: float
    rainfall24h: float
    rainfallForecast24h: float
    windSpeed: float
    condition: str
    cloudCover: int
    lastObservation: str

class FieldReportCreate(BaseModel):
    reporterName: str
    reporterPhone: Optional[str] = None
    role: str = "Citizen"
    district: str
    state: str
    locationName: str
    latitude: float
    longitude: float
    hazardType: str
    urgencyLevel: str
    description: str
    roadBlocked: bool = False
    structuresAtRisk: int = 0
    photoUrl: Optional[str] = None

class FieldReportSchema(FieldReportCreate):
    id: str
    timestamp: str
    verificationStatus: str = "PENDING_VERIFICATION"
    aiRiskScore: Optional[int] = None
