"""
Coma Prediction Inference Module
Loads trained models from model_artifact.pkl and performs coma predictions
- Conscious State (condition over time)
- Deterioration Risk
- Stability Score
"""

import os
import numpy as np
import joblib
from typing import Optional, Dict, Any

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "models")

# Global model cache
_coma_models = None
_label_encoder = None
_coma_models_loaded = False

# Feature names expected by the coma models
COMA_FEATURES = [
    'age',
    'cause_of_coma_Metabolic',
    'cause_of_coma_Stroke',
    'cause_of_coma_TBI',
    'gcs_total',
    'gcs_motor',
    'left_pupil_reactivity',
    'oxygen_saturation',
    'map',
    'heart_rate',
    'sedation_level_0_10',
    'head_midline',
    'temperature_c'
]


def load_coma_models():
    """Load the trained coma models from model_artifact.pkl"""
    global _coma_models, _label_encoder, _coma_models_loaded
    
    if _coma_models_loaded:
        return True
    
    try:
        model_path = os.path.join(MODEL_DIR, "model_artifact.pkl")
        
        if not os.path.exists(model_path):
            print(f"Coma model artifact not found at {model_path}")
            return False
        
        artifact = joblib.load(model_path)
        
        if not isinstance(artifact, dict) or 'models' not in artifact:
            print("Invalid model artifact structure")
            return False
        
        _coma_models = artifact['models']
        _label_encoder = artifact.get('label_encoder')
        _coma_models_loaded = True
        
        print(f"Coma models loaded successfully!")
        print(f"Available models: {list(_coma_models.keys())}")
        return True
    except Exception as e:
        print(f"Error loading coma models: {e}")
        import traceback
        print(traceback.format_exc())
        return False


def preprocess_coma_data(patient_data: dict) -> Optional[np.ndarray]:
    """
    Preprocess patient data for coma model prediction
    
    Args:
        patient_data: Dictionary with coma patient information
        
    Returns:
        Numpy array ready for model prediction
    """
    if not _coma_models_loaded:
        if not load_coma_models():
            return None
    
    features = []
    
    # Age (numeric)
    features.append(float(patient_data.get('age', 50)))
    
    # Cause of coma one-hot encoding
    cause = str(patient_data.get('cause_of_coma', '')).lower()
    features.append(1.0 if 'metabolic' in cause else 0.0)  # cause_of_coma_Metabolic
    features.append(1.0 if 'stroke' in cause else 0.0)     # cause_of_coma_Stroke
    features.append(1.0 if 'tbi' in cause or 'trauma' in cause else 0.0)  # cause_of_coma_TBI
    
    # GCS scores
    features.append(float(patient_data.get('gcs_total', 8)))
    features.append(float(patient_data.get('gcs_motor', 4)))
    
    # Pupil reactivity (encoded as numeric: 0=None, 1=Sluggish, 2=Brisk)
    pupil = str(patient_data.get('left_pupil_reactivity', 'sluggish')).lower()
    if pupil == 'brisk' or pupil == '2':
        features.append(2.0)
    elif pupil == 'sluggish' or pupil == '1':
        features.append(1.0)
    else:
        features.append(0.0)
    
    # Vital signs
    features.append(float(patient_data.get('oxygen_saturation', 95)))
    features.append(float(patient_data.get('map', 80)))  # Mean Arterial Pressure
    features.append(float(patient_data.get('heart_rate', 80)))
    
    # Sedation level (0-10)
    features.append(float(patient_data.get('sedation_level', 0)))
    
    # Head midline (0 or 1)
    head_midline = patient_data.get('head_midline', 1)
    features.append(1.0 if head_midline in [1, True, 'yes', 'Yes', '1'] else 0.0)
    
    # Temperature in Celsius
    features.append(float(patient_data.get('temperature_c', 37.0)))
    
    return np.array([features])


def predict_coma(patient_data: dict) -> Dict[str, Any]:
    """
    Predict coma outcomes for a patient
    
    Args:
        patient_data: Dictionary with coma patient information
        
    Returns:
        Dictionary with conscious_state, deterioration_risk, stability_score
    """
    if not load_coma_models():
        return _fallback_coma_predict(patient_data)
    
    try:
        X = preprocess_coma_data(patient_data)
        if X is None:
            return _fallback_coma_predict(patient_data)
        
        results = {}
        
        # 1. Conscious State Prediction (Classification)
        if 'xgb_conscious_state' in _coma_models:
            model = _coma_models['xgb_conscious_state']
            proba = model.predict_proba(X)[0]
            predicted_class = model.predict(X)[0]
            
            # Decode label if encoder available
            if _label_encoder is not None:
                try:
                    state_label = _label_encoder.inverse_transform([predicted_class])[0]
                except:
                    state_label = str(predicted_class)
            else:
                state_label = str(predicted_class)
            
            results['conscious_state'] = {
                'prediction': state_label,
                'confidence': round(float(max(proba)) * 100, 1) if max(proba) <= 0.99 else round(float(max(proba)) * 100, 0),  # Cap at 99.9%
                'probabilities': {f'class_{i}': round(float(p) * 100, 1) for i, p in enumerate(proba)}
            }
        
        # 2. Deterioration Risk Prediction (Regression)
        if 'xgb_deterioration_risk' in _coma_models:
            model = _coma_models['xgb_deterioration_risk']
            risk_score = float(model.predict(X)[0])
            # Normalize to 0-100 range
            risk_score = max(0, min(100, risk_score * 100 if risk_score <= 1 else risk_score))
            
            if risk_score >= 70:
                risk_level = "High"
            elif risk_score >= 40:
                risk_level = "Moderate"
            else:
                risk_level = "Low"
            
            results['deterioration_risk'] = {
                'score': round(risk_score, 1),
                'level': risk_level
            }
        
        # 3. Stability Score Prediction (Regression)
        if 'xgb_stability_score' in _coma_models:
            model = _coma_models['xgb_stability_score']
            stability = float(model.predict(X)[0])
            # Normalize to 0-100 range
            stability = max(0, min(100, stability * 100 if stability <= 1 else stability))
            
            if stability >= 70:
                stability_level = "Stable"
            elif stability >= 40:
                stability_level = "Moderately Stable"
            else:
                stability_level = "Unstable"
            
            results['stability_score'] = {
                'score': round(stability, 1),
                'level': stability_level
            }
        
        results['model_type'] = "XGBoost (Coma Models)"
        return results
        
    except Exception as e:
        print(f"Coma prediction error: {e}")
        import traceback
        print(traceback.format_exc())
        return _fallback_coma_predict(patient_data)


def _fallback_coma_predict(patient_data: dict) -> Dict[str, Any]:
    """
    Fallback rule-based prediction when coma models are not available
    """
    gcs = patient_data.get('gcs_total', 8)
    oxygen = patient_data.get('oxygen_saturation', 95)
    
    # Simple rule-based scoring
    deterioration_risk = 50
    if gcs <= 5:
        deterioration_risk += 30
    elif gcs <= 8:
        deterioration_risk += 15
    
    if oxygen < 90:
        deterioration_risk += 20
    elif oxygen < 95:
        deterioration_risk += 10
    
    deterioration_risk = min(100, deterioration_risk)
    stability = 100 - deterioration_risk
    
    if gcs <= 5:
        state = "Deep Coma"
    elif gcs <= 8:
        state = "Moderate Coma"
    else:
        state = "Mild Coma"
    
    return {
        'conscious_state': {
            'prediction': state,
            'confidence': 60.0,
            'probabilities': {}
        },
        'deterioration_risk': {
            'score': deterioration_risk,
            'level': "High" if deterioration_risk >= 70 else "Moderate" if deterioration_risk >= 40 else "Low"
        },
        'stability_score': {
            'score': stability,
            'level': "Stable" if stability >= 70 else "Moderately Stable" if stability >= 40 else "Unstable"
        },
        'model_type': "Rule-based (fallback)"
    }


# Try to load models on module import
load_coma_models()
