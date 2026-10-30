from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db.models import User, Patient
from app.core.security import get_current_user, require_admin
from app.services.patient_service import PatientService
from app.schemas.responses import (
    APIResponse,
    PatientListResponse,
    UserResponse
)
from app.schemas.user import UserCreate
from app.core.security import hash_password
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/admin",
    tags=["Admin"]
)


@router.get("/dashboard")
async def get_admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get admin dashboard statistics"""
    
    total_users = db.query(User).count()
    total_doctors = db.query(User).filter(User.role == "doctor").count()
    total_students = db.query(User).filter(User.role == "student").count()
    total_patients = db.query(Patient).count()
    ct_patients = db.query(Patient).filter(Patient.patient_type == "ct").count()
    coma_patients = db.query(Patient).filter(Patient.patient_type == "coma").count()
    
    return APIResponse(
        success=True,
        message="Dashboard data retrieved successfully",
        data={
            "users": {
                "total": total_users,
                "doctors": total_doctors,
                "students": total_students,
                "admins": total_users - total_doctors - total_students
            },
            "patients": {
                "total": total_patients,
                "ct": ct_patients,
                "coma": coma_patients
            }
        }
    )


@router.get("/users", response_model=list[UserResponse])
async def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all users with their patient counts"""
    
    users = db.query(User).all()
    
    user_responses = []
    for user in users:
        patient_count = db.query(Patient).filter(Patient.user_id == user.id).count()
        user_data = UserResponse.from_orm(user)
        # Add patient count as an extra field (not in the schema but useful for admin)
        user_responses.append({
            **user_data.dict(),
            "patient_count": patient_count
        })
    
    return user_responses


@router.get("/patients", response_model=PatientListResponse)
async def get_all_patients(
    page: int = 1,
    per_page: int = 20,
    patient_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all patients in the system (admin only)"""
    
    return PatientService._get_all_patients_admin(
        db, page, per_page, patient_type
    )


@router.post("/users", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new user"""
    
    # Check if username already exists
    existing_user = db.query(User).filter(
        User.username == user_data.username
    ).first()
    
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )
    
    # Validate role
    if user_data.role not in ["admin", "doctor", "student"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid role. Must be admin, doctor, or student"
        )
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    new_user = User(
        username=user_data.username,
        password=hashed_password,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return UserResponse.from_orm(new_user)


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a user"""
    
    # Prevent admin from deleting themselves
    if current_user.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot delete themselves"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    db.delete(user)
    db.commit()
    
    return APIResponse(
        success=True,
        message="User deleted successfully"
    )


@router.get("/system/health")
async def get_system_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get system health information"""
    
    try:
        # Check database connection
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception:
        db_status = "unhealthy"
    
    # Check AI models
    try:
        from app.ai.inference import _model_loaded as ct_model_loaded
        from app.ai.coma_inference import _model_loaded as coma_model_loaded
        
        ai_status = {
            "ct_model": "loaded" if ct_model_loaded else "not_loaded",
            "coma_model": "loaded" if coma_model_loaded else "not_loaded"
        }
    except Exception:
        ai_status = {
            "ct_model": "error",
            "coma_model": "error"
        }
    
    return APIResponse(
        success=True,
        message="System health retrieved successfully",
        data={
            "database": db_status,
            "ai_models": ai_status,
            "timestamp": datetime.utcnow().isoformat()
        }
    )
