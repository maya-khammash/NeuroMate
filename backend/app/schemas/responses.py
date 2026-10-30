from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime


class APIResponse(BaseModel):
    """Standard API response wrapper"""
    success: bool
    message: str
    data: Optional[dict] = None
    error: Optional[str] = None


class PatientResponse(BaseModel):
    """Standard patient response model"""
    id: int
    name: str
    age: int
    patient_type: str
    in_queue: bool
    created_at: datetime
    updated_at: Optional[datetime] = None


class CTPatientResponse(PatientResponse):
    """CT Scan patient specific response"""
    sex: Optional[str] = None
    mechanism: Optional[str] = None
    history: Optional[str] = None
    timeSinceInjury: Optional[int] = None
    gcs: Optional[int] = None
    tbiSeverity: Optional[str] = None
    vomiting: Optional[int] = None
    seizure: Optional[str] = None
    loc: Optional[int] = None
    amnesia: Optional[int] = None
    headache: Optional[int] = None
    pupil: Optional[str] = None
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    needs_ct: Optional[bool] = None
    confidence: Optional[float] = None
    model_type: Optional[str] = None
    prediction_date: Optional[datetime] = None


class ComaPatientResponse(PatientResponse):
    """Coma patient specific response"""
    cause_of_coma: Optional[str] = None
    gcs_total: Optional[int] = None
    gcs_motor: Optional[int] = None
    left_pupil_reactivity: Optional[str] = None
    oxygen_saturation: Optional[float] = None
    map_pressure: Optional[float] = None
    heart_rate: Optional[int] = None
    sedation_level: Optional[int] = None
    head_midline: Optional[bool] = None
    temperature_c: Optional[float] = None
    conscious_state: Optional[str] = None
    conscious_state_confidence: Optional[float] = None
    deterioration_risk: Optional[float] = None
    deterioration_level: Optional[str] = None
    stability_score: Optional[float] = None
    stability_level: Optional[str] = None


class PatientListResponse(BaseModel):
    """Patient list response with pagination"""
    patients: List[PatientResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool


class PredictionResponse(BaseModel):
    """Standard prediction response"""
    risk_score: Optional[float] = None
    risk_level: Optional[str] = None
    needs_ct: Optional[bool] = None
    confidence: Optional[float] = None
    model_type: Optional[str] = None
    prediction_date: datetime


class ComaPredictionResponse(BaseModel):
    """Coma prediction response"""
    conscious_state: Optional[dict] = None
    deterioration_risk: Optional[dict] = None
    stability_score: Optional[dict] = None
    model_type: Optional[str] = None
    prediction_date: datetime


class UserResponse(BaseModel):
    """Standard user response"""
    id: int
    username: str
    role: str
    created_at: datetime


class ErrorResponse(BaseModel):
    """Standard error response"""
    error: str
    detail: Optional[str] = None
    code: Optional[str] = None
