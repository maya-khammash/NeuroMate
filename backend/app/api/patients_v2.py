from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user, require_doctor, require_student
from app.services.patient_service import PatientService
from app.schemas.responses import (
    APIResponse,
    PatientListResponse,
    PatientResponse,
    CTPatientResponse,
    ComaPatientResponse
)
from app.schemas.patient import PatientCreate
from app.schemas.coma_patient import ComaPatientCreate
from app.ai.inference import predict_risk
from app.ai.coma_inference import predict_coma
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/patients",
    tags=["Patients"]
)


@router.get("/", response_model=PatientListResponse)
async def get_patients(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    patient_type: Optional[str] = Query(None, description="Filter by patient type (ct/coma)"),
    in_queue: Optional[bool] = Query(None, description="Filter by queue status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get patients with role-based access:
    - Doctors: Their own patients only
    - Students: All patients (educational data only)
    - Admins: All patients
    """
    
    if current_user.role == "doctor":
        return PatientService.get_patients_for_doctor(
            db, current_user.id, page, per_page, patient_type, in_queue
        )
    elif current_user.role == "student":
        return PatientService.get_cases_for_student(
            db, page, per_page, patient_type
        )
    elif current_user.role == "admin":
        # Admins can see all patients
        return PatientService._get_all_patients_admin(
            db, page, per_page, patient_type, in_queue
        )
    else:
        raise HTTPException(status_code=403, detail="Unauthorized")


@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific patient by ID with role-based access control"""
    
    patient = PatientService.get_patient_by_id(db, patient_id, current_user)
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return patient


@router.post("/ct", response_model=PatientResponse)
async def create_ct_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Create a new CT scan patient with AI prediction"""
    
    # Prepare patient data for prediction
    patient_data = {
        "age": patient.age,
        "sex": patient.sex,
        "mechanism": patient.mechanism,
        "history": patient.history,
        "timeSinceInjury": patient.timeSinceInjury,
        "gcs": patient.gcs,
        "tbiSeverity": patient.tbiSeverity,
        "vomiting": patient.vomiting,
        "seizure": patient.seizure,
        "loc": patient.loc,
        "amnesia": patient.amnesia,
        "headache": patient.headache,
        "pupil": patient.pupil
    }
    
    # Get AI prediction
    prediction = predict_risk(patient_data)
    
    # Create new patient with prediction results
    from app.db.models import Patient
    new_patient = Patient(
        name=patient.name,
        age=patient.age,
        patient_type="ct",
        sex=patient.sex,
        mechanism=patient.mechanism,
        history=patient.history,
        timeSinceInjury=patient.timeSinceInjury,
        gcs=patient.gcs,
        tbiSeverity=patient.tbiSeverity,
        vomiting=patient.vomiting,
        seizure=patient.seizure,
        loc=patient.loc,
        amnesia=patient.amnesia,
        headache=patient.headache,
        pupil=patient.pupil,
        user_id=current_user.id,
        # Save prediction results
        risk_score=prediction.get("risk_score"),
        risk_level=prediction.get("risk_level"),
        needs_ct=prediction.get("needs_ct_within_24h"),
        confidence=prediction.get("confidence"),
        model_type=prediction.get("model_type"),
        prediction_date=datetime.utcnow()
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return CTPatientResponse.from_orm(new_patient)


@router.post("/coma", response_model=PatientResponse)
async def create_coma_patient(
    patient: ComaPatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Create a new coma patient with AI prediction"""
    
    # Prepare patient data for coma prediction
    patient_data = {
        "age": patient.age,
        "cause_of_coma": patient.cause_of_coma,
        "gcs_total": patient.gcs_total,
        "gcs_motor": patient.gcs_motor,
        "left_pupil_reactivity": patient.left_pupil_reactivity,
        "oxygen_saturation": patient.oxygen_saturation,
        "map": patient.map,
        "heart_rate": patient.heart_rate,
        "sedation_level": patient.sedation_level,
        "head_midline": patient.head_midline,
        "temperature_c": patient.temperature_c
    }
    
    # Get AI coma prediction
    prediction = predict_coma(patient_data)
    
    # Create new coma patient with prediction results
    from app.db.models import Patient
    new_patient = Patient(
        name=patient.name,
        age=patient.age,
        patient_type="coma",
        user_id=current_user.id,
        # Coma-specific fields
        cause_of_coma=patient.cause_of_coma,
        gcs_total=patient.gcs_total,
        gcs_motor=patient.gcs_motor,
        left_pupil_reactivity=patient.left_pupil_reactivity,
        oxygen_saturation=patient.oxygen_saturation,
        map_pressure=patient.map,
        heart_rate=patient.heart_rate,
        sedation_level=patient.sedation_level,
        head_midline=patient.head_midline,
        temperature_c=patient.temperature_c,
        # Save coma prediction results
        conscious_state=prediction.get("conscious_state", {}).get("prediction"),
        conscious_state_confidence=prediction.get("conscious_state", {}).get("confidence"),
        deterioration_risk=prediction.get("deterioration_risk", {}).get("score"),
        deterioration_level=prediction.get("deterioration_risk", {}).get("level"),
        stability_score=prediction.get("stability_score", {}).get("score"),
        stability_level=prediction.get("stability_score", {}).get("level"),
        model_type=prediction.get("model_type"),
        prediction_date=datetime.utcnow()
    )

    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return ComaPatientResponse.from_orm(new_patient)


@router.patch("/{patient_id}/queue", response_model=PatientResponse)
async def update_patient_queue(
    patient_id: int,
    queue_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Update patient queue status"""
    
    patient = PatientService.update_patient_queue(
        db, patient_id, queue_data.get("in_queue", True), current_user
    )
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return patient


@router.delete("/{patient_id}")
async def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Delete a patient"""
    
    success = PatientService.delete_patient(db, patient_id, current_user)
    
    if not success:
        raise HTTPException(status_code=404, detail="Patient not found")
    
    return APIResponse(
        success=True,
        message="Patient deleted successfully"
    )


# Legacy endpoints for backward compatibility
@router.get("/doctor/list", response_model=PatientListResponse)
async def get_doctor_patients_legacy(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_doctor)
):
    """Legacy endpoint - use GET /patients instead"""
    return PatientService.get_patients_for_doctor(
        db, current_user.id, page, per_page
    )


@router.get("/student/cases", response_model=PatientListResponse)
async def get_student_cases_legacy(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_student)
):
    """Legacy endpoint - use GET /patients instead"""
    return PatientService.get_cases_for_student(db, page, per_page)
