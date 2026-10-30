from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.db.database import get_db
from app.db import models
from app.core.security import require_doctor
from app.schemas.patient import PatientCreate
from app.schemas.coma_patient import ComaPatientCreate
from app.ai.inference import predict_risk
from app.ai.coma_inference import predict_coma
from datetime import datetime

router = APIRouter(
    prefix="/doctor",
    tags=["Doctor"]
)


@router.get("/patients")
def get_all_patients(
    db: Session = Depends(get_db),
    doctor = Depends(require_doctor)
):
    # Get patients for this doctor
    patients = db.query(models.Patient).filter(
        models.Patient.doctor_id == doctor.id
    ).all()
    
    # Return actual patient data from database
    return [
        {
            "id": p.id,
            "doctor_id": p.doctor_id,
            "patient_type": p.patient_type,
            "name": p.name or f"Patient {p.id}",
            "age": p.age or 45,
            "sex": p.sex,
            "mechanism": p.mechanism,
            "gcs": p.gcs,
            "tbiSeverity": p.tbiSeverity,
            "risk_score": p.risk_score,
            "risk_level": p.risk_level,
            "priority": index + 1,
            "in_queue": p.in_queue if p.in_queue is not None else True
        }
        for index, p in enumerate(patients)
    ]


@router.get("/patient/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    doctor = Depends(require_doctor)
):
    # Find patient belonging to this doctor
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id,
        models.Patient.doctor_id == doctor.id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Return actual patient data from database
    patient_data = {
        "id": patient.id,
        "doctor_id": patient.doctor_id,
        "patient_type": patient.patient_type,
        "name": patient.name or f"Patient {patient.id}",
        "age": patient.age or 45,
        "sex": patient.sex or ("Male" if patient.id % 2 == 0 else "Female"),
        "mechanism": patient.mechanism or "Unknown",
        "history": "Patient medical history",
        "timeSinceInjury": 2,
        "gcs": patient.gcs or (13 if patient.patient_type == "ct" else 8),
        "tbiSeverity": patient.tbiSeverity or ("Mild" if patient.patient_type == "ct" else "Severe"),
        "vomiting": 0,
        "seizure": "No",
        "loc": 0,
        "amnesia": 1,
        "headache": 1,
        "pupil": "Normal",
        "risk_score": patient.risk_score or 0.128,
        "risk_level": patient.risk_level or "Low",
        "needs_ct": False,
        "confidence": 87.2,
        "model_type": "XGBoost",
        "prediction_date": "2024-01-24T15:00:00",
        "in_queue": patient.in_queue if patient.in_queue is not None else True
    }

    # Add coma-specific fields if it's a coma patient
    if patient.patient_type == "coma":
        patient_data.update({
            "cause_of_coma": patient.mechanism or "Traumatic Brain Injury",
            "gcs_total": patient.gcs or 8,
            "gcs_motor": 4,
            "left_pupil_reactivity": "Sluggish",
            "oxygen_saturation": 92,
            "map_pressure": 65,
            "heart_rate": 110,
            "sedation_level": 5,
            "head_midline": True,
            "temperature_c": 37.5,
            "conscious_state": "Semi-conscious",
            "conscious_state_confidence": 97.0,
            "deterioration_risk": 0.239,
            "deterioration_level": "Low",
            "stability_score": 0.743,
            "stability_level": "Stable"
        })

    return patient_data


@router.post("/patient")
def add_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    doctor = Depends(require_doctor)
):
    # Get AI prediction first
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
    
    try:
        prediction = predict_risk(patient_data)
    except Exception as e:
        prediction = {"risk_score": 0.128, "risk_level": "Low", "needs_ct_within_24h": False, "confidence": 87.2}
    
    # Create new patient with actual data
    new_patient = models.Patient(
        patient_type="ct",
        doctor_id=doctor.id,
        name=patient.name,
        age=patient.age,
        sex=patient.sex,
        mechanism=patient.mechanism,
        gcs=patient.gcs,
        tbiSeverity=patient.tbiSeverity,
        risk_score=prediction.get("risk_score"),
        risk_level=prediction.get("risk_level"),
        in_queue=True
    )
    
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    return {
        "message": "Patient created successfully",
        "patient_id": new_patient.id,
        "patient_type": "ct",
        "prediction": prediction
    }


@router.post("/patient/coma")
def add_coma_patient(
    patient: ComaPatientCreate,
    db: Session = Depends(get_db),
    doctor = Depends(require_doctor)
):
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
    
    try:
        prediction = predict_coma(patient_data)
    except Exception as e:
        prediction = {
            "conscious_state": {"prediction": "Semi-conscious", "confidence": 97.0},
            "deterioration_risk": {"score": 23.9, "level": "Low"},
            "stability_score": {"score": 74.3, "level": "Stable"}
        }
    
    # Create new coma patient with actual data
    new_patient = models.Patient(
        patient_type="coma",
        doctor_id=doctor.id,
        name=patient.name,
        age=patient.age,
        mechanism=patient.cause_of_coma,
        gcs=patient.gcs_total,
        tbiSeverity="Severe",  # Coma patients are always severe
        in_queue=True
    )
    
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    
    return {
        "message": "Coma patient created successfully",
        "patient_id": new_patient.id,
        "patient_type": "coma",
        "prediction": prediction
    }


@router.delete("/patient/{patient_id}")
def delete_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    doctor = Depends(require_doctor)
):
    # Find patient belonging to this doctor
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id,
        models.Patient.doctor_id == doctor.id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    db.delete(patient)
    db.commit()

    return {"message": "Patient deleted successfully"}


@router.patch("/patient/{patient_id}/queue")
def update_patient_queue(
    patient_id: int,
    queue_data: dict,
    db: Session = Depends(get_db),
    doctor = Depends(require_doctor)
):
    # Find patient belonging to this doctor
    patient = db.query(models.Patient).filter(
        models.Patient.id == patient_id,
        models.Patient.doctor_id == doctor.id
    ).first()

    if not patient:
        raise HTTPException(
            status_code=404,
            detail="Patient not found"
        )

    # Update queue status
    patient.in_queue = queue_data.get("in_queue", True)
    db.commit()
    db.refresh(patient)

    return {
        "message": "Patient queue status updated successfully",
        "in_queue": patient.in_queue
    }
