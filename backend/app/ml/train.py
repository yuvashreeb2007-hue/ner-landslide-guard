"""
Machine Learning Training Pipeline for NER LandslideGuard
Generates 6,000+ synthetic geotechnical and meteorological records representing
Northeast India's 8 states, trains a high-precision RandomForest landslide predictor,
evaluates cross-validation metrics, and saves the production artifact to model.joblib.
"""

import os
import sys

# Ensure UTF-8 output encoding on Windows terminals
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.metrics import classification_report, roc_auc_score, confusion_matrix
import joblib

# Ensure data directory exists
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)

MODEL_PATH = os.path.join(BASE_DIR, "model.joblib")
CSV_PATH = os.path.join(DATA_DIR, "synthetic_landslide_data.csv")

FEATURE_NAMES = [
    "rainfall_24h",
    "rainfall_7d",
    "soil_moisture",
    "slope",
    "elevation",
    "ndvi",
    "historical_landslides",
    "distance_to_road",
    "distance_to_settlement"
]

def generate_synthetic_data(num_samples: int = 6500, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates realistic geoscientific records calibrated to Northeast India's
    topography, monsoon precipitation patterns, lithology, and anthropomorphic factors.
    """
    np.random.seed(random_seed)
    
    # 1. Slope (degrees): 5° (plains) to 75° (gorges/escarpments)
    slope_hills = np.random.normal(loc=24.0, scale=8.0, size=int(num_samples * 0.45))
    slope_steep = np.random.normal(loc=46.0, scale=9.0, size=int(num_samples * 0.55))
    slope = np.clip(np.concatenate([slope_hills, slope_steep]), 4.0, 75.0)
    np.random.shuffle(slope)
    
    # 2. Elevation (meters): 80m (Brahmaputra valley) to 4,200m (Sikkim/Arunachal high ranges)
    elevation = np.clip(np.random.exponential(scale=900.0, size=num_samples) + 120.0, 80.0, 4200.0)
    
    # 3. 24h Rainfall (mm): 0 to 450 mm (Extreme monsoons / cloudbursts)
    rainfall_24h = np.clip(np.random.gamma(shape=1.8, scale=35.0, size=num_samples), 0.0, 420.0)
    
    # 4. 7d Rainfall (mm): Accumulated antecedence
    rainfall_7d = np.clip(rainfall_24h * np.random.uniform(1.8, 3.8, size=num_samples) + np.random.gamma(shape=2.0, scale=40.0, size=num_samples), rainfall_24h, 1200.0)
    
    # 5. Soil Moisture (%): Correlated with 7d rainfall and terrain
    moisture_base = 30.0 + (rainfall_7d / 1200.0) * 55.0 + (rainfall_24h / 400.0) * 20.0
    soil_moisture = np.clip(moisture_base + np.random.normal(0, 6.0, size=num_samples), 15.0, 100.0)
    
    # 6. NDVI (Normalized Difference Vegetation Index): 0.05 (bare rock / slide scar) to 0.88 (dense rainforest)
    ndvi = np.clip(np.random.beta(a=5, b=2, size=num_samples) * 0.9, 0.05, 0.90)
    
    # 7. Historical Landslides: Count of historical slips in grid cell
    historical_landslides = np.random.poisson(lam=np.where(slope > 35, 4.5, 1.2), size=num_samples)
    historical_landslides = np.clip(historical_landslides, 0, 30)
    
    # 8. Distance to Road (meters): 10m to 3500m
    distance_to_road = np.clip(np.random.exponential(scale=600.0, size=num_samples) + 15.0, 5.0, 4000.0)
    
    # 9. Distance to Settlement (meters): 50m to 5000m
    distance_to_settlement = np.clip(np.random.exponential(scale=1100.0, size=num_samples) + 40.0, 20.0, 6000.0)
    
    # GEOTECHNICAL RISK LOGIC / FACTOR OF SAFETY EQUATION PROXY:
    driving_force = (
        (np.sin(np.radians(slope)) ** 1.6) * 45.0 +
        ((rainfall_24h / 150.0) ** 1.3) * 28.0 +
        ((rainfall_7d / 500.0) ** 1.1) * 18.0 +
        ((soil_moisture / 100.0) ** 1.8) * 32.0 +
        (historical_landslides * 1.8) +
        np.where(distance_to_road < 120.0, 14.0 * (1.0 - distance_to_road / 120.0), 0.0)
    )
    
    resisting_force = (
        (ndvi * 24.0) +
        ((1.0 - np.sin(np.radians(slope))) * 25.0) +
        np.where(soil_moisture < 50.0, 20.0 * (1.0 - soil_moisture / 50.0), 0.0) +
        15.0
    )
    
    factor_of_safety = resisting_force / (driving_force + 1e-5)
    logit = (driving_force - resisting_force) / 12.0
    prob_failure = 1.0 / (1.0 + np.exp(-logit))
    
    noisy_prob = np.clip(prob_failure + np.random.normal(0, 0.04, size=num_samples), 0.001, 0.999)
    landslide_occurred = (noisy_prob >= 0.50).astype(int)
    risk_score = np.clip((noisy_prob * 100.0).round().astype(int), 0, 100)
    
    df = pd.DataFrame({
        "rainfall_24h": np.round(rainfall_24h, 2),
        "rainfall_7d": np.round(rainfall_7d, 2),
        "soil_moisture": np.round(soil_moisture, 2),
        "slope": np.round(slope, 2),
        "elevation": np.round(elevation, 1),
        "ndvi": np.round(ndvi, 3),
        "historical_landslides": historical_landslides,
        "distance_to_road": np.round(distance_to_road, 1),
        "distance_to_settlement": np.round(distance_to_settlement, 1),
        "factor_of_safety": np.round(factor_of_safety, 3),
        "risk_score": risk_score,
        "landslide_occurred": landslide_occurred
    })
    
    return df

def train_and_evaluate_model():
    print("=" * 70)
    print("NER LANDSLIDEGUARD - MACHINE LEARNING PIPELINE TRAINING")
    print("=" * 70)
    
    print("\n1. Generating synthetic geotechnical dataset (6,500 samples)...")
    df = generate_synthetic_data(num_samples=6500)
    df.to_csv(CSV_PATH, index=False)
    print(f"   [OK] Dataset saved to: {CSV_PATH}")
    print(f"   [OK] Class distribution: {df['landslide_occurred'].value_counts().to_dict()}")
    
    X = df[FEATURE_NAMES]
    y = df["landslide_occurred"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    print("\n2. Initializing Random Forest Classifier...")
    rf = RandomForestClassifier(
        n_estimators=130,
        max_depth=12,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42,
        n_jobs=-1
    )
    
    print("\n3. Performing 5-Fold Stratified Cross-Validation...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_results = cross_validate(
        rf, X, y,
        cv=cv,
        scoring=["accuracy", "precision", "recall", "f1", "roc_auc"]
    )
    
    print("   Cross-Validation Metrics:")
    print(f"   * Mean Accuracy:  {cv_results['test_accuracy'].mean():.4f} (+/- {cv_results['test_accuracy'].std():.4f})")
    print(f"   * Mean Precision: {cv_results['test_precision'].mean():.4f} (+/- {cv_results['test_precision'].std():.4f})")
    print(f"   * Mean Recall:    {cv_results['test_recall'].mean():.4f} (+/- {cv_results['test_recall'].std():.4f})")
    print(f"   * Mean F1-Score:  {cv_results['test_f1'].mean():.4f} (+/- {cv_results['test_f1'].std():.4f})")
    print(f"   * Mean ROC-AUC:   {cv_results['test_roc_auc'].mean():.4f} (+/- {cv_results['test_roc_auc'].std():.4f})")
    
    print("\n4. Fitting production model on training split...")
    rf.fit(X_train, y_train)
    
    y_pred = rf.predict(X_test)
    y_prob = rf.predict_proba(X_test)[:, 1]
    
    test_roc = roc_auc_score(y_test, y_prob)
    print(f"\n   Holdout Test Set ROC-AUC: {test_roc:.4f}")
    print("\n   Classification Report:")
    print(classification_report(y_test, y_pred, target_names=["Stable (0)", "Landslide Risk (1)"]))
    
    importances = dict(zip(FEATURE_NAMES, rf.feature_importances_))
    sorted_importances = sorted(importances.items(), key=lambda item: item[1], reverse=True)
    print("5. Top Feature Importances:")
    for feat, imp in sorted_importances:
        print(f"   * {feat:25s}: {imp * 100:.2f}%")
        
    artifact = {
        "model": rf,
        "feature_names": FEATURE_NAMES,
        "feature_importances": importances,
        "metrics": {
            "cv_accuracy": float(cv_results['test_accuracy'].mean()),
            "cv_f1": float(cv_results['test_f1'].mean()),
            "cv_roc_auc": float(cv_results['test_roc_auc'].mean()),
            "test_roc_auc": float(test_roc)
        },
        "dataset_summary": {
            "total_samples": len(df),
            "positive_cases": int(df['landslide_occurred'].sum()),
            "features": FEATURE_NAMES
        }
    }
    
    joblib.dump(artifact, MODEL_PATH, compress=3)
    print(f"\n6. Production ML artifact successfully saved to: {MODEL_PATH}")
    print("=" * 70)

if __name__ == "__main__":
    train_and_evaluate_model()
