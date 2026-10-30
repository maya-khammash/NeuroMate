from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db.models import User, Patient
from app.core.security import get_current_user, require_doctor, require_student
from app.services.patient_service import PatientService
from app.schemas.responses import (
    APIResponse,
    PatientListResponse,
    PatientResponse,
    CTPatientResponse,
    ComaPatientResponse
)
from app.schemas.patient import PatientInput
from app.ai.inference import predict_risk, predict_risk_with_timeline
from app.ai.coma_inference import predict_coma
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/predictions",
    tags=["Predictions"]
)


@router.post("/ct-risk")
async def predict_ct_risk(
    patient_data: PatientInput,
    current_user: User = Depends(get_current_user)
):
    """
    Predict CT scan need for patient data (not saved to database)
    Available to all authenticated users
    """
    
    # Convert Pydantic model to dict for prediction
    data = {
        "age": patient_data.age,
        "sex": patient_data.sex,
        "mechanism": patient_data.mechanism,
        "history": patient_data.history,
        "timeSinceInjury": patient_data.timeSinceInjury,
        "gcs": patient_data.gcs,
        "tbiSeverity": patient_data.tbiSeverity,
        "vomiting": patient_data.vomiting,
        "seizure": patient_data.seizure,
        "loc": patient_data.loc,
        "amnesia": patient_data.amnesia,
        "headache": patient_data.headache,
        "pupil": patient_data.pupil
    }
    
    # Get prediction from AI model
    result = predict_risk(data)
    
    return APIResponse(
        success=True,
        message="CT risk prediction completed",
        data=result
    )


@router.post("/ct-risk/digital-twin")
async def predict_ct_risk_with_timeline(
    patient_data: PatientInput,
    current_user: User = Depends(get_current_user)
):
    """
    Predict CT scan need with digital twin timeline simulation
    Available to all authenticated users
    """
    
    # Convert Pydantic model to dict for prediction
    data = {
        "age": patient_data.age,
        "sex": patient_data.sex,
        "mechanism": patient_data.mechanism,
        "history": patient_data.history,
        "timeSinceInjury": patient_data.timeSinceInjury,
        "gcs": patient_data.gcs,
        "tbiSeverity": patient_data.tbiSeverity,
        "vomiting": patient_data.vomiting,
        "seizure": patient_data.seizure,
        "loc": patient_data.loc,
        "amnesia": patient_data.amnesia,
        "headache": patient_data.headache,
        "pupil": patient_data.pupil
    }
    
    # Get prediction with timeline from AI model
    result = predict_risk_with_timeline(data)
    
    return APIResponse(
        success=True,
        message="CT risk prediction with timeline completed",
        data=result
    )


@router.post("/coma-outcome")
async def predict_coma_outcome(
    patient_data: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Predict coma outcomes for patient data (not saved to database)
    Available to all authenticated users
    """
    
    result = predict_coma(patient_data)
    
    return APIResponse(
        success=True,
        message="Coma outcome prediction completed",
        data=result
    )


@router.get("/patient/{patient_id}/ct-risk")
async def predict_existing_patient_ct_risk(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Predict CT scan need for an existing patient in database
    Role-based access applies
    """
    
    # Get patient with authorization check
    patient = PatientService.get_patient_by_id(db, patient_id, current_user)
    
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found or access denied"
        )
    
    # Convert patient to dict for prediction
    patient_data = {
        "age": patient.age,
        "sex": getattr(patient, 'sex', None),
        "mechanism": getattr(patient, 'mechanism', None),
        "history": getattr(patient, 'history', None),
        "timeSinceInjury": getattr(patient, 'timeSinceInjury', None),
        "gcs": getattr(patient, 'gcs', None),
        "tbiSeverity": getattr(patient, 'tbiSeverity', None),
        "vomiting": getattr(patient, 'vomiting', None),
        "seizure": getattr(patient, 'seizure', None),
        "loc": getattr(patient, 'loc', None),
        "amnesia": getattr(patient, 'amnesia', None),
        "headache": getattr(patient, 'headache', None),
        "pupil": getattr(patient, 'pupil', None)
    }
    
    # Get prediction from AI model
    result = predict_risk(patient_data)
    
    # Add patient info to response
    result["patient_id"] = patient_id
    result["patient_name"] = patient.name
    
    return APIResponse(
        success=True,
        message="CT risk prediction for existing patient completed",
        data=result
    )


@router.get("/patient/{patient_id}/digital-twin")
async def predict_existing_patient_digital_twin(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Predict CT scan need with digital twin for an existing patient
    Role-based access applies
    """
    
    # Get patient with authorization check
    patient = PatientService.get_patient_by_id(db, patient_id, current_user)
    
    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found or access denied"
        )
    
    # Convert patient to dict for prediction
    patient_data = {
        "age": patient.age,
        "sex": getattr(patient, 'sex', None),
        "mechanism": getattr(patient, 'mechanism', None),
        "history": getattr(patient, 'history', None),
        "timeSinceInjury": getattr(patient, 'timeSinceInjury', None),
        "gcs": getattr(patient, 'gcs', None),
        "tbiSeverity": getattr(patient, 'tbiSeverity', None),
        "vomiting": getattr(patient, 'vomiting', None),
        "seizure": getattr(patient, 'seizure', None),
        "loc": getattr(patient, 'loc', None),
        "amnesia": getattr(patient, 'amnesia', None),
        "headache": getattr(patient, 'headache', None),
        "pupil": getattr(patient, 'pupil', None)
    }
    
    # Get prediction with timeline from AI model
    result = predict_risk_with_timeline(patient_data)
    
    # Add patient info to response
    result["patient_id"] = patient_id
    result["patient_name"] = patient.name
    
    return APIResponse(
        success=True,
        message="Digital twin prediction for existing patient completed",
        data=result
    )


@router.get("/models/health")
async def get_models_health(
    current_user: User = Depends(get_current_user)
):
    """Check if the ML models are loaded and ready"""
    
    try:
        from app.ai.inference import _model_loaded as ct_model_loaded
        from app.ai.coma_inference import _model_loaded as coma_model_loaded
        
        return APIResponse(
            success=True,
            message="Model health check completed",
            data={
                "ct_model": {
                    "loaded": ct_model_loaded,
                    "type": "XGBoost (CT Prediction)" if ct_model_loaded else "Rule-based (fallback)"
                },
                "coma_model": {
                    "loaded": coma_model_loaded,
                    "type": "XGBoost (Coma Prediction)" if coma_model_loaded else "Rule-based (fallback)"
                },
                "status": "ready"
            }
        )
    except Exception as e:
        return APIResponse(
            success=False,
            message="Model health check failed",
            data={"error": str(e)}
        )
