import joblib
import numpy as np
import os
from typing import Dict, Any

# backend/app/services/ai_predictor.py

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "../ai/models/coma/combined_file.joblib"
)

class ComaAIPredictor:
    def __init__(self):
        self.model = None
        self.scaler = None
        self.feature_names = None

        try:
            bundle = joblib.load(MODEL_PATH)

            # 🔑 IMPORTANT: bundle is a dict
            self.model = bundle.get("model")
            self.scaler = bundle.get("scaler")
            self.feature_names = bundle.get("feature_names")

            if self.model is None:
                raise ValueError("Model key not found in joblib file")

            print("✅ Real AI model loaded successfully!")

        except Exception as e:
            print("❌ Failed to load AI model, using mock predictions")
            print("Reason:", e)

    def predict_coma_outcome(self, assessment_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main coma prediction function
        """

        # ===============================
        # REAL AI MODEL
        # ===============================
        if self.model is not None:

            features = np.array([[
                assessment_data.get("gcs_total", 10),
                assessment_data.get("oxygen_saturation", 95),
                assessment_data.get("blood_pressure_systolic", 120),
                assessment_data.get("heart_rate", 80),
                1 if assessment_data.get("left_pupil_reactivity") == "brisk" else 0,
                assessment_data.get("time_in_coma_hours", 24),
                1 if assessment_data.get("seizures_present", False) else 0,
                assessment_data.get("blood_pressure_diastolic", 80),
                assessment_data.get("respiratory_rate", 16),
                assessment_data.get("temperature", 36.5),
                1 if assessment_data.get("ventilation_required", False) else 0,
                assessment_data.get("intracranial_pressure", 15)
            ]])

            # Apply scaler if exists
            if self.scaler is not None:
                features = self.scaler.transform(features)

            prediction = self.model.predict(features)[0]

            return {
                "recovery_probability": round(float(prediction[0]), 3),
                "predicted_gcs_24h": round(float(prediction[1]), 1),
                "predicted_gcs_72h": round(float(prediction[2]), 1),
                "time_to_consciousness_hours": round(float(prediction[3]), 1),
                "mortality_risk": round(float(prediction[4]), 3),
                "stability_score": round(float(prediction[5]), 2),
                "complication_risk": {
                    "cerebral_edema": round(float(prediction[6]), 3),
                    "hemorrhage": round(float(prediction[7]), 3),
                    "ischemia": round(float(prediction[8]), 3),
                    "seizures": round(float(prediction[9]), 3),
                    "infection": round(float(prediction[10]), 3),
                    "hydrocephalus": round(float(prediction[11]), 3),
                },
                "risk_level": (
                    "High" if prediction[4] > 0.6
                    else "Medium" if prediction[4] > 0.3
                    else "Low"
                ),
                "trend_6h": "Stable",
                "trend_24h": "Stable"
            }

        # ===============================
        # MOCK FALLBACK
        # ===============================
        gcs = assessment_data.get("gcs_total", 10)
        stability = (gcs / 15) * 100
        recovery_probability = stability / 100

        return {
            "recovery_probability": round(recovery_probability, 3),
            "predicted_gcs_24h": min(15, gcs + 1),
            "predicted_gcs_72h": min(15, gcs + 2),
            "time_to_consciousness_hours": max(12, 240 * (1 - recovery_probability)),
            "mortality_risk": round(1 - recovery_probability, 3),
            "stability_score": round(stability, 2),
            "complication_risk": {
                "cerebral_edema": 0.3,
                "hemorrhage": 0.2,
                "ischemia": 0.25,
                "seizures": 0.4,
                "infection": 0.15,
                "hydrocephalus": 0.1
            },
            "risk_level": "Medium",
            "trend_6h": "Stable",
            "trend_24h": "Stable"
        }


# 🔥 GLOBAL INSTANCE
ai_predictor = ComaAIPredictor()
