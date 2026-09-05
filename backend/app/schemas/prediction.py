from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from enum import Enum

class RiskLevelEnum(str, Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class PredictionRequest(BaseModel):
    rainfall_24h: float = Field(..., ge=0.0, le=1000.0, description="24-hour antecedent rainfall in mm")
    rainfall_7d: float = Field(..., ge=0.0, le=3000.0, description="7-day cumulative rainfall in mm")
    soil_moisture: float = Field(..., ge=0.0, le=100.0, description="In-situ soil moisture saturation percentage")
    slope: float = Field(..., ge=0.0, le=90.0, description="Terrain slope gradient in degrees")
    elevation: float = Field(..., ge=0.0, le=8000.0, description="Elevation above mean sea level in meters")
    ndvi: float = Field(default=0.45, ge=-1.0, le=1.0, description="Normalized Difference Vegetation Index")
    historical_landslides: int = Field(default=0, ge=0, description="Recorded landslide incidents in past 10 years")
    distance_to_road: float = Field(default=500.0, ge=0.0, description="Distance to nearest highway/road in meters")
    distance_to_settlement: float = Field(default=800.0, ge=0.0, description="Distance to nearest human settlement in meters")
    district: Optional[str] = Field(default="Pakyong", description="District name in Northeast India")
    state: Optional[str] = Field(default="Sikkim", description="State name in Northeast India")
    location_name: Optional[str] = Field(default="Custom Hill Slope", description="Site / slope name")

    class Config:
        json_schema_extra = {
            "example": {
                "rainfall_24h": 165.4,
                "rainfall_7d": 450.2,
                "soil_moisture": 92.0,
                "slope": 48.5,
                "elevation": 860.0,
                "ndvi": 0.32,
                "historical_landslides": 14,
                "distance_to_road": 120.0,
                "distance_to_settlement": 350.0,
                "district": "Pakyong",
                "state": "Sikkim",
                "location_name": "NH-10 29th Mile Singtam Axis"
            }
        }

class PredictionResponse(BaseModel):
    risk_score: int = Field(..., ge=0, le=100, description="Calculated composite risk score from 0 to 100")
    risk_level: RiskLevelEnum = Field(..., description="Risk category: LOW, MODERATE, HIGH, CRITICAL")
    confidence: float = Field(..., ge=0.0, le=1.0, description="AI model prediction confidence probability")
    contributing_factors: List[str] = Field(..., description="Key natural and geotechnical drivers contributing to risk")
    factor_breakdown: Dict[str, str] = Field(..., description="Itemized factor severity levels (LOW, MODERATE, HIGH, VERY HIGH)")
    recommended_action: str = Field(..., description="Actionable standard operating procedure directive")
    geotechnical_details: Dict[str, float] = Field(default_factory=dict, description="Estimated Factor of Safety and pore pressure")
    timestamp: str = Field(..., description="ISO 8601 prediction timestamp")
