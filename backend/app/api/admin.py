from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user, require_admin, hash_password
from app.db import models
from app.schemas.user import UserCreate

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# ===============================
# GET ALL USERS + PATIENTS
# ===============================
@router.get("/all-data")
def get_all_data(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")

    users = db.query(User).all()

    return [
        {
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "patients": [
                {
                    "patient_id": p.id,
                    "age": p.age,
                    "sex": p.sex,
                    "gcs": p.gcs
                }
                for p in user.patients
            ]
        }
        for user in users
    ]

# ===============================
# DELETE USER
# ===============================
@router.delete("/user/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    # ❌ منع الأدمن من حذف نفسه
    if admin.id == user_id:
        raise HTTPException(
            status_code=400,
            detail="Admin cannot delete himself"
        )

    user = db.query(models.User).filter(
        models.User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}

# ===============================
# ADD USER
# ===============================
@router.post("/user")
def add_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_admin)
):
    # Check if username already exists
    existing_user = db.query(models.User).filter(
        models.User.username == user_data.username
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
    new_user = models.User(
        username=user_data.username,
        password=hashed_password,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return {
        "message": "User created successfully",
        "user": {
            "user_id": new_user.id,
            "username": new_user.username,
            "role": new_user.role
        }
    }
