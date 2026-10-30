-- Coma Digital Twin Database Migration
-- Adds tables for coma assessment, timeline tracking, and risk factors

-- 1. Coma Assessments Table
CREATE TABLE coma_assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Glasgow Coma Scale components
    eye_response INT COMMENT '1-4 scale',
    verbal_response INT COMMENT '1-5 scale',
    motor_response INT COMMENT '1-6 scale',
    gcs_total INT COMMENT '3-15 total GCS',
    
    -- Pupil responses
    left_pupil_size FLOAT COMMENT 'Pupil size in mm',
    right_pupil_size FLOAT COMMENT 'Pupil size in mm',
    left_pupil_reactivity VARCHAR(20) COMMENT 'brisk, sluggish, fixed',
    right_pupil_reactivity VARCHAR(20) COMMENT 'brisk, sluggish, fixed',
    
    -- Other vital signs
    heart_rate INT COMMENT 'beats per minute',
    blood_pressure_systolic INT COMMENT 'mmHg',
    blood_pressure_diastolic INT COMMENT 'mmHg',
    oxygen_saturation FLOAT COMMENT 'percentage',
    respiratory_rate INT COMMENT 'breaths per minute',
    temperature FLOAT COMMENT 'Celsius',
    
    -- Neurological signs
    brain_stem_reflexes VARCHAR(10) COMMENT 'present, absent, impaired',
    corneal_reflexes VARCHAR(10) COMMENT 'present, absent, impaired',
    cough_reflex VARCHAR(10) COMMENT 'present, absent, impaired',
    gag_reflex VARCHAR(10) COMMENT 'present, absent, impaired',
    
    -- Complications
    intracranial_pressure FLOAT COMMENT 'mmHg',
    seizures_present BOOLEAN DEFAULT FALSE,
    ventilation_required BOOLEAN DEFAULT FALSE,
    
    -- Medications
    sedatives TEXT COMMENT 'JSON string of medications',
    vasopressors BOOLEAN DEFAULT FALSE,
    
    -- Assessment metadata
    assessor_id INT COMMENT 'ID of assessing doctor',
    notes TEXT,
    
    -- Foreign keys
    FOREIGN KEY (patient_id) REFERENCES patient(id),
    FOREIGN KEY (assessor_id) REFERENCES users(id),
    
    -- Indexes
    INDEX idx_patient_assessment (patient_id),
    INDEX idx_assessment_date (assessment_date)
);

-- 2. Coma Timeline Table
CREATE TABLE coma_timeline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    timeline_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hour_since_injury INT COMMENT 'Hours since initial injury',
    
    -- Consciousness level
    consciousness_level VARCHAR(20) COMMENT 'deep_coma, moderate_coma, mild_coma, vegetative, minimally_conscious, conscious',
    gcs_score INT COMMENT 'Current GCS score',
    
    -- Brain activity indicators
    eeg_activity VARCHAR(20) COMMENT 'burst_suppression, slow, normal, seizure_activity',
    brain_metabolism FLOAT COMMENT 'Percentage of normal brain metabolism',
    cerebral_blood_flow FLOAT COMMENT 'ml/100g/min',
    
    -- Recovery indicators
    recovery_probability FLOAT COMMENT '0-1 probability of recovery',
    time_to_recovery INT COMMENT 'Estimated hours to consciousness',
    recovery_milestone VARCHAR(50) COMMENT 'eye_opening, verbal_response, command_following',
    
    -- Risk factors
    intracranial_hypertension_risk FLOAT COMMENT '0-1 risk level',
    infection_risk FLOAT COMMENT '0-1 risk level',
    seizure_risk FLOAT COMMENT '0-1 risk level',
    mortality_risk FLOAT COMMENT '0-1 risk level',
    
    -- Treatment response
    treatment_response VARCHAR(20) COMMENT 'improving, stable, deteriorating',
    treatment_effectiveness FLOAT COMMENT '0-1 effectiveness score',
    
    -- AI predictions
    predicted_gcs_24h INT COMMENT 'Predicted GCS in 24 hours',
    predicted_gcs_72h INT COMMENT 'Predicted GCS in 72 hours',
    predicted_consciousness_date TIMESTAMP COMMENT 'Predicted date of consciousness',
    confidence_score FLOAT COMMENT 'AI prediction confidence',
    
    -- Foreign keys
    FOREIGN KEY (patient_id) REFERENCES patient(id),
    
    -- Indexes
    INDEX idx_patient_timeline (patient_id),
    INDEX idx_timeline_date (timeline_date),
    INDEX idx_hour_since_injury (hour_since_injury)
);

-- 3. Coma Risk Factors Table
CREATE TABLE coma_risk_factors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    assessment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Primary injury factors
    initial_gcs INT COMMENT 'Initial GCS score',
    injury_mechanism VARCHAR(100) COMMENT 'Mechanism of injury',
    injury_severity VARCHAR(20) COMMENT 'mild, moderate, severe',
    location_of_injury VARCHAR(100) COMMENT 'Location of brain injury',
    
    -- Demographic factors
    age_group VARCHAR(20) COMMENT 'pediatric, adult, elderly',
    comorbidities TEXT COMMENT 'JSON string of medical conditions',
    
    -- Imaging findings
    ct_findings TEXT COMMENT 'JSON string of CT scan results',
    mri_findings TEXT COMMENT 'JSON string of MRI results',
    mri_score FLOAT COMMENT 'MRI injury score',
    
    -- Laboratory values
    hemoglobin FLOAT COMMENT 'g/dL',
    platelets INT COMMENT 'count per microliter',
    glucose FLOAT COMMENT 'mg/dL',
    sodium FLOAT COMMENT 'mmol/L',
    lactate FLOAT COMMENT 'mmol/L',
    
    -- Complications
    cerebral_edema BOOLEAN DEFAULT FALSE,
    hemorrhage BOOLEAN DEFAULT FALSE,
    ischemia BOOLEAN DEFAULT FALSE,
    hydrocephalus BOOLEAN DEFAULT FALSE,
    
    -- Treatment factors
    surgery_required BOOLEAN DEFAULT FALSE,
    icu_stay_duration INT COMMENT 'days in ICU',
    ventilation_duration INT COMMENT 'days on ventilation',
    
    -- Outcome predictions
    predicted_outcome VARCHAR(20) COMMENT 'good_recovery, moderate_disability, severe_disability, vegetative, death',
    glasgow_outcome_scale INT COMMENT 'GOS 1-5',
    functional_independence_score FLOAT COMMENT 'Functional independence measure',
    
    -- Foreign keys
    FOREIGN KEY (patient_id) REFERENCES patient(id),
    
    -- Indexes
    INDEX idx_patient_risk (patient_id),
    INDEX idx_assessment_date (assessment_date),
    INDEX idx_injury_severity (injury_severity)
);

-- 4. Add coma-specific fields to existing patient table
ALTER TABLE patient 
ADD COLUMN coma_onset_date TIMESTAMP NULL COMMENT 'Date/time coma onset',
ADD COLUMN coma_duration INT NULL COMMENT 'Duration in hours',
ADD COLUMN coma_severity VARCHAR(20) NULL COMMENT 'mild, moderate, severe',
ADD COLUMN current_consciousness_level VARCHAR(20) NULL COMMENT 'Current consciousness state',
ADD COLUMN coma_complications TEXT NULL COMMENT 'JSON string of complications',
ADD COLUMN ventilation_status VARCHAR(20) NULL COMMENT 'ventilation status',
ADD COLUMN icp_monitoring BOOLEAN DEFAULT FALSE COMMENT 'Intracranial pressure monitoring';

-- 5. Create views for common queries
CREATE VIEW coma_patient_summary AS
SELECT 
    p.id,
    p.name,
    p.age,
    p.sex,
    p.coma_severity,
    p.coma_onset_date,
    p.coma_duration,
    p.current_consciousness_level,
    ca.gcs_total as latest_gcs,
    ca.assessment_date as latest_assessment,
    ct.recovery_probability,
    ct.predicted_consciousness_date,
    ct.mortality_risk
FROM patient p
LEFT JOIN coma_assessments ca ON p.id = ca.patient_id
LEFT JOIN coma_timeline ct ON p.id = ct.patient_id
WHERE p.coma_onset_date IS NOT NULL
ORDER BY p.coma_onset_date DESC;

-- 6. Insert sample data for testing
INSERT INTO coma_assessments (
    patient_id, eye_response, verbal_response, motor_response, gcs_total,
    left_pupil_size, right_pupil_size, left_pupil_reactivity, right_pupil_reactivity,
    heart_rate, blood_pressure_systolic, blood_pressure_diastolic, oxygen_saturation,
    brain_stem_reflexes, seizures_present, ventilation_required, notes
) VALUES 
(1, 1, 1, 2, 4, 4.0, 4.0, 'sluggish', 'sluggish', 85, 140, 90, 94.0, 'impaired', FALSE, TRUE, 'Initial coma assessment'),
(2, 2, 1, 3, 6, 3.5, 3.5, 'brisk', 'brisk', 92, 125, 80, 96.0, 'present', FALSE, TRUE, 'Moderate coma assessment');

INSERT INTO coma_timeline (
    patient_id, hour_since_injury, consciousness_level, gcs_score,
    recovery_probability, time_to_recovery, intracranial_hypertension_risk,
    mortality_risk, treatment_response, predicted_gcs_24h, confidence_score
) VALUES 
(1, 2, 'deep_coma', 4, 0.3, 168, 0.7, 0.4, 'stable', 5, 0.85),
(1, 6, 'deep_coma', 4, 0.35, 144, 0.65, 0.35, 'improving', 6, 0.87),
(2, 4, 'moderate_coma', 6, 0.6, 72, 0.4, 0.2, 'improving', 8, 0.92);

-- 7. Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON coma_assessments TO neuromate_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON coma_timeline TO neuromate_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON coma_risk_factors TO neuromate_user;

-- Migration complete
SELECT 'Coma Digital Twin database migration completed successfully!' as status;
