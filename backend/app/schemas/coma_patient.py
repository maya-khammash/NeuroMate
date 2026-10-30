from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ComaPatientCreate(BaseModel):
    """Schema for creating a coma patient"""
    name: str
    age: int
    cause_of_coma: str  # TBI, Stroke, Metabolic, Other
    gcs_total: int = Field(..., ge=3, le=15)
    gcs_motor: int = Field(..., ge=1, le=6)
    left_pupil_reactivity: str  # None, Sluggish, Brisk
    oxygen_saturation: float = Field(..., ge=0, le=100)
    map: float  # Mean Arterial Pressure
    heart_rate: int
    sedation_level: int = Field(..., ge=0, le=10, description="0 = No sedation, 10 = Deep sedation")
    head_midline: bool = True
    temperature_c: float


class ComaPatientResponse(BaseModel):
    """Schema for coma patient response with predictions"""
    id: int
    name: str
    age: int
    patient_type: str
    cause_of_coma: str
    gcs_total: int
    gcs_motor: int
    left_pupil_reactivity: str
    oxygen_saturation: float
    map: float
    heart_rate: int
    sedation_level: int
    head_midline: bool
    temperature_c: float
    # Coma predictions
    conscious_state: Optional[str] = None
    conscious_state_confidence: Optional[float] = None
    deterioration_risk: Optional[float] = None
    deterioration_level: Optional[str] = None
    stability_score: Optional[float] = None
    stability_level: Optional[str] = None
    model_type: Optional[str] = None
    prediction_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class ComaPredictionResult(BaseModel):
    """Schema for coma prediction results"""
    conscious_state: dict
    deterioration_risk: dict
    stability_score: dict
    model_type: str
