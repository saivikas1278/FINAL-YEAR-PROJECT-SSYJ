"""
Cross-Repository Generalization & Semantic Embedding Benchmark
==============================================================
Empirical evaluation for research publication:
  1. Compares BoW vs. TF-IDF vs. Dense Semantic (LSA/SVD) Embeddings.
  2. Evaluates Cross-Repository Domain Transfer:
     - Train on source repositories (Taiga.io, Apache, Mozilla)
     - Test on unseen target repositories (Enterprise FinTech, OpenEHR)
  3. Outputs comprehensive research benchmark to:
     ml_pipeline/models/cross_repo_benchmark.json
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
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import CountVectorizer, TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.ensemble import RandomForestClassifier
from imblearn.combine import SMOTETomek
import xgboost as xgb
from catboost import CatBoostClassifier

BASE = "d:/my_PROJECTS/FINAL YEAR PROJECT -SSJY/ml_pipeline"
DATA_PATH = f"{BASE}/data/agile_tasks_multi_repo.csv"
OUTPUT_PATH = f"{BASE}/models/cross_repo_benchmark.json"

def run_benchmark():
    print("=" * 70)
    print("CROSS-REPOSITORY & SEMANTIC EMBEDDING RESEARCH BENCHMARK")
    print("=" * 70)

    df = pd.read_csv(DATA_PATH)
    print(f"\n[OK] Loaded dataset: {len(df)} records across {df['repository'].nunique()} repositories.")
    print("Repositories:")
    for repo, count in df['repository'].value_counts().items():
        print(f"  - {repo}: {count} tasks")

    label_encoder = LabelEncoder()
    y_all = label_encoder.fit_transform(df['role'])
    classes = list(label_encoder.classes_)

    # ──────────────────────────────────────────────────────────────────────────
    # Experiment 1: Representation Comparison (BoW vs. TF-IDF vs. Dense Semantic)
    # ──────────────────────────────────────────────────────────────────────────
    print("\n[Experiment 1] Comparing Feature Representations (on XGBoost)...")
    
    representations = {}
    
    # 1. Bag-of-Words
    bow_vec = CountVectorizer(max_features=500, stop_words='english')
    X_bow = bow_vec.fit_transform(df['task_description']).toarray()
    
    # 2. TF-IDF
    tfidf_vec = TfidfVectorizer(max_features=500, stop_words='english')
    X_tfidf = tfidf_vec.fit_transform(df['task_description']).toarray()
    
    # 3. Dense Semantic Embeddings (TF-IDF + TruncatedSVD / Latent Semantic Analysis)
    svd = TruncatedSVD(n_components=128, random_state=42)
    X_semantic = svd.fit_transform(X_tfidf)

    reps = {
        "Bag-of-Words (BoW)": X_bow,
        "TF-IDF (Baseline)": X_tfidf,
        "Dense Semantic Embeddings": X_semantic,
    }

    rep_results = {}
    for rep_name, X_mat in reps.items():
        X_tr, X_te, y_tr, y_te = train_test_split(X_mat, y_all, test_size=0.2, random_state=42, stratify=y_all)
        clf = xgb.XGBClassifier(n_estimators=100, random_state=42, eval_metric='mlogloss', verbosity=0)
        clf.fit(X_tr, y_tr)
        preds = clf.predict(X_te)
        
        acc = accuracy_score(y_te, preds)
        prec = precision_score(y_te, preds, average='macro', zero_division=0)
        rec = recall_score(y_te, preds, average='macro', zero_division=0)
        f1 = f1_score(y_te, preds, average='macro', zero_division=0)
        
        rep_results[rep_name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "macro_f1": round(float(f1), 4)
        }
        print(f"  {rep_name:<28} -> Accuracy: {acc*100:.2f}% | Macro-F1: {f1*100:.2f}%")

    # ──────────────────────────────────────────────────────────────────────────
    # Experiment 2: Cross-Repository Generalization (Domain Transfer)
    # ──────────────────────────────────────────────────────────────────────────
    print("\n[Experiment 2] Cross-Repository Domain Transfer Evaluation...")
    source_repos = [
        "Taiga.io Agile Core",
        "Apache Microservices Framework",
        "Mozilla Sync & Cloud Services"
    ]
    target_repos = [
        "Enterprise FinTech Sprint",
        "OpenEHR Health System"
    ]

    train_mask = df['repository'].isin(source_repos)
    test_mask = df['repository'].isin(target_repos)

    df_train = df[train_mask]
    df_test = df[test_mask]

    print(f"  Source Repos (Train): {len(df_train)} tasks")
    print(f"  Target Repos (Unseen Test): {len(df_test)} tasks")

    # Vectorize using source vocabulary
    cross_vec = TfidfVectorizer(max_features=500, stop_words='english')
    X_source = cross_vec.fit_transform(df_train['task_description']).toarray()
    y_source = label_encoder.transform(df_train['role'])

    X_target = cross_vec.transform(df_test['task_description']).toarray()
    y_target = label_encoder.transform(df_test['role'])

    # Evaluate models on unseen repository tasks
    cross_models = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "XGBoost": xgb.XGBClassifier(n_estimators=100, random_state=42, eval_metric='mlogloss', verbosity=0),
        "CatBoost": CatBoostClassifier(iterations=100, random_seed=42, verbose=0, loss_function='MultiClass')
    }

    domain_transfer_results = {}
    for name, clf in cross_models.items():
        clf.fit(X_source, y_source)
        preds = clf.predict(X_target)
        if hasattr(preds, 'flatten'):
            preds = preds.flatten()
            
        acc = accuracy_score(y_target, preds)
        prec = precision_score(y_target, preds, average='macro', zero_division=0)
        rec = recall_score(y_target, preds, average='macro', zero_division=0)
        f1 = f1_score(y_target, preds, average='macro', zero_division=0)
        
        domain_transfer_results[name] = {
            "accuracy": round(float(acc), 4),
            "precision": round(float(prec), 4),
            "recall": round(float(rec), 4),
            "macro_f1": round(float(f1), 4)
        }
        print(f"  {name:<16} (Unseen Repos) -> Accuracy: {acc*100:.2f}% | Macro-F1: {f1*100:.2f}%")

    # ──────────────────────────────────────────────────────────────────────────
    # Save Benchmark Results
    # ──────────────────────────────────────────────────────────────────────────
    benchmark_data = {
        "dataset_total_tasks": len(df),
        "repositories": list(df['repository'].unique()),
        "classes": classes,
        "feature_representations": rep_results,
        "cross_domain_generalization": {
            "source_repositories": source_repos,
            "target_repositories": target_repos,
            "source_sample_count": len(df_train),
            "target_sample_count": len(df_test),
            "models": domain_transfer_results
        }
    }

    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
    with open(OUTPUT_PATH, "w") as f:
        json.dump(benchmark_data, f, indent=2)

    print(f"\n[OK] Benchmark output saved to: {OUTPUT_PATH}")
    print("=" * 70)

if __name__ == "__main__":
    run_benchmark()
