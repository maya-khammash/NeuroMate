from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user, require_doctor, require_student, require_admin
from app.services.patient_service import PatientService
from app.schemas.responses import (
    APIResponse,
    PatientListResponse,
    PatientResponse,
    CTPatientResponse,
    ComaPatientResponse,
    UserResponse,
    ErrorResponse
)
from app.schemas.user import UserCreate
from app.core.security import hash_password
from datetime import datetime

router = APIRouter(
    prefix="/api/v1/users",
    tags=["Users"]
)


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    return UserResponse.from_orm(current_user)


@router.get("/doctors", response_model=list[UserResponse])
async def get_doctors(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all doctors (admin only)"""
    doctors = db.query(User).filter(User.role == "doctor").all()
    return [UserResponse.from_orm(doctor) for doctor in doctors]


@router.get("/students", response_model=list[UserResponse])
async def get_students(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Get all students (admin only)"""
    students = db.query(User).filter(User.role == "student").all()
    return [UserResponse.from_orm(student) for student in students]


@router.post("/", response_model=UserResponse)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Create a new user (admin only)"""
    
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


@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Delete a user (admin only)"""
    
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


@router.get("/{user_id}/patients", response_model=PatientListResponse)
async def get_user_patients(
    user_id: int,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    patient_type: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get patients for a specific user
    - Admins can view any user's patients
    - Doctors can only view their own patients
    - Students can only view educational cases
    """
    
    # Authorization check
    if current_user.role == "doctor" and current_user.id != user_id:
        raise HTTPException(
            status_code=403,
            detail="Doctors can only view their own patients"
        )
    
    if current_user.role == "student":
        raise HTTPException(
            status_code=403,
            detail="Students cannot access specific user patients"
        )
    
    # Get the target user
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return PatientService.get_patients_for_doctor(
        db, user_id, page, per_page, patient_type
    )
