"""
Baseline Model Comparison Script
=================================
Trains 5 classical ML classifiers on the real agile_tasks.csv dataset
with SMOTETomek balancing and produces a comparison table for the paper.

Models evaluated:
  1. Random Forest (original paper baseline)
  2. Decision Tree
  3. K-Nearest Neighbors
  4. AdaBoost
  5. XGBoost (proposed — Tier 1)

Output: ml_pipeline/models/baseline_results.json
"""

import json
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
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    classification_report
)
from sklearn.ensemble import RandomForestClassifier, AdaBoostClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from imblearn.combine import SMOTETomek
import xgboost as xgb

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE = "d:/my_PROJECTS/FINAL YEAR PROJECT -SSJY/ml_pipeline"
DATA_PATH   = f"{BASE}/data/agile_tasks.csv"
OUTPUT_PATH = f"{BASE}/models/baseline_results.json"

# ── Load dataset ───────────────────────────────────────────────────────────────
print("=" * 60)
print("BASELINE MODEL COMPARISON — Agile Task Allocator")
print("=" * 60)

df = pd.read_csv(DATA_PATH)
print(f"\n[OK] Dataset loaded: {len(df)} records, {df['role'].nunique()} classes")
print(f"   Class distribution:\n{df['role'].value_counts().to_string()}\n")

# ── Preprocessing ──────────────────────────────────────────────────────────────
vectorizer = TfidfVectorizer(max_features=500, stop_words='english')
X_raw = vectorizer.fit_transform(df['task_description']).toarray()

label_encoder = LabelEncoder()
y = label_encoder.fit_transform(df['role'])

# ── SMOTETomek balancing ───────────────────────────────────────────────────────
print("Applying SMOTETomek balancing...")
smote_tomek = SMOTETomek(random_state=42)
X_balanced, y_balanced = smote_tomek.fit_resample(X_raw, y)
print(f"   Before: {len(y)} samples | After: {len(y_balanced)} samples\n")

# ── Train / Test split on balanced data ───────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X_balanced, y_balanced, test_size=0.2, random_state=42, stratify=y_balanced
)

# ── Model definitions ──────────────────────────────────────────────────────────
models = {
    "Random Forest":   RandomForestClassifier(n_estimators=100, random_state=42),
    "Decision Tree":   DecisionTreeClassifier(random_state=42),
    "KNN":             KNeighborsClassifier(n_neighbors=5),
    "AdaBoost":        AdaBoostClassifier(n_estimators=100, random_state=42),
    "XGBoost":         xgb.XGBClassifier(
                           n_estimators=100, random_state=42,
                           eval_metric='mlogloss', verbosity=0
                       ),
}

try:
    from catboost import CatBoostClassifier
    models["CatBoost"] = CatBoostClassifier(iterations=100, random_seed=42, verbose=0, loss_function='MultiClass')
except ImportError:
    pass

# ── Evaluate each model ────────────────────────────────────────────────────────
results = {}

print(f"{'Model':<20} {'Accuracy':>10} {'Precision':>10} {'Recall':>10} {'Macro-F1':>10}")
print("-" * 62)

for name, clf in models.items():
    clf.fit(X_train, y_train)
    preds = clf.predict(X_test)
    if hasattr(preds, 'flatten'):
        preds = preds.flatten()

    acc  = accuracy_score(y_test, preds)
    prec = precision_score(y_test, preds, average='macro', zero_division=0)
    rec  = recall_score(y_test, preds, average='macro', zero_division=0)
    f1   = f1_score(y_test, preds, average='macro', zero_division=0)

    results[name] = {
        "accuracy":  round(acc,  4),
        "precision": round(prec, 4),
        "recall":    round(rec,  4),
        "macro_f1":  round(f1,   4),
    }

    print(f"{name:<20} {acc:>10.4f} {prec:>10.4f} {rec:>10.4f} {f1:>10.4f}")

print("-" * 62)

# ── Detailed report for the best model ────────────────────────────────────────
best_model_name = max(results, key=lambda k: results[k]["macro_f1"])
print(f"\n[Best Model]: {best_model_name} (Macro-F1: {results[best_model_name]['macro_f1']:.4f})")

best_clf = models[best_model_name]
best_preds = best_clf.predict(X_test)
if hasattr(best_preds, 'flatten'):
    best_preds = best_preds.flatten()

print(f"\nDetailed Classification Report -- {best_model_name}:")
print(classification_report(
    y_test, best_preds,
    target_names=label_encoder.classes_,
    zero_division=0
))

# ── Save results to JSON ───────────────────────────────────────────────────────
output = {
    "dataset_size": len(df),
    "balanced_size": len(y_balanced),
    "test_size": len(y_test),
    "classes": list(label_encoder.classes_),
    "models": results
}

os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
with open(OUTPUT_PATH, "w") as f:
    json.dump(output, f, indent=2)

print(f"\n[OK] Results saved to: {OUTPUT_PATH}")
print("=" * 60)
