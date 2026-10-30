from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Float, Boolean, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(255), unique=True, nullable=False)
    password = Column(String(255), nullable=False)
    role = Column(Enum("admin", "doctor", "student"), nullable=False)
    patients = relationship("Patient", back_populates="doctor")


class Patient(Base):
    __tablename__ = "patient"

    # Database fields
    id = Column(Integer, primary_key=True, index=True)
    doctor_id = Column(Integer, ForeignKey("users.id"))
    patient_type = Column(String(20), default="ct", nullable=False)  # 'ct' or 'coma'
    
    # CT Patient fields
    name = Column(String(255), nullable=True)
    age = Column(Integer, nullable=True)
    sex = Column(String(10), nullable=True)
    mechanism = Column(String(255), nullable=True)
    gcs = Column(Integer, nullable=True)
    tbiSeverity = Column(String(50), nullable=True)
    
    # Prediction results
    risk_score = Column(Float, nullable=True)
    risk_level = Column(String(20), nullable=True)
    in_queue = Column(Boolean, default=True, nullable=True)
    
    doctor = relationship("User", back_populates="patients")


class ComaAssessment(Base):
    __tablename__ = "coma_assessments"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.id"))
    assessment_date = Column(DateTime, default=datetime.utcnow)
    
    # Glasgow Coma Scale components
    eye_response = Column(Integer)  # 1-4
    verbal_response = Column(Integer)  # 1-5
    motor_response = Column(Integer)  # 1-6
    gcs_total = Column(Integer)  # 3-15
    
    # Pupil responses
    left_pupil_size = Column(Float)  # mm
    right_pupil_size = Column(Float)  # mm
    left_pupil_reactivity = Column(String(20))  # brisk, sluggish, fixed
    right_pupil_reactivity = Column(String(20))
    
    # Other vital signs
    heart_rate = Column(Integer)
    blood_pressure_systolic = Column(Integer)
    blood_pressure_diastolic = Column(Integer)
    oxygen_saturation = Column(Float)
    respiratory_rate = Column(Integer)
    temperature = Column(Float)
    
    # Neurological signs
    brain_stem_reflexes = Column(String(10))  # present, absent, impaired
    corneal_reflexes = Column(String(10))
    cough_reflex = Column(String(10))
    gag_reflex = Column(String(10))
    
    # Complications
    intracranial_pressure = Column(Float)  # mmHg
    seizures_present = Column(Boolean, default=False)
    ventilation_required = Column(Boolean, default=False)
    
    # Medications
    sedatives = Column(Text)  # JSON string of medications
    vasopressors = Column(Boolean, default=False)
    
    # Assessment metadata
    assessor_id = Column(Integer, ForeignKey("users.id"))
    notes = Column(Text)
    
    # Relationships
    patient = relationship("Patient")
    assessor = relationship("User")


class ComaTimeline(Base):
    __tablename__ = "coma_timeline"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.id"))
    timeline_date = Column(DateTime, default=datetime.utcnow)
    hour_since_injury = Column(Integer)  # Hours since initial injury
    
    # Consciousness level
    consciousness_level = Column(String(20))  # deep_coma, moderate_coma, mild_coma, vegetative, minimally_conscious, conscious
    gcs_score = Column(Integer)
    
    # Brain activity indicators
    eeg_activity = Column(String(20))  # burst_suppression, slow, normal, seizure_activity
    brain_metabolism = Column(Float)  # Percentage of normal
    cerebral_blood_flow = Column(Float)  # ml/100g/min
    
    # Recovery indicators
    recovery_probability = Column(Float)  # 0-1
    time_to_recovery = Column(Integer)  # Estimated hours to consciousness
    recovery_milestone = Column(String(50))  # eye_opening, verbal_response, command_following
    
    # Risk factors
    intracranial_hypertension_risk = Column(Float)  # 0-1
    infection_risk = Column(Float)  # 0-1
    seizure_risk = Column(Float)  # 0-1
    mortality_risk = Column(Float)  # 0-1
    
    # Treatment response
    treatment_response = Column(String(20))  # improving, stable, deteriorating
    treatment_effectiveness = Column(Float)  # 0-1
    
    # AI predictions
    predicted_gcs_24h = Column(Integer)
    predicted_gcs_72h = Column(Integer)
    predicted_consciousness_date = Column(DateTime)
    confidence_score = Column(Float)
    
    # Relationships
    patient = relationship("Patient")


class ComaRiskFactor(Base):
    __tablename__ = "coma_risk_factors"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patient.id"))
    assessment_date = Column(DateTime, default=datetime.utcnow)
    
    # Primary injury factors
    initial_gcs = Column(Integer)
    injury_mechanism = Column(String(100))
    injury_severity = Column(String(20))  # mild, moderate, severe
    location_of_injury = Column(String(100))
    
    # Demographic factors
    age_group = Column(String(20))  # pediatric, adult, elderly
    comorbidities = Column(Text)  # JSON string of medical conditions
    
    # Imaging findings
    ct_findings = Column(Text)  # JSON string of CT scan results
    mri_findings = Column(Text)  # JSON string of MRI results
    mri_score = Column(Float)  # MRI injury score
    
    # Laboratory values
    hemoglobin = Column(Float)
    platelets = Column(Integer)
    glucose = Column(Float)
    sodium = Column(Float)
    lactate = Column(Float)
    
    # Complications
    cerebral_edema = Column(Boolean, default=False)
    hemorrhage = Column(Boolean, default=False)
    ischemia = Column(Boolean, default=False)
    hydrocephalus = Column(Boolean, default=False)
    
    # Treatment factors
    surgery_required = Column(Boolean, default=False)
    icu_stay_duration = Column(Integer)  # days
    ventilation_duration = Column(Integer)  # days
    
    # Outcome predictions
    predicted_outcome = Column(String(20))  # good_recovery, moderate_disability, severe_disability, vegetative, death
    glasgow_outcome_scale = Column(Integer)  # 1-5
    functional_independence_score = Column(Float)
    
    # Relationships
    patient = relationship("Patient")