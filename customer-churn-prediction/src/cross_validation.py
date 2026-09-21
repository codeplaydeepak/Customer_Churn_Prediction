"""
Cross-Validation Module for Customer Churn Prediction System.
Performs 5-fold Stratified Cross-Validation on preprocessing + classifier pipelines.
Prevents data leakage by ensuring preprocessing is fitted on each training fold independently.
"""

from typing import Dict, Any, List, Optional
import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score

from .data_loader import generate_synthetic_data
from .feature_engineering import engineer_features
from .preprocessing import build_preprocessor, DEFAULT_NUMERICAL_FEATURES, DEFAULT_CATEGORICAL_FEATURES
from .train import get_models_dict

def run_stratified_cv(
    df: Optional[pd.DataFrame] = None,
    n_splits: int = 5,
    random_state: int = 42,
    exclude_contract_type: bool = True
) -> List[Dict[str, Any]]:
    """
    Executes K-fold Stratified Cross Validation across candidate models.
    Reports Mean & Std for Accuracy, Precision, Recall, F1, and ROC-AUC.
    """
    if df is None:
        raw_df = generate_synthetic_data(n_samples=1000, random_state=random_state)
    else:
        raw_df = df.copy()

    engineered_df = engineer_features(raw_df)

    if exclude_contract_type:
        drop_cols = ['CustomerID', 'Churn', 'ContractType']
        cat_cols = [c for c in DEFAULT_CATEGORICAL_FEATURES if c in engineered_df.columns]
    else:
        drop_cols = ['CustomerID', 'Churn']
        cat_cols = ['ContractType'] + [c for c in DEFAULT_CATEGORICAL_FEATURES if c in engineered_df.columns]

    num_cols = [c for c in DEFAULT_NUMERICAL_FEATURES if c in engineered_df.columns]

    X = engineered_df.drop(columns=[c for c in drop_cols if c in engineered_df.columns])
    y = engineered_df['Churn'].values

    models = get_models_dict(random_state=random_state)
    cv_summary = []

    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=random_state)

    for name, clf in models.items():
        acc_scores = []
        prec_scores = []
        rec_scores = []
        f1_scores = []
        auc_scores = []

        for train_idx, val_idx in skf.split(X, y):
            X_tr, X_val = X.iloc[train_idx], X.iloc[val_idx]
            y_tr, y_val = y[train_idx], y[val_idx]

            preprocessor = build_preprocessor(numerical_features=num_cols, categorical_features=cat_cols)
            pipe = Pipeline(steps=[
                ('preprocessor', preprocessor),
                ('classifier', clf)
            ])
            pipe.fit(X_tr, y_tr)

            y_pred = pipe.predict(X_val)
            y_proba = pipe.predict_proba(X_val)[:, 1]

            acc_scores.append(accuracy_score(y_val, y_pred))
            prec_scores.append(precision_score(y_val, y_pred, zero_division=0))
            rec_scores.append(recall_score(y_val, y_pred, zero_division=0))
            f1_scores.append(f1_score(y_val, y_pred, zero_division=0))
            try:
                auc_scores.append(roc_auc_score(y_val, y_proba))
            except Exception:
                auc_scores.append(0.5)

        cv_summary.append({
            'model': name,
            'mean_accuracy': round(float(np.mean(acc_scores)), 4),
            'std_accuracy': round(float(np.std(acc_scores)), 4),
            'mean_precision': round(float(np.mean(prec_scores)), 4),
            'std_precision': round(float(np.std(prec_scores)), 4),
            'mean_recall': round(float(np.mean(rec_scores)), 4),
            'std_recall': round(float(np.std(rec_scores)), 4),
            'mean_f1': round(float(np.mean(f1_scores)), 4),
            'std_f1': round(float(np.std(f1_scores)), 4),
            'mean_roc_auc': round(float(np.mean(auc_scores)), 4),
            'std_roc_auc': round(float(np.std(auc_scores)), 4),
            'n_folds': n_splits,
            'cv_explanation': (
                "5-fold stratified cross-validation partitions the dataset into 5 balanced folds, "
                "fitting the preprocessing and estimator on 4 folds and validating on the remaining fold. "
                "This guarantees that evaluation is invariant to a single lucky or unlucky split, "
                "providing a mathematically grounded estimate of out-of-sample generalization."
            )
        })

    return cv_summary
