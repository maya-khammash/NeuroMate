from typing import Optional, List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc, asc
from datetime import datetime

from app.db.models import Patient, User
from app.schemas.responses import (
    PatientResponse, 
    CTPatientResponse, 
    ComaPatientResponse,
    PatientListResponse,
    APIResponse
)
from app.core.security import get_current_user


class PatientService:
    """Service layer for patient operations"""
    
    @staticmethod
    def get_patients_for_doctor(
        db: Session, 
        doctor_id: int,
        page: int = 1,
        per_page: int = 20,
        patient_type: Optional[str] = None,
        in_queue: Optional[bool] = None
    ) -> PatientListResponse:
        """Get patients for a specific doctor with filtering and pagination"""
        
        # Build query
        query = db.query(Patient).filter(Patient.doctor_id == doctor_id)
        
        # Apply filters
        if patient_type:
            query = query.filter(Patient.patient_type == patient_type)
        
        if in_queue is not None:
            query = query.filter(Patient.in_queue == in_queue)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        offset = (page - 1) * per_page
        patients = query.order_by(
            Patient.in_queue.desc(),
            Patient.risk_score.is_(None).asc(),
            Patient.risk_score.desc(),
            Patient.created_at.desc()
        ).offset(offset).limit(per_page).all()
        
        # Convert to response models
        patient_responses = []
        for patient in patients:
            if patient.patient_type == "ct":
                patient_response = CTPatientResponse.from_orm(patient)
            elif patient.patient_type == "coma":
                patient_response = ComaPatientResponse.from_orm(patient)
            else:
                patient_response = PatientResponse.from_orm(patient)
            
            patient_responses.append(patient_response)
        
        return PatientListResponse(
            patients=patient_responses,
            total=total,
            page=page,
            per_page=per_page,
            has_next=offset + per_page < total,
            has_prev=page > 1
        )
    
    @staticmethod
    def get_patient_by_id(
        db: Session, 
        patient_id: int,
        requesting_user: User
    ) -> Optional[PatientResponse]:
        """Get a specific patient by ID with authorization check"""
        
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        
        if not patient:
            return None
        
        # Authorization check
        if requesting_user.role == "doctor" and patient.doctor_id != requesting_user.id:
            return None
        
        if requesting_user.role == "student":
            # Students can only see limited data
            return PatientService._sanitize_patient_for_student(patient)
        
        # Return full data for doctors and admins
        if patient.patient_type == "ct":
            return CTPatientResponse.from_orm(patient)
        elif patient.patient_type == "coma":
            return ComaPatientResponse.from_orm(patient)
        else:
            return PatientResponse.from_orm(patient)
    
    @staticmethod
    def get_cases_for_student(
        db: Session,
        page: int = 1,
        per_page: int = 20,
        patient_type: Optional[str] = None
    ) -> PatientListResponse:
        """Get cases for students (educational purposes only)"""
        
        # Build query - students can see all patients but limited data
        query = db.query(Patient)
        
        if patient_type:
            query = query.filter(Patient.patient_type == patient_type)
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (page - 1) * per_page
        patients = query.order_by(Patient.created_at.desc()).offset(offset).limit(per_page).all()
        
        # Sanitize data for students
        patient_responses = [PatientService._sanitize_patient_for_student(p) for p in patients]
        
        return PatientListResponse(
            patients=patient_responses,
            total=total,
            page=page,
            per_page=per_page,
            has_next=offset + per_page < total,
            has_prev=page > 1
        )
    
    @staticmethod
    def _sanitize_patient_for_student(patient: Patient) -> PatientResponse:
        """Remove sensitive information for student access"""
        
        base_data = {
            "id": patient.id,
            "name": f"Patient {patient.id}",  # Hide real name
            "age": patient.age,
            "patient_type": patient.patient_type,
            "in_queue": False,  # Hide queue status
            "created_at": patient.created_at,
            "updated_at": patient.updated_at
        }
        
        # Add educational data based on patient type
        if patient.patient_type == "ct":
            return CTPatientResponse(
                **base_data,
                sex=patient.sex,
                mechanism=patient.mechanism,
                gcs=patient.gcs,
                tbiSeverity=patient.tbiSeverity,
                # Include other educational fields
                vomiting=patient.vomiting,
                seizure=patient.seizure,
                loc=patient.loc,
                amnesia=patient.amnesia,
                headache=patient.headache,
                pupil=patient.pupil
            )
        elif patient.patient_type == "coma":
            return ComaPatientResponse(
                **base_data,
                cause_of_coma=patient.cause_of_coma,
                gcs_total=patient.gcs_total,
                gcs_motor=patient.gcs_motor,
                left_pupil_reactivity=patient.left_pupil_reactivity,
                oxygen_saturation=patient.oxygen_saturation,
                map_pressure=patient.map_pressure,
                heart_rate=patient.heart_rate,
                sedation_level=patient.sedation_level,
                head_midline=patient.head_midline,
                temperature_c=patient.temperature_c
            )
        else:
            return PatientResponse(**base_data)
    
    @staticmethod
    def update_patient_queue(
        db: Session,
        patient_id: int,
        in_queue: bool,
        requesting_user: User
    ) -> Optional[PatientResponse]:
        """Update patient queue status"""
        
        patient = db.query(Patient).filter(
            and_(Patient.id == patient_id, Patient.doctor_id == requesting_user.id)
        ).first()
        
        if not patient:
            return None
        
        patient.in_queue = in_queue
        db.commit()
        db.refresh(patient)
        
        return PatientService.get_patient_by_id(db, patient_id, requesting_user)
    
    @staticmethod
    def _get_all_patients_admin(
        db: Session,
        page: int = 1,
        per_page: int = 20,
        patient_type: Optional[str] = None
    ) -> PatientListResponse:
        """Get all patients for admin users"""
        
        # Build query
        query = db.query(Patient)
        
        # Apply filters
        if patient_type:
            query = query.filter(Patient.patient_type == patient_type)
        
        # Get total count
        total = query.count()
        
        # Apply pagination and ordering
        offset = (page - 1) * per_page
        patients = query.order_by(Patient.created_at.desc()).offset(offset).limit(per_page).all()
        
        # Convert to response models
        patient_responses = []
        for patient in patients:
            if patient.patient_type == "ct":
                patient_response = CTPatientResponse.from_orm(patient)
            elif patient.patient_type == "coma":
                patient_response = ComaPatientResponse.from_orm(patient)
            else:
                patient_response = PatientResponse.from_orm(patient)
            
            patient_responses.append(patient_response)
        
        return PatientListResponse(
            patients=patient_responses,
            total=total,
            page=page,
            per_page=per_page,
            has_next=offset + per_page < total,
            has_prev=page > 1
        )
    
    @staticmethod
    def delete_patient(
        db: Session,
        patient_id: int,
        requesting_user: User
    ) -> bool:
        """Delete a patient"""
        
        patient = db.query(Patient).filter(
            and_(Patient.id == patient_id, Patient.doctor_id == requesting_user.id)
        ).first()
        
        if not patient:
            return False
        
        db.delete(patient)
        db.commit()
        return True
