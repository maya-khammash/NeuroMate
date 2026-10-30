from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.db.models import User
from app.core.security import get_current_user, hash_password, verify_password
from app.schemas.responses import APIResponse

router = APIRouter(prefix="/debug", tags=["Debug"])

@router.get("/auth-test")
async def test_auth(current_user: User = Depends(get_current_user)):
    """Test if authentication is working"""
    return APIResponse(
        success=True,
        message="Authentication working",
        data={
            "user_id": current_user.id,
            "username": current_user.username,
            "role": current_user.role
        }
    )

@router.post("/test-login")
async def test_login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Test login without authentication"""
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        return APIResponse(
            success=False,
            message="User not found",
            data={"username": username}
        )
    
    is_valid = verify_password(password, user.password)
    
    return APIResponse(
        success=is_valid,
        message="Password check completed",
        data={
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "password_valid": is_valid
        }
    )

@router.get("/users")
async def list_users(db: Session = Depends(get_db)):
    """List all users (for debugging)"""
    users = db.query(User).all()
    return APIResponse(
        success=True,
        message="Users retrieved",
        data=[
            {
                "id": user.id,
                "username": user.username,
                "role": user.role,
                "has_password": bool(user.password)
            }
            for user in users
        ]
    )
