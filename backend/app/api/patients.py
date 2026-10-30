from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.db import models
from app.schemas.patient import PatientCreate
from app.core.security import get_current_user

router = APIRouter(prefix="/patients", tags=["Patients"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
def create_patient(
    patient: PatientCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor only")

    new_patient = models.Patient(
        doctor_id=user.id,
        **patient.dict()
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)

    return {"message": "Patient created", "id": new_patient.id}
@router.get("/")
def get_all_patients(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor only")

    return db.query(models.Patient).all()
@router.get("/view")
def student_view_patients(
    db: Session = Depends(get_db),
    user=Depends(get_current_user)
):
    if user.role != "student":
        raise HTTPException(status_code=403, detail="Student only")

    return db.query(models.Patient).all()
