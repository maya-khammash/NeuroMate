-- Migration: Add prediction columns to patient table
-- Run this SQL to add AI prediction fields to your existing database

ALTER TABLE `patient` 
ADD COLUMN `risk_score` FLOAT NULL DEFAULT NULL,
ADD COLUMN `risk_level` VARCHAR(20) NULL DEFAULT NULL,
ADD COLUMN `needs_ct` TINYINT(1) NULL DEFAULT NULL,
ADD COLUMN `confidence` FLOAT NULL DEFAULT NULL,
ADD COLUMN `model_type` VARCHAR(50) NULL DEFAULT NULL,
ADD COLUMN `prediction_date` DATETIME NULL DEFAULT NULL;

-- Verify the columns were added
DESCRIBE `patient`;
