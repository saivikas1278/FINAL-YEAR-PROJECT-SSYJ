"""
Main Model Training Pipeline
==============================
Trains XGBoost + CatBoost classifiers with:
  - TF-IDF vectorization (500 features)
  - SMOTETomek class balancing
  - SHAP explainers for both models
  - Top-3 role probability support

Saves:
  - xgboost_model.pkl
  - catboost_model.pkl
  - vectorizer.pkl
  - label_encoder.pkl
  - shap_explainer.pkl         (XGBoost SHAP)
  - catboost_shap_explainer.pkl (CatBoost SHAP)
"""

import pickle
import os
import sys
import warnings
warnings.filterwarnings("ignore")

try:
    sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, f1_score, classification_report
from imblearn.combine import SMOTETomek
import xgboost as xgb
import shap

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE        = "d:/my_PROJECTS/FINAL YEAR PROJECT -SSJY/ml_pipeline"
DATA_PATH   = f"{BASE}/data/agile_tasks.csv"
MODELS_DIR  = f"{BASE}/models"

def save(obj, filename):
    path = f"{MODELS_DIR}/{filename}"
    with open(path, "wb") as f:
        pickle.dump(obj, f)
    print(f"   [Saved] {filename}")

def train_and_save():
    print("=" * 60)
    print("MAIN TRAINING PIPELINE -- XGBoost + CatBoost")
    print("=" * 60)

    # -- Load ------------------------------------------------------------------
    df = pd.read_csv(DATA_PATH)
    print(f"\n[OK] Dataset: {len(df)} records, {df['role'].nunique()} classes")

    # -- Vectorize -------------------------------------------------------------
    print("\n[1/6] TF-IDF Vectorization (500 features)...")
    vectorizer = TfidfVectorizer(max_features=500, stop_words='english')
    X_raw = vectorizer.fit_transform(df['task_description']).toarray()

    label_encoder = LabelEncoder()
    y = label_encoder.fit_transform(df['role'])
    print(f"   Classes: {list(label_encoder.classes_)}")

    # ── SMOTETomek ────────────────────────────────────────────────────────────
    print("\n[2/6] Applying SMOTETomek balancing...")
    smote_tomek = SMOTETomek(random_state=42)
    X_balanced, y_balanced = smote_tomek.fit_resample(X_raw, y)
    print(f"   Before: {len(y)} | After: {len(y_balanced)} samples")

    # ── Split ─────────────────────────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X_balanced, y_balanced, test_size=0.2, random_state=42, stratify=y_balanced
    )

    # ── Save vectorizer & encoder ─────────────────────────────────────────────
    print("\n[3/6] Saving shared artifacts...")
    save(vectorizer,    "vectorizer.pkl")
    save(label_encoder, "label_encoder.pkl")

    # ══════════════════════════════════════════════════════════════════════════
    # XGBoost
    # ══════════════════════════════════════════════════════════════════════════
    print("\n[4/6] Training XGBoost Classifier...")
    xgb_model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        random_state=42,
        eval_metric='mlogloss',
        verbosity=0
    )
    xgb_model.fit(X_train, y_train)

    xgb_preds = xgb_model.predict(X_test)
    xgb_acc   = accuracy_score(y_test, xgb_preds)
    xgb_f1    = f1_score(y_test, xgb_preds, average='macro', zero_division=0)
    print(f"   XGBoost -> Accuracy: {xgb_acc:.4f} | Macro-F1: {xgb_f1:.4f}")
    print(classification_report(y_test, xgb_preds, target_names=label_encoder.classes_, zero_division=0))

    save(xgb_model, "xgboost_model.pkl")

    print("   Building XGBoost SHAP TreeExplainer...")
    xgb_explainer = shap.TreeExplainer(xgb_model)
    save(xgb_explainer, "shap_explainer.pkl")

    # ==========================================================================
    # CatBoost (optional -- install separately if needed)
    # ==========================================================================
    print("\n[5/6] Training CatBoost Classifier...")
    try:
        from catboost import CatBoostClassifier
        cb_model = CatBoostClassifier(
            iterations=200,
            depth=6,
            learning_rate=0.1,
            random_seed=42,
            verbose=0,
            loss_function='MultiClass'
        )
        cb_model.fit(X_train, y_train)

        cb_preds = cb_model.predict(X_test).flatten()
        cb_acc   = accuracy_score(y_test, cb_preds)
        cb_f1    = f1_score(y_test, cb_preds, average='macro', zero_division=0)
        print(f"   CatBoost -> Accuracy: {cb_acc:.4f} | Macro-F1: {cb_f1:.4f}")
        print(classification_report(y_test, cb_preds, target_names=label_encoder.classes_, zero_division=0))

        save(cb_model, "catboost_model.pkl")

        print("   Building CatBoost SHAP explainer...")
        cb_explainer = shap.TreeExplainer(cb_model)
        save(cb_explainer, "catboost_shap_explainer.pkl")
        print("   [OK] CatBoost training complete.")

    except ImportError:
        print("   [WARN] CatBoost not installed. Skipping CatBoost training.")
        print("   --> To install: pip install catboost  (requires ~102 MB download)")
        print("   --> System runs fully with XGBoost only.")

    print("\n[6/6] Pipeline complete [OK]")
    print("=" * 60)

if __name__ == "__main__":
    os.makedirs(MODELS_DIR, exist_ok=True)
    train_and_save()
