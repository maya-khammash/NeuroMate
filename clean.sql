-- MySQL dump 10.13  Distrib 8.0.44, for Win64 (x86_64)
--
-- Host: localhost    Database: app
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `coma_assessments`
--

DROP TABLE IF EXISTS `coma_assessments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coma_assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `assessment_date` datetime DEFAULT NULL,
  `eye_response` int DEFAULT NULL,
  `verbal_response` int DEFAULT NULL,
  `motor_response` int DEFAULT NULL,
  `gcs_total` int DEFAULT NULL,
  `left_pupil_size` float DEFAULT NULL,
  `right_pupil_size` float DEFAULT NULL,
  `left_pupil_reactivity` varchar(20) DEFAULT NULL,
  `right_pupil_reactivity` varchar(20) DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `blood_pressure_systolic` int DEFAULT NULL,
  `blood_pressure_diastolic` int DEFAULT NULL,
  `oxygen_saturation` float DEFAULT NULL,
  `respiratory_rate` int DEFAULT NULL,
  `temperature` float DEFAULT NULL,
  `brain_stem_reflexes` varchar(10) DEFAULT NULL,
  `corneal_reflexes` varchar(10) DEFAULT NULL,
  `cough_reflex` varchar(10) DEFAULT NULL,
  `gag_reflex` varchar(10) DEFAULT NULL,
  `intracranial_pressure` float DEFAULT NULL,
  `seizures_present` tinyint(1) DEFAULT NULL,
  `ventilation_required` tinyint(1) DEFAULT NULL,
  `sedatives` text,
  `vasopressors` tinyint(1) DEFAULT NULL,
  `assessor_id` int DEFAULT NULL,
  `notes` text,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `assessor_id` (`assessor_id`),
  KEY `ix_coma_assessments_id` (`id`),
  CONSTRAINT `coma_assessments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`),
  CONSTRAINT `coma_assessments_ibfk_2` FOREIGN KEY (`assessor_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coma_assessments`
--

LOCK TABLES `coma_assessments` WRITE;
/*!40000 ALTER TABLE `coma_assessments` DISABLE KEYS */;
/*!40000 ALTER TABLE `coma_assessments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coma_risk_factors`
--

DROP TABLE IF EXISTS `coma_risk_factors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coma_risk_factors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `assessment_date` datetime DEFAULT NULL,
  `initial_gcs` int DEFAULT NULL,
  `injury_mechanism` varchar(100) DEFAULT NULL,
  `injury_severity` varchar(20) DEFAULT NULL,
  `location_of_injury` varchar(100) DEFAULT NULL,
  `age_group` varchar(20) DEFAULT NULL,
  `comorbidities` text,
  `ct_findings` text,
  `mri_findings` text,
  `mri_score` float DEFAULT NULL,
  `hemoglobin` float DEFAULT NULL,
  `platelets` int DEFAULT NULL,
  `glucose` float DEFAULT NULL,
  `sodium` float DEFAULT NULL,
  `lactate` float DEFAULT NULL,
  `cerebral_edema` tinyint(1) DEFAULT NULL,
  `hemorrhage` tinyint(1) DEFAULT NULL,
  `ischemia` tinyint(1) DEFAULT NULL,
  `hydrocephalus` tinyint(1) DEFAULT NULL,
  `surgery_required` tinyint(1) DEFAULT NULL,
  `icu_stay_duration` int DEFAULT NULL,
  `ventilation_duration` int DEFAULT NULL,
  `predicted_outcome` varchar(20) DEFAULT NULL,
  `glasgow_outcome_scale` int DEFAULT NULL,
  `functional_independence_score` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `ix_coma_risk_factors_id` (`id`),
  CONSTRAINT `coma_risk_factors_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coma_risk_factors`
--

LOCK TABLES `coma_risk_factors` WRITE;
/*!40000 ALTER TABLE `coma_risk_factors` DISABLE KEYS */;
/*!40000 ALTER TABLE `coma_risk_factors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `coma_timeline`
--

DROP TABLE IF EXISTS `coma_timeline`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `coma_timeline` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int DEFAULT NULL,
  `timeline_date` datetime DEFAULT NULL,
  `hour_since_injury` int DEFAULT NULL,
  `consciousness_level` varchar(20) DEFAULT NULL,
  `gcs_score` int DEFAULT NULL,
  `eeg_activity` varchar(20) DEFAULT NULL,
  `brain_metabolism` float DEFAULT NULL,
  `cerebral_blood_flow` float DEFAULT NULL,
  `recovery_probability` float DEFAULT NULL,
  `time_to_recovery` int DEFAULT NULL,
  `recovery_milestone` varchar(50) DEFAULT NULL,
  `intracranial_hypertension_risk` float DEFAULT NULL,
  `infection_risk` float DEFAULT NULL,
  `seizure_risk` float DEFAULT NULL,
  `mortality_risk` float DEFAULT NULL,
  `treatment_response` varchar(20) DEFAULT NULL,
  `treatment_effectiveness` float DEFAULT NULL,
  `predicted_gcs_24h` int DEFAULT NULL,
  `predicted_gcs_72h` int DEFAULT NULL,
  `predicted_consciousness_date` datetime DEFAULT NULL,
  `confidence_score` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `ix_coma_timeline_id` (`id`),
  CONSTRAINT `coma_timeline_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `coma_timeline`
--

LOCK TABLES `coma_timeline` WRITE;
/*!40000 ALTER TABLE `coma_timeline` DISABLE KEYS */;
/*!40000 ALTER TABLE `coma_timeline` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `patient`
--

DROP TABLE IF EXISTS `patient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `patient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `age` int NOT NULL,
  `sex` varchar(10) DEFAULT NULL,
  `mechanism` varchar(255) DEFAULT NULL,
  `history` text,
  `timeSinceInjury` int DEFAULT NULL,
  `gcs` int DEFAULT NULL,
  `tbiSeverity` varchar(50) DEFAULT NULL,
  `vomiting` int DEFAULT NULL,
  `seizure` varchar(50) DEFAULT NULL,
  `loc` int DEFAULT NULL,
  `amnesia` int DEFAULT NULL,
  `headache` int DEFAULT NULL,
  `pupil` varchar(50) DEFAULT NULL,
  `risk_score` float DEFAULT NULL,
  `risk_level` varchar(20) DEFAULT NULL,
  `needs_ct` tinyint(1) DEFAULT NULL,
  `confidence` float DEFAULT NULL,
  `model_type` varchar(50) DEFAULT NULL,
  `prediction_date` datetime DEFAULT NULL,
  `in_queue` tinyint(1) NOT NULL DEFAULT '1',
  `patient_type` varchar(20) NOT NULL DEFAULT 'ct',
  `cause_of_coma` varchar(50) DEFAULT NULL,
  `gcs_total` int DEFAULT NULL,
  `gcs_motor` int DEFAULT NULL,
  `left_pupil_reactivity` varchar(20) DEFAULT NULL,
  `oxygen_saturation` float DEFAULT NULL,
  `map_pressure` float DEFAULT NULL,
  `heart_rate` int DEFAULT NULL,
  `sedation_level` int DEFAULT NULL,
  `head_midline` tinyint(1) DEFAULT NULL,
  `temperature_c` float DEFAULT NULL,
  `conscious_state` varchar(50) DEFAULT NULL,
  `conscious_state_confidence` float DEFAULT NULL,
  `deterioration_risk` float DEFAULT NULL,
  `deterioration_level` varchar(20) DEFAULT NULL,
  `stability_score` float DEFAULT NULL,
  `stability_level` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_patient_user` (`user_id`),
  CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `patient`
--

LOCK TABLES `patient` WRITE;
/*!40000 ALTER TABLE `patient` DISABLE KEYS */;
INSERT INTO `patient` VALUES (2,1,'ZAIN ALFITYANI',33,'Female','string','non',4,4,'string',2,'string',22,22,3,'none',NULL,NULL,NULL,NULL,NULL,NULL,1,'ct',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,1,'omar',26,'Male','string','non',4,4,'Moderate',8,'string',22,22,3,'Normal',NULL,NULL,NULL,NULL,NULL,NULL,1,'ct',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(4,1,'mohannad',25,'Male','Fall from bicycle','Asthma',3,14,'',1,'None',2,10,6,'Fixed',99.9,'High',1,99.9,'XGBoost','2026-01-02 16:24:55',1,'ct',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,1,'Yazan',23,'Male','Motor Vechicle acceident','Hypertension',2,12,'Moderate',3,'Generalized',8,30,8,'Unequal',100,'High',1,100,'XGBoost','2026-01-02 17:05:39',1,'ct',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,1,'zain',21,'Female','Fall from bicycle','Asthma',7,10,'Moderate',7,'None',60,10,8,'Sluggish',99.6,'High',1,99.6,'XGBoost','2026-01-13 16:53:31',1,'ct',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,1,'ahmad hassan',24,'Male','Slip and fall from standing height','No known medical conditions, no medications',3,15,'Mild',0,'None',0,0,2,'Fixed',22.1,'Low',0,77.9,'XGBoost','2026-01-13 17:37:37',1,'ct',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,1,'fatima ali',67,'Female','Motor vehicle accident','Hypertension, on aspirin',1,12,'Moderate',3,'Generalized',5,20,8,'Unequal',99.8,'High',1,99.8,'XGBoost','2026-01-13 17:38:57',1,'ct',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(12,1,'omar khaled',45,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'XGBoost (Coma Models)','2026-01-13 17:58:22',1,'coma','Metabolic',11,5,'Brisk',98,88,90,1,1,36.7,'Semi-conscious',99.9,26.5,'Low',77,'Stable'),(13,1,'layla mahmoud',72,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'XGBoost (Coma Models)','2026-01-13 17:59:53',1,'coma','Stroke',5,2,'None',91,118,50,0,0,38.4,'Coma',100,36.2,'Low',71.6,'Stable');
/*!40000 ALTER TABLE `patient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('student','doctor','admin') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'doctor1','$2b$12$gdFFTwolXFHux/mpyJCiD.7.VMhnLiw5bvQhp0yqjQblBxgHS9uty','doctor'),(2,'student1','$2b$12$YAd2EfOhEsC2vxHWC29SoutYbNbmAtwCHWwbWY.64GPcjaP6XG0o.','student'),(3,'admin1','$2b$12$mHcJ6YI/Hmn8Rqa2rXHazOQ.rzUUdVfHz3clUdmYDh5aVMZBVuOG.','admin'),(4,'doctor2','$2b$12$MKMGhaXepsaFO9Q4xKtUw.mg.zCdU4.DSECZnL8fqpgW1Uqovg81G','doctor');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-13 21:11:47
