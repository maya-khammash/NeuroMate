"""
TBI CT Prediction Inference Module
Loads trained XGBoost model and performs predictions
"""

import os
import numpy as np
import joblib
import math
from typing import Optional

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "models")

# Global model cache
_model = None
_scaler_minmax = None
_scaler_std = None
_feature_stats = None
_model_loaded = False

# Feature names expected by the model (from notebook training)
EXPECTED_FEATURES = [
    'age',
    'time_since_injury_hours',
    'gcs_total',
    'vomiting_count',
    'loc_duration_min',
    'amnesia_duration_min',
    'headache_severity_1_10',
    'gender_Male',
    'mechanism_of_injury_Fall',
    'mechanism_of_injury_Motor Vehicle Accident',
    'seizure_type_Generalized',
    'pupillary_reaction_Unequal'
]

# Scaling parameters from training (loaded from feature_stats.pkl)
# MinMax: ['age', 'gcs_total', 'vomiting_count', 'headache_severity_1_10', 'time_since_injury_hours']
MINMAX_MIN = [18.0, 3.0, 0.0, 1.0, 0.5]
MINMAX_MAX = [89.0, 15.0, 6.0, 10.0, 22.1]
# StandardScaler: ['loc_duration_min', 'amnesia_duration_min']
STD_MEAN = [30.68005, 130.4613]
STD_SCALE = [47.36516, 212.30507625]


def load_model():
    """Load the trained CT prediction model and scalers"""
    global _model, _scaler_minmax, _scaler_std, _feature_stats, _model_loaded
    
    if _model_loaded:
        return True
    
    try:
        # Load the CT prediction model
        model_path = os.path.join(MODEL_DIR, "xgb_ct_model.pkl")
        
        if not os.path.exists(model_path):
            print(f"CT Model not found at {model_path}")
            return False
        
        _model = joblib.load(model_path)
        
        # Load scalers if available
        scaler_minmax_path = os.path.join(MODEL_DIR, "scaler_minmax.pkl")
        scaler_std_path = os.path.join(MODEL_DIR, "scaler_std.pkl")
        feature_stats_path = os.path.join(MODEL_DIR, "feature_stats.pkl")
        
        if os.path.exists(scaler_minmax_path):
            _scaler_minmax = joblib.load(scaler_minmax_path)
        if os.path.exists(scaler_std_path):
            _scaler_std = joblib.load(scaler_std_path)
        if os.path.exists(feature_stats_path):
            _feature_stats = joblib.load(feature_stats_path)
        
        _model_loaded = True
        print(f"CT Model loaded successfully from {model_path}!")
        return True
    except Exception as e:
        print(f"Error loading model: {e}")
        import traceback
        print(traceback.format_exc())
        return False


def preprocess_patient_data(patient_data: dict) -> Optional[np.ndarray]:
    """
    Preprocess patient data for model prediction using actual training scalers
    
    Args:
        patient_data: Dictionary with patient information
        
    Returns:
        Numpy array ready for model prediction
    """
    if not _model_loaded:
        if not load_model():
            return None
    
    features = {}
    
    # MinMax scaled features: ['age', 'gcs_total', 'vomiting_count', 'headache_severity_1_10', 'time_since_injury_hours']
    # Formula: (x - min) / (max - min)
    
    age = float(patient_data.get('age', 30))
    features['age'] = (age - MINMAX_MIN[0]) / (MINMAX_MAX[0] - MINMAX_MIN[0])
    
    gcs = float(patient_data.get('gcs', 15))
    features['gcs_total'] = (gcs - MINMAX_MIN[1]) / (MINMAX_MAX[1] - MINMAX_MIN[1])
    
    vomiting = float(patient_data.get('vomiting', 0))
    features['vomiting_count'] = (vomiting - MINMAX_MIN[2]) / (MINMAX_MAX[2] - MINMAX_MIN[2])
    
    headache = float(patient_data.get('headache', 1))
    features['headache_severity_1_10'] = (headache - MINMAX_MIN[3]) / (MINMAX_MAX[3] - MINMAX_MIN[3])
    
    time_since_injury = float(patient_data.get('timeSinceInjury', 0))
    features['time_since_injury_hours'] = (time_since_injury - MINMAX_MIN[4]) / (MINMAX_MAX[4] - MINMAX_MIN[4])
    
    # StandardScaler features: ['loc_duration_min', 'amnesia_duration_min']
    # Formula: (x - mean) / std
    
    loc = float(patient_data.get('loc', 0))
    features['loc_duration_min'] = (loc - STD_MEAN[0]) / STD_SCALE[0]
    
    amnesia = float(patient_data.get('amnesia', 0))
    features['amnesia_duration_min'] = (amnesia - STD_MEAN[1]) / STD_SCALE[1]
    
    # Boolean/One-hot encoded features (no scaling needed)
    sex = patient_data.get('sex', 'Male')
    features['gender_Male'] = 1.0 if str(sex).lower() == 'male' else 0.0
    
    mechanism = str(patient_data.get('mechanism', '')).lower()
    features['mechanism_of_injury_Fall'] = 1.0 if 'fall' in mechanism else 0.0
    features['mechanism_of_injury_Motor Vehicle Accident'] = 1.0 if any(x in mechanism for x in ['motor', 'vehicle', 'accident', 'mva', 'car']) else 0.0
    
    seizure = str(patient_data.get('seizure', 'None')).lower()
    features['seizure_type_Generalized'] = 1.0 if seizure == 'generalized' else 0.0
    
    pupil = str(patient_data.get('pupil', 'Normal')).lower()
    features['pupillary_reaction_Unequal'] = 1.0 if pupil == 'unequal' else 0.0
    
    # Build feature array in correct order
    feature_array = []
    for fname in EXPECTED_FEATURES:
        feature_array.append(features.get(fname, 0.0))
    
    return np.array([feature_array])


def predict_risk(patient_data: dict) -> dict:
    """
    Predict CT risk for a patient
    
    Args:
        patient_data: Dictionary with patient information
        
    Returns:
        Dictionary with risk_score, risk_level, needs_ct_within_24h, and confidence
    """
    # Try to use the trained model
    if load_model():
        try:
            # Preprocess data
            X = preprocess_patient_data(patient_data)
            print(f"DEBUG: Preprocessed X = {X}")  # Debug line
            print(f"DEBUG: Patient data = {patient_data}")  # Debug line
            
            if X is not None:
                # Get prediction probability
                proba = _model.predict_proba(X)[0]
                risk_score = float(proba[1])  # Probability of needing CT
                print(f"DEBUG: Model probability = {proba}, risk_score = {risk_score}")  # Debug line
                
                # Determine risk level
                if risk_score >= 0.7:
                    risk_level = "High"
                elif risk_score >= 0.4:
                    risk_level = "Moderate"
                else:
                    risk_level = "Low"
                
                # Use custom threshold (0.3 from notebook for better recall)
                needs_ct = risk_score >= 0.3
                
                return {
                    "risk_score": round(float(risk_score * 100), 1),  # Use actual AI prediction
                    "risk_level": risk_level,
                    "needs_ct_within_24h": bool(needs_ct),
                    "confidence": round(float(max(proba) * 100), 1),
                    "model_type": "XGBoost"
                }
        except Exception as e:
            print(f"Prediction error: {e}")
    
    # Fallback to rule-based prediction if model not available
    return _fallback_predict(patient_data)


def _fallback_predict(patient_data: dict) -> dict:
    """
    Fallback rule-based prediction when model is not available
    """
    score = 0
    
    # GCS scoring
    gcs = patient_data.get('gcs', 15)
    if gcs <= 8:
        score += 35
    elif gcs <= 12:
        score += 15  # Reduced from 25
    else:
        score += 0   # Reduced from 10
    
    # TBI Severity
    severity = patient_data.get('tbiSeverity', 'Mild')
    if severity == "Severe":
        score += 30
    elif severity == "Moderate":
        score += 10  # Reduced from 20
    else:
        score += 5   # Reduced from 10
    
    # Loss of consciousness
    loc = patient_data.get('loc', 0)
    if loc > 30:
        score += 15
    elif loc > 5:
        score += 10
    
    # Vomiting
    vomiting = patient_data.get('vomiting', 0)
    if vomiting >= 2:
        score += 10
    
    # Seizure
    seizure = patient_data.get('seizure', 'None')
    if seizure and seizure.lower() != 'none':
        score += 15
    
    # Pupil response
    pupil = patient_data.get('pupil', 'Normal')
    if pupil and pupil.lower() in ['unequal', 'fixed', 'sluggish']:
        score += 10
    
    # Cap score
    score = min(score, 100)
    
    # Risk level
    if score >= 70:
        level = "High"
    elif score >= 40:
        level = "Moderate"
    else:
        level = "Low"
    
    return {
        "risk_score": int(score),
        "risk_level": level,
        "needs_ct_within_24h": bool(score >= 50),
        "confidence": 70.0,  # Lower confidence for rule-based
        "model_type": "Rule-based"
    }


def simulate_risk_over_time(base_risk, features, hours=(0,6,12,24)):
    """
    Rule-based Digital Twin simulation using ONLY the 13 selected features.
    base_risk: model prediction at time 0 (as decimal 0-1, not percentage)
    features: dict containing the 13 selected features (same names)
    """
    risk0 = float(base_risk)

    # ---- weights (simple, explainable) ----
    w = 0.0

    w += 0.005 * float(features.get('tbi_severity', 0))  # Reduced from 0.010

    gcs = float(features.get('gcs_total', 15))
    if gcs < 13:
        w += 0.015  # Reduced from 0.030
    elif gcs < 15:
        w += 0.008  # Reduced from 0.015

    if int(features.get('pupillary_reaction_Unequal', 0)) == 1:
        w += 0.020  # Reduced from 0.040

    vom = float(features.get('vomiting_count', 0))
    if vom >= 2:
        w += 0.010  # Reduced from 0.020
    elif vom == 1:
        w += 0.005  # Reduced from 0.010

    if int(features.get('seizure_type_Generalized', 0)) == 1:
        w += 0.015  # Reduced from 0.030

    t = float(features.get('time_since_injury_hours', 24))
    if t <= 3:
        w += 0.010  # Reduced from 0.020
    elif t <= 6:
        w += 0.005  # Reduced from 0.010

    if float(features.get('loc_duration_min', 0)) > 5:
        w += 0.004  # Reduced from 0.008
    if float(features.get('amnesia_duration_min', 0)) > 10:
        w += 0.003  # Reduced from 0.006
    if float(features.get('headache_severity_1_10', 0)) >= 7:
        w += 0.003  # Reduced from 0.006

    if float(features.get('age', 0)) >= 65:
        w += 0.004  # Reduced from 0.008

    # Cap the total weight to prevent excessive risk increase
    w = min(w, 0.15)  # Maximum 15% increase from base risk

    timeline = {}
    for h in hours:
        # More realistic risk progression with non-linear patterns
        hours_ratio = h / 24.0
        
        # Add non-linear components for more realistic medical progression
        # Early hours (0-6h): Risk may increase rapidly
        # Middle hours (6-18h): Risk stabilizes or slowly changes  
        # Late hours (18-24h): Risk may increase again due to complications
        
        if h <= 6:
            # Early phase: exponential-like increase (reduced)
            time_factor = 1.0 + 0.4 * (hours_ratio ** 1.5)  # Reduced from 0.8
        elif h <= 18:
            # Middle phase: logarithmic stabilization (reduced)
            time_factor = 1.0 + 0.2 * hours_ratio + 0.1 * math.log(1 + hours_ratio)  # Reduced
        else:
            # Late phase: secondary increase due to complications (reduced)
            time_factor = 1.0 + 0.3 * hours_ratio + 0.15 * math.sin(hours_ratio * math.pi)  # Reduced
        
        # Add some randomness/variation to make it more realistic (reduced)
        variation = 0.02 * math.sin(h * 0.5) * math.cos(h * 0.3)  # Reduced from 0.05
        
        # Calculate risk with proper bounds checking
        risk_t = risk0 + (w * time_factor * 0.5) + variation  # Reduced weight impact
        risk_t = max(0.0, min(1.0, risk_t))  # Ensure bounds
        timeline[f"{h}h"] = float(round(risk_t, 4))

    return timeline


def predict_risk_with_timeline(patient_data: dict) -> dict:
    """
    Predict CT risk for a patient with digital twin timeline simulation
    
    Args:
        patient_data: Dictionary with patient information
        
    Returns:
        Dictionary with risk_score, risk_level, needs_ct_within_24h, confidence, and timeline
    """
    # Get base prediction first
    base_prediction = predict_risk(patient_data)
    
    # Convert risk score back to decimal for timeline calculation
    base_risk_decimal = base_prediction["risk_score"] / 100.0
    
    # Extract the 13 selected features for digital twin simulation
    features = {}
    
    # Map from patient_data to the 13 features used in digital twin
    features['tbi_severity'] = 0.0  # Default, will need mapping from tbiSeverity
    if patient_data.get('tbiSeverity', '').lower() == 'severe':
        features['tbi_severity'] = 2.0
    elif patient_data.get('tbiSeverity', '').lower() == 'moderate':
        features['tbi_severity'] = 1.0
    
    features['gcs_total'] = patient_data.get('gcs', 15)
    features['pupillary_reaction_Unequal'] = 1.0 if patient_data.get('pupil', '').lower() == 'unequal' else 0.0
    features['vomiting_count'] = patient_data.get('vomiting', 0)
    features['seizure_type_Generalized'] = 1.0 if patient_data.get('seizure', '').lower() == 'generalized' else 0.0
    features['time_since_injury_hours'] = patient_data.get('timeSinceInjury', 0)
    features['loc_duration_min'] = patient_data.get('loc', 0)
    features['amnesia_duration_min'] = patient_data.get('amnesia', 0)
    features['headache_severity_1_10'] = patient_data.get('headache', 1)
    features['age'] = patient_data.get('age', 30)
    
    # Generate timeline using digital twin simulation
    timeline = simulate_risk_over_time(base_risk_decimal, features)
    
    # Convert timeline to percentages for frontend
    timeline_percentage = {k: float(v * 100) for k, v in timeline.items()}
    
    # Add timeline to base prediction
    base_prediction["timeline"] = timeline_percentage
    base_prediction["digital_twin_enabled"] = True
    
    return base_prediction


# Try to load model on module import
load_model()
