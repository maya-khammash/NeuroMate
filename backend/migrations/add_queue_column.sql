-- Add in_queue column to patient table
ALTER TABLE patient ADD COLUMN in_queue BOOLEAN DEFAULT TRUE NOT NULL;

-- Create index for better performance on queue queries
CREATE INDEX idx_patient_queue ON patient(in_queue);

-- Create composite index for queue and risk_score sorting
CREATE INDEX idx_patient_queue_risk ON patient(in_queue DESC, risk_score DESC);
