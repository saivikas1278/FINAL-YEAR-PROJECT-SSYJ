# Project Implementation Roadmap

## 1. Concrete Research Gaps & Future Scope Extensions

* **Moving from Classical NLP to Semantic Context (Transformer/LLM Integration):**
  * *Original:* BoW with term frequency ignores context and synonymy (e.g., "build responsive UI" vs. "style the frontend").
  * *Extension:* Replace BoW with contextual embeddings like **BERT**, **RoBERTa**, **CodeBERT**, or small fine-tuned LLMs (e.g., Llama / Mistral embeddings) to capture software engineering semantics.

* **Two-Stage Allocation (Role Prediction -> Specific Developer Matching):**
  * *Original:* Only predicts generic roles (e.g., "Back-end Developer"). In real agile projects, managers need to assign the task to an actual person.
  * *Extension:* A two-tier hybrid framework:
    * **Tier 1 (Role Classification):** Determines the required role/skills using NLP.
    * **Tier 2 (Resource Optimization):** Uses multi-objective optimization (e.g., Genetic Algorithm, NSGA-II, or Hungarian Algorithm) to assign the task to a specific developer based on **current sprint capacity**, **developer velocity**, and **timezone overlap**.

* **Dynamic Agile Constraints & Sentiment Analysis:**
  * Incorporate metadata such as story points, sprint urgency/priority, developer historical commit patterns, and code review turnarounds, rather than just task text.

* **Explainable AI (XAI) for Decision Trust:**
  * Incorporate **SHAP (SHapley Additive exPlanations)** or **LIME** to explain *why* the model assigned a task to a particular role/developer. This makes the tool practical for real-world Scrum Masters and adds significant research value.

## 2. Suggested Project Architecture

| Layer | Proposed Technology / Component | Function |
| --- | --- | --- |
| **Frontend** | React / Next.js + Tailwind CSS | Agile Kanban/Sprint dashboard where tasks are created and assignments are viewed. |
| **Backend & API** | FastAPI / Node.js + PostgreSQL / MongoDB | Task lifecycle management, role/developer profiles, sprint management. |
| **NLP & ML Engine** | Python, PyTorch, Hugging Face (RoBERTa / DeBERTa / TF-IDF), Scikit-Learn | Text embedding, SMOTE-Tomek re-balancing, and classification. |
| **Optimization Module** | SciPy / DEAP (Genetic Algorithm) | Real-time workload matching and developer capacity allocation. |
| **Explainability** | SHAP / LIME | Generates visual feature attribution for each recommendation. |

## 3. Step-by-Step Implementation Roadmap

1. **Dataset Enhancement:**
   * Use the base Taiga.io agile dataset (1,216 records) and optionally combine it with open-source Jira datasets (e.g., Apache or Mozilla Jira issue trackers) to show generalized multi-repository performance.

2. **Model Training & Comparison:**
   * Reproduce baseline models (Random Forest + SMOTETomek + BoW) in Python.
   * Implement proposed modern architectures: TF-IDF + XGBoost/LightGBM vs. Pre-trained BERT/RoBERTa embeddings + Dense Classifier.

3. **Build the Recommendation API & Dashboard:**
   * Build a FastAPI microservice that takes a new sprint user story description and returns: Top 3 recommended roles, predicted completion difficulty, and recommended developer ranking with a SHAP explanation.

4. **Empirical Evaluation:**
   * Benchmark Precision, Recall, Macro-F1 score, and Accuracy before and after data balancing and transformer fine-tuning.

## 4. Roadmap to Paper Publication

* **Paper Title Idea:** *"A Context-Aware Explainable Hybrid Framework for Automated Task and Role Allocation in Distributed Agile Teams"*
* **Target Venues:** Reputable IEEE/Springer international conferences indexed in Scopus.
* **Core Novelty to Highlight:**
  1. Superior classification metrics over traditional BoW/Orange-tool baselines via contextual transformer embeddings.
  2. Integration of workload balancing heuristics alongside classification.
  3. Interpretability through Explainable AI (XAI) to build trust in managerial decision-making.
