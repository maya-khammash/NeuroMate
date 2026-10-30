from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import json

from app.db.database import get_db
from app.db.models import ComaAssessment, ComaTimeline, ComaRiskFactor, Patient, User
from app.schemas.coma import (
    ComaAssessmentCreate,
    ComaAssessmentResponse,
    ComaTimelineCreate,
    ComaTimelineResponse,
    ComaRiskFactorCreate,
    ComaRiskFactorResponse,
    ComaDigitalTwinResponse
)
from app.services.ai_predictor import ai_predictor
from app.core.security import require_doctor, get_current_user

router = APIRouter(prefix="/api/coma", tags=["coma"])


@router.post("/assessment", response_model=ComaAssessmentResponse)
async def create_coma_assessment(
    assessment: ComaAssessmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user has required role
    require_doctor(current_user)
    """Create a new coma assessment for a patient"""
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == assessment.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create coma assessment
    db_assessment = ComaAssessment(
        patient_id=assessment.patient_id,
        eye_response=assessment.eye_response,
        verbal_response=assessment.verbal_response,
        motor_response=assessment.motor_response,
        gcs_total=assessment.eye_response + assessment.verbal_response + assessment.motor_response,
        left_pupil_size=assessment.left_pupil_size,
        right_pupil_size=assessment.right_pupil_size,
        left_pupil_reactivity=assessment.left_pupil_reactivity,
        right_pupil_reactivity=assessment.right_pupil_reactivity,
        heart_rate=assessment.heart_rate,
        blood_pressure_systolic=assessment.blood_pressure_systolic,
        blood_pressure_diastolic=assessment.blood_pressure_diastolic,
        oxygen_saturation=assessment.oxygen_saturation,
        respiratory_rate=assessment.respiratory_rate,
        temperature=assessment.temperature,
        brain_stem_reflexes=assessment.brain_stem_reflexes,
        corneal_reflexes=assessment.corneal_reflexes,
        cough_reflex=assessment.cough_reflex,
        gag_reflex=assessment.gag_reflex,
        intracranial_pressure=assessment.intracranial_pressure,
        seizures_present=assessment.seizures_present,
        ventilation_required=assessment.ventilation_required,
        sedatives=json.dumps(assessment.sedatives) if assessment.sedatives else None,
        vasopressors=assessment.vasopressors,
        assessor_id=current_user.id,
        notes=assessment.notes
    )
    
    db.add(db_assessment)
    db.commit()
    db.refresh(db_assessment)
    
    return db_assessment


@router.get("/assessment/{patient_id}", response_model=List[ComaAssessmentResponse])
async def get_coma_assessments(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all coma assessments for a patient"""
    # Check if user has required role
    require_doctor(current_user)
    
    assessments = db.query(ComaAssessment).filter(
        ComaAssessment.patient_id == patient_id
    ).order_by(ComaAssessment.assessment_date.desc()).all()
    
    return assessments


@router.get("/assessment/{patient_id}/latest", response_model=ComaAssessmentResponse)
async def get_latest_coma_assessment(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get latest coma assessment for a patient"""
    # Check if user has required role
    require_doctor(current_user)
    
    assessment = db.query(ComaAssessment).filter(
        ComaAssessment.patient_id == patient_id
    ).order_by(ComaAssessment.assessment_date.desc()).first()
    
    if not assessment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No coma assessment found for this patient"
        )
    
    return assessment


@router.post("/timeline", response_model=ComaTimelineResponse)
async def create_coma_timeline(
    timeline: ComaTimelineCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new coma timeline entry"""
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == timeline.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create timeline entry
    db_timeline = ComaTimeline(
        patient_id=timeline.patient_id,
        hour_since_injury=timeline.hour_since_injury,
        consciousness_level=timeline.consciousness_level,
        gcs_score=timeline.gcs_score,
        eeg_activity=timeline.eeg_activity,
        brain_metabolism=timeline.brain_metabolism,
        cerebral_blood_flow=timeline.cerebral_blood_flow,
        recovery_probability=timeline.recovery_probability,
        time_to_recovery=timeline.time_to_recovery,
        recovery_milestone=timeline.recovery_milestone,
        intracranial_hypertension_risk=timeline.intracranial_hypertension_risk,
        infection_risk=timeline.infection_risk,
        seizure_risk=timeline.seizure_risk,
        mortality_risk=timeline.mortality_risk,
        treatment_response=timeline.treatment_response,
        treatment_effectiveness=timeline.treatment_effectiveness,
        predicted_gcs_24h=timeline.predicted_gcs_24h,
        predicted_gcs_72h=timeline.predicted_gcs_72h,
        predicted_consciousness_date=timeline.predicted_consciousness_date,
        confidence_score=timeline.confidence_score
    )
    
    db.add(db_timeline)
    db.commit()
    db.refresh(db_timeline)
    
    return db_timeline


@router.get("/timeline/{patient_id}", response_model=List[ComaTimelineResponse])
async def get_coma_timeline(
    patient_id: int,
    hours: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get coma timeline for a patient"""
    
    query = db.query(ComaTimeline).filter(
        ComaTimeline.patient_id == patient_id
    )
    
    if hours:
        cutoff_time = datetime.utcnow() - timedelta(hours=hours)
        query = query.filter(ComaTimeline.timeline_date >= cutoff_time)
    
    timeline = query.order_by(ComaTimeline.timeline_date.asc()).all()
    
    return timeline


@router.post("/risk-factors", response_model=ComaRiskFactorResponse)
async def create_coma_risk_factors(
    risk_factors: ComaRiskFactorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create coma risk factors for a patient"""
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == risk_factors.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Create risk factors
    db_risk_factors = ComaRiskFactor(
        patient_id=risk_factors.patient_id,
        initial_gcs=risk_factors.initial_gcs,
        injury_mechanism=risk_factors.injury_mechanism,
        injury_severity=risk_factors.injury_severity,
        location_of_injury=risk_factors.location_of_injury,
        age_group=risk_factors.age_group,
        comorbidities=json.dumps(risk_factors.comorbidities) if risk_factors.comorbidities else None,
        ct_findings=json.dumps(risk_factors.ct_findings) if risk_factors.ct_findings else None,
        mri_findings=json.dumps(risk_factors.mri_findings) if risk_factors.mri_findings else None,
        mri_score=risk_factors.mri_score,
        hemoglobin=risk_factors.hemoglobin,
        platelets=risk_factors.platelets,
        glucose=risk_factors.glucose,
        sodium=risk_factors.sodium,
        lactate=risk_factors.lactate,
        cerebral_edema=risk_factors.cerebral_edema,
        hemorrhage=risk_factors.hemorrhage,
        ischemia=risk_factors.ischemia,
        hydrocephalus=risk_factors.hydrocephalus,
        surgery_required=risk_factors.surgery_required,
        icu_stay_duration=risk_factors.icu_stay_duration,
        ventilation_duration=risk_factors.ventilation_duration,
        predicted_outcome=risk_factors.predicted_outcome,
        glasgow_outcome_scale=risk_factors.glasgow_outcome_scale,
        functional_independence_score=risk_factors.functional_independence_score
    )
    
    db.add(db_risk_factors)
    db.commit()
    db.refresh(db_risk_factors)
    
    return db_risk_factors


@router.get("/risk-factors/{patient_id}", response_model=ComaRiskFactorResponse)
async def get_coma_risk_factors(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get coma risk factors for a patient"""
    
    risk_factors = db.query(ComaRiskFactor).filter(
        ComaRiskFactor.patient_id == patient_id
    ).order_by(ComaRiskFactor.assessment_date.desc()).first()
    
    if not risk_factors:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No risk factors found for this patient"
        )
    
    return risk_factors


@router.get("/digital-twin/{patient_id}", response_model=ComaDigitalTwinResponse)
async def get_coma_digital_twin(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get complete coma digital twin data for a patient"""
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get latest assessment
    latest_assessment = db.query(ComaAssessment).filter(
        ComaAssessment.patient_id == patient_id
    ).order_by(ComaAssessment.assessment_date.desc()).first()
    
    # Get timeline
    timeline = db.query(ComaTimeline).filter(
        ComaTimeline.patient_id == patient_id
    ).order_by(ComaTimeline.timeline_date.asc()).all()
    
    # Get risk factors
    risk_factors = db.query(ComaRiskFactor).filter(
        ComaRiskFactor.patient_id == patient_id
    ).order_by(ComaRiskFactor.assessment_date.desc()).first()
    
    return ComaDigitalTwinResponse(
        patient_id=patient_id,
        patient_name=patient.name,
        patient_age=patient.age,
        patient_sex=patient.sex,
        latest_assessment=latest_assessment,
        timeline=timeline,
        risk_factors=risk_factors,
        created_at=datetime.utcnow()
    )


@router.post("/prediction/{patient_id}")
async def get_coma_prediction(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI-based coma prediction (mock implementation)"""
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get latest assessment for prediction
    latest_assessment = db.query(ComaAssessment).filter(
        ComaAssessment.patient_id == patient_id
    ).order_by(ComaAssessment.assessment_date.desc()).first()
    
    if not latest_assessment:
        raise HTTPException(status_code=404, detail="No assessment found for this patient")
    
    # Convert assessment to dict for AI predictor
    assessment_data = {
        'gcs_total': latest_assessment.gcs_total,
        'oxygen_saturation': latest_assessment.oxygen_saturation,
        'blood_pressure_systolic': latest_assessment.blood_pressure_systolic,
        'heart_rate': latest_assessment.heart_rate,
        'left_pupil_reactivity': latest_assessment.left_pupil_reactivity,
        'sedation_level': 1 if latest_assessment.sedatives else 0,
        'time_in_coma_hours': 24,  # This would come from patient data
        'seizures_present': latest_assessment.seizures_present
    }
    
    # Use real AI predictor
    prediction = ai_predictor.predict_coma_outcome(assessment_data)
    
    return prediction
