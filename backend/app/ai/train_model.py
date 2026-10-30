"""
TBI CT Prediction Model Training Script
Trains XGBoost model and exports it with scalers for inference
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import MinMaxScaler, StandardScaler
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
import joblib
import os

# Get the directory where this script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(SCRIPT_DIR, "models")

# Create models directory if it doesn't exist
os.makedirs(MODEL_DIR, exist_ok=True)

def train_and_export_model(dataset_path: str):
    """
    Train the XGBoost model and export it with scalers
    
    Args:
        dataset_path: Path to the 20000_dataset.csv file
    """
    print("Loading dataset...")
    df = pd.read_csv(dataset_path)
    
    # Clean column names
    df.columns = df.columns.str.strip().str.lower().str.replace(" ", "_")
    
    # Remove duplicates
    df = df.drop_duplicates()
    
    # Identify numeric and categorical columns
    numeric_cols = df.select_dtypes(include=['int64', 'float64']).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object']).columns.tolist()
    
    # Fill missing values
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].median())
    df[categorical_cols] = df[categorical_cols].fillna(df[categorical_cols].mode().iloc[0])
    
    # One-hot encode nominal columns
    nominal_cols = [
        'gender', 'mechanism_of_injury', 'pre_existing_conditions',
        'seizure_type', 'ct_finding', 'pupillary_reaction',
        'surgery_type', 'complications'
    ]
    df = pd.get_dummies(df, columns=[c for c in nominal_cols if c in df.columns], drop_first=True)
    
    # Define scaling columns
    minmax_cols = ['age', 'gcs_total', 'vomiting_count', 'headache_severity_1_10', 'time_since_injury_hours']
    std_cols = ['loc_duration_min', 'amnesia_duration_min']
    
    # Filter to only existing columns
    minmax_cols = [c for c in minmax_cols if c in df.columns]
    std_cols = [c for c in std_cols if c in df.columns]
    
    # Create and fit scalers
    print("Fitting scalers...")
    scaler_minmax = MinMaxScaler()
    scaler_std = StandardScaler()
    
    if minmax_cols:
        df[minmax_cols] = scaler_minmax.fit_transform(df[minmax_cols])
    if std_cols:
        df[std_cols] = scaler_std.fit_transform(df[std_cols])
    
    # Select features for model
    candidate_features = [
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
    
    selected_features = [f for f in candidate_features if f in df.columns]
    print(f"Selected features: {selected_features}")
    
    # Prepare data
    X = df[selected_features]
    y = df['needs_ct_within_24h']
    
    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.3, random_state=42, stratify=y
    )
    
    # Calculate class weight for imbalanced data
    neg = (y_train == 0).sum()
    pos = (y_train == 1).sum()
    scale_pos_weight = neg / pos
    
    print("Training XGBoost model...")
    # Train XGBoost with best parameters from notebook
    model = XGBClassifier(
        n_estimators=400,
        max_depth=5,
        learning_rate=0.1,
        subsample=1.0,
        colsample_bytree=0.9,
        scale_pos_weight=scale_pos_weight,
        eval_metric='logloss',
        random_state=42
    )
    
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]
    
    print("\n=== Model Evaluation ===")
    print(f"Accuracy:  {accuracy_score(y_test, y_pred):.4f}")
    print(f"Precision: {precision_score(y_test, y_pred):.4f}")
    print(f"Recall:    {recall_score(y_test, y_pred):.4f}")
    print(f"F1-Score:  {f1_score(y_test, y_pred):.4f}")
    print(f"AUC:       {roc_auc_score(y_test, y_proba):.4f}")
    
    # Save model and scalers
    print("\nSaving model and scalers...")
    joblib.dump(model, os.path.join(MODEL_DIR, "xgb_ct_model.pkl"))
    joblib.dump(scaler_minmax, os.path.join(MODEL_DIR, "scaler_minmax.pkl"))
    joblib.dump(scaler_std, os.path.join(MODEL_DIR, "scaler_std.pkl"))
    joblib.dump(selected_features, os.path.join(MODEL_DIR, "feature_names.pkl"))
    
    # Save feature statistics for manual scaling
    feature_stats = {
        'minmax_cols': minmax_cols,
        'std_cols': std_cols,
        'minmax_min': scaler_minmax.data_min_.tolist() if minmax_cols else [],
        'minmax_max': scaler_minmax.data_max_.tolist() if minmax_cols else [],
        'std_mean': scaler_std.mean_.tolist() if std_cols else [],
        'std_scale': scaler_std.scale_.tolist() if std_cols else [],
    }
    joblib.dump(feature_stats, os.path.join(MODEL_DIR, "feature_stats.pkl"))
    
    print(f"\nModel saved to: {MODEL_DIR}")
    print("Training complete!")
    
    return model, scaler_minmax, scaler_std, selected_features


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python train_model.py <path_to_dataset.csv>")
        print("Example: python train_model.py ../../../20000_dataset.csv")
        sys.exit(1)
    
    dataset_path = sys.argv[1]
    train_and_export_model(dataset_path)
