from fastapi import FastAPI
from app.db.database import engine
from app.db.models import Base
from app.auth.routes import router as auth_router
# Legacy routes for backward compatibility
from app.api.doctor import router as doctor_router
from app.api.student import router as student_router
from app.api.admin import router as admin_router
from app.api.predict import router as predict_router
from app.api.coma import router as coma_router
# New v2 API routes
from app.api.patients_v2 import router as patients_v2_router
from app.api.users import router as users_router
from app.api.admin_v2 import router as admin_v2_router
from app.api.predictions import router as predictions_router
from app.api.debug import router as debug_router
from fastapi.middleware.cors import CORSMiddleware




app = FastAPI(title="NeuroMate API", description="Clinical Digital Twin for TBI")

# Authentication routes
app.include_router(auth_router)

# New v2 API routes (recommended)
app.include_router(patients_v2_router)
app.include_router(users_router)
app.include_router(admin_v2_router)
app.include_router(predictions_router)

# Debug routes (remove in production)
app.include_router(debug_router)

# Legacy routes for backward compatibility
app.include_router(doctor_router)
app.include_router(student_router)
app.include_router(admin_router)
app.include_router(predict_router)
app.include_router(coma_router)

Base.metadata.create_all(bind=engine)

# ✅ CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



# app = FastAPI(
#     title="NeuroMate Backend",
#     version="0.1.0",
#     description="Clinical Digital Twin API"
# )

# # ✅ CORS (مهم جدًا)
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],  # React
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # Routers
# app.include_router(predict_router)

# @app.get("/")
# def root():
#     return {"status": "ok "}

# @app.get("/health")
# def health():
#     return {"status": "ok"}
