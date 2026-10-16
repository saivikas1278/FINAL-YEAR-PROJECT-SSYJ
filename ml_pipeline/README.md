# ML Pipeline

This folder contains the machine learning code for developer role prediction and task allocation.

## Structure
- `data/`: Put your datasets here (e.g., Taiga.io dataset, Jira datasets).
- `models/`: Trained models will be saved here.
- `notebooks/`: Jupyter notebooks for data exploration, baseline model training, and SHAP visualizations.
- `src/`: Reusable Python modules for data preprocessing, training, and evaluation.

## Getting Started

1. Set up a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install pandas scikit-learn xgboost catboost shap transformers torch jupyter
   ```
3. Run the baseline training script:
   ```bash
   python src/train_baseline.py
   ```
