from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class ConsciousnessLevel(str, Enum):
    DEEP_COMA = "deep_coma"
    MODERATE_COMA = "moderate_coma"
    MILD_COMA = "mild_coma"
    VEGETATIVE = "vegetative"
    MINIMALLY_CONSCIOUS = "minimally_conscious"
    CONSCIOUS = "conscious"


class PupilReactivity(str, Enum):
    BRISK = "brisk"
    SLUGGISH = "sluggish"
    FIXED = "fixed"


class ReflexStatus(str, Enum):
    PRESENT = "present"
    ABSENT = "absent"
    IMPAIRED = "impaired"


class EEGActivity(str, Enum):
    BURST_SUPPRESSION = "burst_suppression"
    SLOW = "slow"
    NORMAL = "normal"
    SEIZURE_ACTIVITY = "seizure_activity"


class TreatmentResponse(str, Enum):
    IMPROVING = "improving"
    STABLE = "stable"
    DETERIORATING = "deteriorating"


class InjurySeverity(str, Enum):
    MILD = "mild"
    MODERATE = "moderate"
    SEVERE = "severe"


class AgeGroup(str, Enum):
    PEDIATRIC = "pediatric"
    ADULT = "adult"
    ELDERLY = "elderly"


class PredictedOutcome(str, Enum):
    GOOD_RECOVERY = "good_recovery"
    MODERATE_DISABILITY = "moderate_disability"
    SEVERE_DISABILITY = "severe_disability"
    VEGETATIVE = "vegetative"
    DEATH = "death"


# Base schemas
class ComaAssessmentBase(BaseModel):
    eye_response: int = Field(..., ge=1, le=4, description="Eye response (1-4)")
    verbal_response: int = Field(..., ge=1, le=5, description="Verbal response (1-5)")
    motor_response: int = Field(..., ge=1, le=6, description="Motor response (1-6)")
    left_pupil_size: Optional[float] = Field(None, ge=0, le=10, description="Left pupil size in mm")
    right_pupil_size: Optional[float] = Field(None, ge=0, le=10, description="Right pupil size in mm")
    left_pupil_reactivity: Optional[PupilReactivity] = None
    right_pupil_reactivity: Optional[PupilReactivity] = None
    heart_rate: Optional[int] = Field(None, ge=0, le=300, description="Heart rate (bpm)")
    blood_pressure_systolic: Optional[int] = Field(None, ge=0, le=300, description="Systolic BP")
    blood_pressure_diastolic: Optional[int] = Field(None, ge=0, le=200, description="Diastolic BP")
    oxygen_saturation: Optional[float] = Field(None, ge=0, le=100, description="O2 saturation (%)")
    respiratory_rate: Optional[int] = Field(None, ge=0, le=60, description="Respiratory rate")
    temperature: Optional[float] = Field(None, ge=20, le=45, description="Temperature (°C)")
    brain_stem_reflexes: Optional[ReflexStatus] = None
    corneal_reflexes: Optional[ReflexStatus] = None
    cough_reflex: Optional[ReflexStatus] = None
    gag_reflex: Optional[ReflexStatus] = None
    intracranial_pressure: Optional[float] = Field(None, ge=0, le=50, description="ICP (mmHg)")
    seizures_present: bool = False
    ventilation_required: bool = False
    sedatives: Optional[List[Dict[str, Any]]] = None
    vasopressors: bool = False
    notes: Optional[str] = None


class ComaAssessmentCreate(ComaAssessmentBase):
    patient_id: int


class ComaAssessmentResponse(ComaAssessmentBase):
    id: int
    patient_id: int
    gcs_total: int
    assessment_date: datetime
    assessor_id: Optional[int] = None

    class Config:
        from_attributes = True


class ComaTimelineBase(BaseModel):
    hour_since_injury: int = Field(..., ge=0, description="Hours since injury")
    consciousness_level: Optional[ConsciousnessLevel] = None
    gcs_score: Optional[int] = Field(None, ge=3, le=15, description="GCS score")
    eeg_activity: Optional[EEGActivity] = None
    brain_metabolism: Optional[float] = Field(None, ge=0, le=200, description="Brain metabolism %")
    cerebral_blood_flow: Optional[float] = Field(None, ge=0, le=100, description="Cerebral blood flow (ml/100g/min)")
    recovery_probability: Optional[float] = Field(None, ge=0, le=1, description="Recovery probability")
    time_to_recovery: Optional[int] = Field(None, ge=0, description="Hours to recovery")
    recovery_milestone: Optional[str] = None
    intracranial_hypertension_risk: Optional[float] = Field(None, ge=0, le=1, description="ICP hypertension risk")
    infection_risk: Optional[float] = Field(None, ge=0, le=1, description="Infection risk")
    seizure_risk: Optional[float] = Field(None, ge=0, le=1, description="Seizure risk")
    mortality_risk: Optional[float] = Field(None, ge=0, le=1, description="Mortality risk")
    treatment_response: Optional[TreatmentResponse] = None
    treatment_effectiveness: Optional[float] = Field(None, ge=0, le=1, description="Treatment effectiveness")
    predicted_gcs_24h: Optional[int] = Field(None, ge=3, le=15, description="Predicted GCS in 24h")
    predicted_gcs_72h: Optional[int] = Field(None, ge=3, le=15, description="Predicted GCS in 72h")
    predicted_consciousness_date: Optional[datetime] = None
    confidence_score: Optional[float] = Field(None, ge=0, le=1, description="AI confidence score")


class ComaTimelineCreate(ComaTimelineBase):
    patient_id: int


class ComaTimelineResponse(ComaTimelineBase):
    id: int
    patient_id: int
    timeline_date: datetime

    class Config:
        from_attributes = True


class ComaRiskFactorBase(BaseModel):
    initial_gcs: Optional[int] = Field(None, ge=3, le=15, description="Initial GCS score")
    injury_mechanism: Optional[str] = None
    injury_severity: Optional[InjurySeverity] = None
    location_of_injury: Optional[str] = None
    age_group: Optional[AgeGroup] = None
    comorbidities: Optional[List[Dict[str, Any]]] = None
    ct_findings: Optional[List[Dict[str, Any]]] = None
    mri_findings: Optional[List[Dict[str, Any]]] = None
    mri_score: Optional[float] = Field(None, ge=0, le=10, description="MRI injury score")
    hemoglobin: Optional[float] = Field(None, ge=0, le=20, description="Hemoglobin (g/dL)")
    platelets: Optional[int] = Field(None, ge=0, le=1000000, description="Platelets count")
    glucose: Optional[float] = Field(None, ge=0, le=1000, description="Glucose (mg/dL)")
    sodium: Optional[float] = Field(None, ge=100, le=200, description="Sodium (mmol/L)")
    lactate: Optional[float] = Field(None, ge=0, le=20, description="Lactate (mmol/L)")
    cerebral_edema: bool = False
    hemorrhage: bool = False
    ischemia: bool = False
    hydrocephalus: bool = False
    surgery_required: bool = False
    icu_stay_duration: Optional[int] = Field(None, ge=0, description="ICU stay in days")
    ventilation_duration: Optional[int] = Field(None, ge=0, description="Ventilation in days")
    predicted_outcome: Optional[PredictedOutcome] = None
    glasgow_outcome_scale: Optional[int] = Field(None, ge=1, le=5, description="GOS score")
    functional_independence_score: Optional[float] = Field(None, ge=0, le=100, description="Functional independence score")


class ComaRiskFactorCreate(ComaRiskFactorBase):
    patient_id: int


class ComaRiskFactorResponse(ComaRiskFactorBase):
    id: int
    patient_id: int
    assessment_date: datetime

    class Config:
        from_attributes = True


class ComaDigitalTwinResponse(BaseModel):
    patient_id: int
    patient_name: str
    patient_age: int
    patient_sex: str
    latest_assessment: Optional[ComaAssessmentResponse] = None
    timeline: List[ComaTimelineResponse] = []
    risk_factors: Optional[ComaRiskFactorResponse] = None
    created_at: datetime


class ComaPredictionResponse(BaseModel):
    recovery_probability: float = Field(..., ge=0, le=1)
    predicted_gcs_24h: int = Field(..., ge=3, le=15)
    predicted_gcs_72h: int = Field(..., ge=3, le=15)
    time_to_consciousness_hours: int = Field(..., ge=0)
    mortality_risk: float = Field(..., ge=0, le=1)
    complication_risk: Dict[str, float]
    confidence_score: float = Field(..., ge=0, le=1)
    model_version: str
    prediction_date: str


class ComaAssessmentSummary(BaseModel):
    patient_id: int
    patient_name: str
    latest_gcs: Optional[int] = None
    consciousness_level: Optional[str] = None
    recovery_probability: Optional[float] = None
    mortality_risk: Optional[float] = None
    last_assessment: Optional[datetime] = None
    ventilation_required: bool = False
    icp_monitoring: bool = False


class ComaStatsResponse(BaseModel):
    total_coma_patients: int
    active_coma_cases: int
    average_gcs_score: float
    recovery_rate: float
    mortality_rate: float
    average_icu_stay: float
    patients_by_severity: Dict[str, int]
    patients_by_consciousness_level: Dict[str, int]
