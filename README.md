# FINAL-YEAR-PROJECT-SSYJ

## Explainable Machine Learning for Developer Role Prediction and Task Allocation in Distributed Agile Teams

An end-to-end Two-Tier Hybrid Framework combining Advanced Gradient Boosting (**XGBoost**, **CatBoost**), Explainable AI (**SHAP**), and Multi-Objective Workload Balancing (**Hungarian Algorithm**) for distributed Agile software engineering teams.

---

### Key Features

1. **Tier 1 — Multi-Class Role Prediction**:
   - Classifies agile user stories / tasks into developer roles:
     - Frontend Developer
     - Backend Developer
     - QA/Testing Role
     - Database Administrator
     - DevOps Engineer
   - Evaluates confidence scores and generates Top-3 ranked roles.

2. **Explainable AI (XAI with SHAP)**:
   - Computes real-time TreeSHAP feature attributions.
   - Highlights the exact keywords (e.g. `react`, `docker`, `sql`, `api`, `cypress`) driving each prediction, giving Scrum Masters transparent and explainable decision support.

3. **Tier 2 — Hungarian Algorithm Workload Optimizer**:
   - Multi-objective cost optimization balancing developer normalized workload (60%) and sprint velocity (40%).
   - Matches the predicted role to the optimal candidate from the live team roster.

4. **Dynamic Team Roster & Workload Management (CRUD)**:
   - Add/edit team members, adjust live workload sliders, track sprint velocity, and update timezones.

5. **Sprint Backlog Batch Allocation (Phase 2)**:
   - Upload or configure full sprint backlogs (8+ user stories).
   - Capacity-aware multi-task Hungarian algorithm distributes user stories without overloading individual team members.
   - Live workload impact meters (before vs. post-allocation) and SHAP feature badges per story.

6. **Cross-Repository Generalization & Semantic Benchmark (Research Contribution)**:
   - Multi-source Agile dataset (1,250+ tasks from Taiga.io, Apache, Mozilla, FinTech, and OpenEHR).
   - Zero-shot domain transfer evaluation testing models on completely unseen repositories.
   - Compares Bag-of-Words (BoW) vs. TF-IDF vs. Dense Semantic (LSA/SVD) Embeddings.

7. **Viva & Research Audit Report Export**:
   - 1-click export of complete allocation decisions, team capacity usage, model benchmarks, and SHAP feature graphs for viva presentations and examiners.

---

### Project Architecture

```
FINAL YEAR PROJECT -SSJY/
├── backend/
│   ├── main.py                  # FastAPI REST API (Endpoints: /predict, /metrics, /developers, /history)
│   ├── developers.json          # Persistent team roster database
│   ├── prediction_history.json  # Audit log of recent allocations
│   └── requirements.txt         # Backend Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # React 19 UI (Predictor, SHAP charts, Benchmarks, Team CRUD)
│   │   ├── index.css            # Tailwind CSS v4 styling
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── ml_pipeline/
│   ├── data/
│   │   └── agile_tasks.csv      # Labeled Agile tasks dataset
│   ├── models/                  # Trained models, vectorizers & SHAP explainers (.pkl & .json)
│   └── src/
│       ├── generate_data.py     # Dataset generator
│       ├── train_baseline.py    # Classical baseline benchmark script
│       └── train_model.py       # Main XGBoost & CatBoost training pipeline
└── docs/
    ├── project_pitch.md         # Research motivation & problem statement
    └── implementation_plan.md   # Roadmap towards paper publication
```

---

### Quick Start Guide

#### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate
# On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
Backend API docs available at: `http://127.0.0.1:8000/docs`

#### 2. Frontend (React + Vite + Tailwind CSS)
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

#### 3. Re-train ML Models (Optional)
```bash
cd ml_pipeline
python src/train_model.py
python src/train_baseline.py
```

---

### Tech Stack

- **Machine Learning**: Python, Scikit-Learn, XGBoost, CatBoost, SHAP, Imbalanced-Learn (SMOTE-Tomek), SciPy
- **Backend**: FastAPI, Uvicorn, Pydantic
- **Frontend**: React 19, Vite, Tailwind CSS, Recharts, Lucide Icons
