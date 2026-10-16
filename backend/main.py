"""
Developer Role Prediction & Allocation API
==========================================
FastAPI backend with:
  - Tier 1: XGBoost or CatBoost role classification (TF-IDF + SMOTETomek trained)
  - Tier 2: Hungarian Algorithm workload optimizer
  - SHAP explainability (feature importance per prediction)
  - Top-3 role predictions with confidence scores
  - /metrics  — model comparison data (from baseline_results.json)
  - /developers — team roster with live workload
  - /history  — last 20 prediction audit log
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Literal
import pickle
import json
import os
import numpy as np
from datetime import datetime
from scipy.optimize import linear_sum_assignment

app = FastAPI(title="Developer Role Prediction & Allocation API", version="2.0")

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Paths ──────────────────────────────────────────────────────────────────────
BASE = "d:/my_PROJECTS/FINAL YEAR PROJECT -SSJY/ml_pipeline"
HISTORY_FILE = "d:/my_PROJECTS/FINAL YEAR PROJECT -SSJY/backend/prediction_history.json"

# ── Load ML Artifacts ──────────────────────────────────────────────────────────
def load_pkl(path):
    try:
        with open(path, "rb") as f:
            return pickle.load(f)
    except Exception as e:
        print(f"  [WARN] Could not load {path}: {e}")
        return None

print("Loading ML artifacts...")
vectorizer       = load_pkl(f"{BASE}/models/vectorizer.pkl")
label_encoder    = load_pkl(f"{BASE}/models/label_encoder.pkl")
xgb_model        = load_pkl(f"{BASE}/models/xgboost_model.pkl")
xgb_explainer    = load_pkl(f"{BASE}/models/shap_explainer.pkl")
cb_model         = load_pkl(f"{BASE}/models/catboost_model.pkl")
cb_explainer     = load_pkl(f"{BASE}/models/catboost_shap_explainer.pkl")

# ── Load Baseline Metrics ──────────────────────────────────────────────────────
baseline_results = {}
try:
    with open(f"{BASE}/models/baseline_results.json", "r") as f:
        baseline_results = json.load(f)
    print("[OK] Baseline results loaded.")
except Exception as e:
    print(f"  [WARN] baseline_results.json not found: {e}")

DEV_FILE = "d:/my_PROJECTS/FINAL YEAR PROJECT -SSJY/backend/developers.json"

DEFAULT_DEVELOPERS = [
    {"id": 1, "name": "Alice Smith",    "role": "Frontend Developer",     "workload": 85, "velocity": 40, "timezone": "UTC+5:30"},
    {"id": 2, "name": "Bob Jones",      "role": "Frontend Developer",     "workload": 30, "velocity": 35, "timezone": "UTC+0"},
    {"id": 3, "name": "Charlie Davis",  "role": "Backend Developer",      "workload": 90, "velocity": 45, "timezone": "UTC+5:30"},
    {"id": 4, "name": "Diana Prince",   "role": "Backend Developer",      "workload": 20, "velocity": 50, "timezone": "UTC-5"},
    {"id": 5, "name": "Eve Adams",      "role": "QA/Testing Role",        "workload": 40, "velocity": 30, "timezone": "UTC+1"},
    {"id": 6, "name": "Frank Castle",   "role": "Database Administrator", "workload": 60, "velocity": 35, "timezone": "UTC+0"},
    {"id": 7, "name": "Grace Hopper",   "role": "DevOps Engineer",        "workload": 50, "velocity": 55, "timezone": "UTC-8"},
]

def load_developers():
    if os.path.exists(DEV_FILE):
        try:
            with open(DEV_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_DEVELOPERS
    save_developers(DEFAULT_DEVELOPERS)
    return DEFAULT_DEVELOPERS

def save_developers(devs):
    with open(DEV_FILE, "w") as f:
        json.dump(devs, f, indent=2)

# ── History helpers ────────────────────────────────────────────────────────────
def load_history():
    if os.path.exists(HISTORY_FILE):
        try:
            with open(HISTORY_FILE, "r") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def append_history(entry: dict):
    history = load_history()
    history.insert(0, entry)      # newest first
    history = history[:50]        # keep last 50
    with open(HISTORY_FILE, "w") as f:
        json.dump(history, f, indent=2)

# ── Hungarian Algorithm Tier 2 ─────────────────────────────────────────────────
def optimize_allocation_hungarian(predicted_role: str):
    """
    Multi-objective developer allocation using the Hungarian Algorithm.
    Cost matrix combines:
      - Normalised workload (60% weight) — lower is better
      - Inverse normalised velocity (40% weight) — higher velocity is better
    """
    all_devs = load_developers()
    candidates = [dev for dev in all_devs if dev["role"] == predicted_role]

    if not candidates:
        return {
            "name": "Unassigned",
            "workload_percent": 0,
            "velocity": 0,
            "reason": "No developers found for this role in team roster.",
            "algorithm": "N/A"
        }

    if len(candidates) == 1:
        dev = candidates[0]
        return {
            "name": dev["name"],
            "workload_percent": dev["workload"],
            "velocity": dev["velocity"],
            "reason": f"Only available developer for {predicted_role}.",
            "algorithm": "Direct Assignment"
        }

    # Build cost matrix (1 task × N candidates)
    workloads  = np.array([d["workload"]  for d in candidates], dtype=float)
    velocities = np.array([d["velocity"]  for d in candidates], dtype=float)

    # Normalise 0–1
    w_min, w_max = workloads.min(),  workloads.max()
    v_min, v_max = velocities.min(), velocities.max()

    norm_workload = (workloads  - w_min) / (w_max - w_min + 1e-9)
    norm_velocity = (velocities - v_min) / (v_max - v_min + 1e-9)

    # Cost: high workload = bad, low velocity = bad
    cost = 0.6 * norm_workload + 0.4 * (1 - norm_velocity)
    cost_matrix = cost.reshape(1, -1)   # 1 task × N devs

    row_ind, col_ind = linear_sum_assignment(cost_matrix)
    best = candidates[col_ind[0]]

    return {
        "name": best["name"],
        "workload_percent": best["workload"],
        "velocity": best["velocity"],
        "reason": (
            f"Selected via Hungarian Algorithm — optimal balance of workload "
            f"({best['workload']}%) and velocity ({best['velocity']} pts/sprint)."
        ),
        "algorithm": "Hungarian Algorithm"
    }

# ── SHAP helper ────────────────────────────────────────────────────────────────
def get_shap_features(explainer, X, pred_idx):
    if explainer is None:
        return []
    try:
        shap_values = explainer.shap_values(X)
        if isinstance(shap_values, list):
            shap_arr = shap_values[pred_idx][0]
        else:
            if len(shap_values.shape) == 3:
                shap_arr = shap_values[0, :, pred_idx]
            else:
                shap_arr = shap_values[0]

        feature_names = vectorizer.get_feature_names_out()
        importance = [
            {"feature": feature_names[i], "value": float(v)}
            for i, v in enumerate(shap_arr) if v > 0
        ]
        importance.sort(key=lambda x: x["value"], reverse=True)
        return importance[:5]
    except Exception as e:
        print(f"SHAP error: {e}")
        return []

# ══════════════════════════════════════════════════════════════════════════════
# API Endpoints
# ══════════════════════════════════════════════════════════════════════════════

class TaskInput(BaseModel):
    task_description: str
    model: Optional[Literal["xgboost", "catboost"]] = "xgboost"

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "message": "Agile Task Allocator API v2.0",
        "models_loaded": {
            "xgboost": xgb_model is not None,
            "catboost": cb_model is not None,
        }
    }

@app.post("/predict")
def predict_role(task: TaskInput):
    if not vectorizer or not label_encoder:
        raise HTTPException(status_code=500, detail="Core ML artifacts not loaded.")

    # Select model
    if task.model == "catboost":
        if cb_model is None:
            raise HTTPException(status_code=503, detail="CatBoost model not loaded. Run train_model.py first.")
        clf       = cb_model
        explainer = cb_explainer
        model_name = "CatBoost"
    else:
        if xgb_model is None:
            raise HTTPException(status_code=503, detail="XGBoost model not loaded.")
        clf       = xgb_model
        explainer = xgb_explainer
        model_name = "XGBoost"

    # Vectorize input
    X = vectorizer.transform([task.task_description]).toarray()

    # Tier 1 — Role prediction
    pred_idx       = clf.predict(X)[0]
    if hasattr(pred_idx, '__iter__'):
        pred_idx = pred_idx[0]
    pred_idx       = int(pred_idx)
    predicted_role = label_encoder.inverse_transform([pred_idx])[0]

    proba          = clf.predict_proba(X)[0]
    confidence     = float(np.max(proba))

    # Top-3 roles
    top3_indices = np.argsort(proba)[::-1][:3]
    top_3_roles  = [
        {"role": label_encoder.inverse_transform([i])[0], "confidence": round(float(proba[i]), 4)}
        for i in top3_indices
    ]

    # SHAP explanation
    shap_explanation = get_shap_features(explainer, X, pred_idx)

    # Tier 2 — Hungarian allocation
    allocation = optimize_allocation_hungarian(predicted_role)

    # Confidence label
    if confidence >= 0.85:
        confidence_label = "High Confidence"
    elif confidence >= 0.60:
        confidence_label = "Moderate Confidence"
    else:
        confidence_label = "Low Confidence — Manual Review Recommended"

    result = {
        "predicted_role":    predicted_role,
        "confidence":        round(confidence, 4),
        "confidence_label":  confidence_label,
        "model_used":        model_name,
        "top_3_roles":       top_3_roles,
        "shap_explanation":  shap_explanation,
        "allocation":        allocation,
        "task_description":  task.task_description,
    }

    # Log to history
    try:
        append_history({
            "timestamp":      datetime.utcnow().isoformat() + "Z",
            "task":           task.task_description[:120],
            "predicted_role": predicted_role,
            "confidence":     round(confidence, 4),
            "model":          model_name,
            "assigned_to":    allocation["name"],
        })
    except Exception as e:
        print(f"History write error: {e}")

    return result


@app.get("/metrics")
def get_metrics():
    """Returns baseline model comparison metrics for the frontend chart."""
    if not baseline_results:
        raise HTTPException(
            status_code=404,
            detail="Metrics not available. Run train_baseline.py first."
        )
    return baseline_results


# ── Developer Roster Endpoints (CRUD) ──────────────────────────────────────────

class DeveloperCreate(BaseModel):
    name: str
    role: str
    workload: int
    velocity: int
    timezone: Optional[str] = "UTC+0"

class DeveloperUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    workload: Optional[int] = None
    velocity: Optional[int] = None
    timezone: Optional[str] = None

@app.get("/developers")
def get_developers():
    """Returns the full developer roster with workload data."""
    return {"developers": load_developers()}

@app.post("/developers")
def add_developer(dev: DeveloperCreate):
    """Add a new developer to the roster."""
    devs = load_developers()
    new_id = max([d["id"] for d in devs], default=0) + 1
    new_dev = {
        "id": new_id,
        "name": dev.name.strip(),
        "role": dev.role.strip(),
        "workload": max(0, min(100, dev.workload)),
        "velocity": max(1, dev.velocity),
        "timezone": dev.timezone.strip() if dev.timezone else "UTC+0"
    }
    devs.append(new_dev)
    save_developers(devs)
    return {"status": "ok", "developer": new_dev}

@app.put("/developers/{dev_id}")
def update_developer(dev_id: int, dev_update: DeveloperUpdate):
    """Update an existing developer's workload, velocity, role, etc."""
    devs = load_developers()
    target = None
    for d in devs:
        if d["id"] == dev_id:
            target = d
            break
    if not target:
        raise HTTPException(status_code=404, detail=f"Developer with ID {dev_id} not found.")

    if dev_update.name is not None:
        target["name"] = dev_update.name.strip()
    if dev_update.role is not None:
        target["role"] = dev_update.role.strip()
    if dev_update.workload is not None:
        target["workload"] = max(0, min(100, dev_update.workload))
    if dev_update.velocity is not None:
        target["velocity"] = max(1, dev_update.velocity)
    if dev_update.timezone is not None:
        target["timezone"] = dev_update.timezone.strip()

    save_developers(devs)
    return {"status": "ok", "developer": target}

@app.delete("/developers/{dev_id}")
def delete_developer(dev_id: int):
    """Remove a developer from the team roster."""
    devs = load_developers()
    filtered = [d for d in devs if d["id"] != dev_id]
    if len(filtered) == len(devs):
        raise HTTPException(status_code=404, detail=f"Developer with ID {dev_id} not found.")
    save_developers(filtered)
    return {"status": "ok", "message": f"Developer {dev_id} removed."}

@app.post("/developers/reset")
def reset_developers():
    """Reset the roster back to default team configuration."""
    save_developers(DEFAULT_DEVELOPERS)
    return {"status": "ok", "developers": DEFAULT_DEVELOPERS}


@app.get("/history")
def get_history():
    """Returns the last 20 prediction audit log entries."""
    history = load_history()
    return {"history": history[:20], "total": len(history)}
