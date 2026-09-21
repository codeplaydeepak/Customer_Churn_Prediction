# Customer Churn Prediction System
### End-to-End Reproducible Machine Learning, Explainable AI, Customer Risk Analysis, and Interactive Dashboard for Telecom Churn Prediction

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Tests: 15 Passed](https://img.shields.io/badge/tests-15%20passed-brightgreen.svg)]()

---

## 1. Executive & Academic Abstract

Customer churn represents one of the most critical operational and revenue vulnerabilities in modern telecommunications. This project provides a complete, research-oriented, and academically rigorous machine learning pipeline designed to predict, evaluate, and explain customer churn risk while adhering to strict methodological standards (data leakage prevention, stratified cross-validation, hyperparameter tuning on training partitions only, and local/global explainability via SHAP).

### ⚠️ Explicit Academic Limitation Notice
> **Methodological Boundary**: The baseline experiments in this repository utilize a synthetically generated customer dataset ($N=1,000$, 41.4% churn rate) designed to replicate the statistical distribution and logic of the original exploratory notebook. Reported baseline metrics demonstrate the behavior and mathematical validity of the developed pipeline on the synthetic distribution and **must not be interpreted as empirical evidence of real-world subscriber churn**.

---

## 2. System Architecture

```
+-------------------------------------------------------------------------------+
|                      CUSTOMER CHURN PREDICTION PIPELINE                        |
+-------------------------------------------------------------------------------+
                                        |
     +----------------------------------+----------------------------------+
     |                                                                     |
     v                                                                     v
[Synthetic Baseline Generator]                              [User Uploaded CSV Data]
(N=1000, seed=42, 41.4% churn)                              (Schema Validation Engine)
     |                                                                     |
     +----------------------------------+----------------------------------+
                                        |
                                        v
                            [Data Validation Module]
                     (Type checks, missingness, IQR outliers)
                                        |
                                        v
                         [Feature Engineering Engine]
                     - MonthlyToTotalRatio = MC / (TC + 1)
                     - IsNewCustomer = (Tenure <= 6)
                                        |
                                        v
                 [Train / Test Stratified Partitioning (80/20)]
         * Data Leakage Prevention: Transformers fitted strictly on train *
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
     [Preprocessing Pipeline]                        [Candidate Estimators]
     - Numerical: Median + StandardScaler           1. Baseline Random Forest
     - Categorical: Mode + OneHotEncoder             2. Logistic Regression
                                                     3. Decision Tree
                                                     4. Tuned Random Forest
                                                     5. Gradient Boosting
                                                     6. XGBoost / HistGB
                                        |
                                        v
     +-------------------------------------------------------------------------+
     |                     MODEL EVALUATION & EXPLAINABILITY                   |
     +-------------------------------------------------------------------------+
     | - Metric Evaluation (Accuracy, Precision, Recall, F1, ROC-AUC)          |
     | - 5-Fold Stratified Cross-Validation (Mean & Std Dev)                   |
     | - Threshold Analysis (0.30 - 0.70 trade-offs)                           |
     | - XAI: Tree Gini Importance, Permutation Importance, SHAP Force Values  |
     +-------------------------------------------------------------------------+
                                        |
                 +----------------------+----------------------+
                 |                                             |
                 v                                             v
     [Inference & Risk Engine]                    [Dual Interface Layer]
     - Individual Prediction                     1. React 19 Interactive Dashboard
     - Batch CSV Processing (50-1000s)              (15 Deep-Dive Pages / Views)
     - Risk Segmentation (Low, Med, High)        2. Streamlit / CLI Python App
     - Review-Oriented Retention Framework
```

---

## 3. Project Structure

```
customer-churn-prediction/
├── README.md                           # Comprehensive documentation & research report
├── requirements.txt                    # Exact pinned Python dependencies
├── streamlit_app.py                    # Streamlit / interactive CLI entrypoint
├── data/
│   ├── raw/
│   │   └── synthetic_churn_data.csv    # 1,000-row baseline synthetic dataset
│   ├── processed/
│   │   └── churn_engineered.csv        # Post-feature engineering dataset
│   └── sample/
│       └── churn_sample.csv            # 50-row sample for quick validation
├── models/
│   ├── baseline_random_forest.pkl      # Preserved baseline model (n_est=100, depth=5)
│   ├── tuned_model.pkl                 # Best tuned estimator from grid search
│   └── preprocessing_pipeline.pkl      # Fitted ColumnTransformer
├── notebooks/
│   └── churn_analysis.ipynb            # Fully reproducible 10-cell research notebook
├── reports/
│   ├── figures/                        # Generated figures and charts
│   └── results/
│       ├── model_comparison.json       # Exact multi-model evaluation metrics
│       ├── cross_validation.json       # 5-fold CV mean & std metrics
│       └── threshold_analysis.json     # Precision-Recall trade-off table
├── src/
│   ├── __init__.py
│   ├── data_loader.py                  # Dataset ingestion & synthetic generator
│   ├── validation.py                   # Data type & schema validation, IQR outliers
│   ├── preprocessing.py                # Pipeline construction (leakage-safe)
│   ├── feature_engineering.py          # Domain-derived ratio & indicator creation
│   ├── train.py                        # Model training across 6 algorithms
│   ├── cross_validation.py             # 5-fold stratified cross-validation
│   ├── tuning.py                       # GridSearchCV on training folds
│   ├── evaluation.py                   # Confusion matrix, ROC, PR curves, thresholding
│   ├── explainability.py               # Tree importance, permutation, and SHAP
│   ├── prediction.py                   # Single customer & batch CSV inference
│   ├── risk_analysis.py                # Risk stratification (Low, Medium, High)
│   └── utilities.py                    # Serialization, directories, formatting
└── tests/
    ├── test_data.py                    # 6 unit tests for data generation & validation
    ├── test_features.py                # 4 unit tests for feature engineering
    ├── test_prediction.py              # 3 unit tests for inference & risk levels
    └── test_pipeline.py                # 2 unit tests for data leakage & monotonicity
```

---

## 4. Benchmark Model Performance (Exact Empirical Results)

Evaluated on the held-out test split ($N=200$, 117 Retained, 83 Churned, stratified):

| Model Name | Accuracy | Precision | Recall | F1-Score | ROC-AUC | Confusion Matrix (TN, FP, FN, TP) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline Random Forest** | **67.00%** | **64.91%** | **44.58%** | **52.86%** | **0.7524** | **TN=97, FP=20, FN=46, TP=37** |
| **Logistic Regression** | 64.50% | 58.33% | 50.60% | 54.19% | 0.7592 | TN=87, FP=30, FN=41, TP=42 |
| **Decision Tree** | 70.00% | 65.33% | 59.04% | 62.03% | 0.7968 | TN=91, FP=26, FN=34, TP=49 |
| **Random Forest (Tuned)** | 63.00% | 57.38% | 42.17% | 48.61% | 0.7525 | TN=91, FP=26, FN=48, TP=35 |
| **Gradient Boosting** | 67.00% | 61.64% | 54.22% | 57.69% | 0.7651 | TN=89, FP=28, FN=38, TP=45 |
| **XGBoost** | 64.00% | 57.75% | 49.40% | 53.25% | 0.7512 | TN=87, FP=30, FN=42, TP=41 |

### 5-Fold Stratified Cross-Validation Summary

| Model Name | Mean Accuracy | Std Accuracy | Mean Precision | Mean Recall | Mean F1 | Mean ROC-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Baseline Random Forest** | 0.6970 | 0.0264 | 0.6953 | 0.4784 | 0.5647 | 0.7719 |
| **Logistic Regression** | 0.6860 | 0.0235 | 0.6489 | 0.5435 | 0.5907 | 0.7686 |
| **Decision Tree** | 0.6810 | 0.0252 | 0.6277 | 0.5847 | 0.6041 | 0.7303 |
| **Gradient Boosting** | 0.6760 | 0.0208 | 0.6274 | 0.5484 | 0.5843 | 0.7562 |
| **XGBoost** | 0.6690 | 0.0271 | 0.6091 | 0.5653 | 0.5855 | 0.7420 |

---

## 5. Quickstart & Execution Guide

### Installation
```bash
# Clone the repository
cd customer-churn-prediction

# Install dependencies
pip install -r requirements.txt
```

### Running Unit Tests
```bash
PYTHONPATH=. pytest tests/ -v
```

### Reproducing Baseline & Training All Models
```bash
python -c "
from src.train import run_training_pipeline
results = run_training_pipeline()
print('Training successful!')
"
```

### Launching Streamlit Web App
```bash
streamlit run streamlit_app.py
```

---

## 6. Viva Voce & Academic Defense Questions

1. **Why is Accuracy an insufficient metric for customer churn prediction?**
   In churn datasets with class imbalance, a trivial model predicting "No Churn" achieves high accuracy while capturing 0% of churners. Recall and F1-score measure how effectively the business intervenes before churn occurs.

2. **How was data leakage strictly prevented in this project?**
   The dataset is partitioned into training (80%) and test (20%) sets prior to any scaling, imputation, or encoding. The `ColumnTransformer` is fitted exclusively on the training partition and then applied to transform the test partition.

3. **Why did we exclude `ContractType` in the unbiased experimentation?**
   In the synthetic data generation logic, `ContractType == 'Month-to-month'` directly determined the synthetic churn label probability. Training on `ContractType` created near-deterministic label leakage, overshadowing tenure and billing dynamics. Excluding `ContractType` tests whether behavioral features independently predict churn.

4. **What is the difference between Gini Feature Importance and Permutation Importance?**
   Gini importance measures the total reduction in impurity brought by a feature across all split nodes in the forest (biased toward continuous variables with many split opportunities). Permutation importance evaluates the actual drop in out-of-fold ROC-AUC when a feature's values are randomly shuffled.

---

## 7. License & Acknowledgments
This project is licensed under the MIT License. Developed for academic demonstration, machine learning benchmarking, and telecommunications churn risk management research.
