"""
Unit tests for entire training pipeline and data leakage prevention.
"""

import pytest
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split

from src.data_loader import generate_synthetic_data
from src.feature_engineering import engineer_features
from src.preprocessing import build_preprocessor, DEFAULT_NUMERICAL_FEATURES, DEFAULT_CATEGORICAL_FEATURES
from src.train import run_training_pipeline
from src.evaluation import evaluate_model, analyze_thresholds

def test_data_leakage_split_before_scaling():
    """Verify that scaler mean and std come only from training data."""
    df = generate_synthetic_data(n_samples=200, random_state=42)
    df_eng = engineer_features(df)
    drop_cols = ['CustomerID', 'Churn', 'ContractType']
    X = df_eng.drop(columns=[c for c in drop_cols if c in df_eng.columns])
    y = df_eng['Churn']

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.20, random_state=42)

    num_cols = [c for c in DEFAULT_NUMERICAL_FEATURES if c in df_eng.columns]
    cat_cols = [c for c in DEFAULT_CATEGORICAL_FEATURES if c in df_eng.columns]

    preprocessor = build_preprocessor(numerical_features=num_cols, categorical_features=cat_cols)
    preprocessor.fit(X_train)

    scaler = preprocessor.named_transformers_['num'].named_steps['scaler']
    # Scaler mean must match X_train mean, NOT full X mean
    train_tenure_mean = X_train['Tenure_Months'].mean()
    assert np.isclose(scaler.mean_[0], train_tenure_mean, atol=1e-3)

def test_threshold_analysis_monotonicity():
    y_true = np.array([0, 0, 0, 1, 1, 1, 0, 1])
    y_proba = np.array([0.1, 0.2, 0.4, 0.6, 0.7, 0.8, 0.3, 0.9])
    thresh_results = analyze_thresholds(y_true, y_proba)
    assert len(thresh_results) == 9
    recalls = [r['recall'] for r in thresh_results]
    # Recall should be non-increasing with increasing threshold
    assert all(recalls[i] >= recalls[i+1] for i in range(len(recalls)-1))
