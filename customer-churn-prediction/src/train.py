"""
Training Module for Customer Churn Prediction System.
Trains:
1. Baseline Random Forest (Preserves n_estimators=100, max_depth=5, random_state=42)
2. Logistic Regression
3. Decision Tree
4. Random Forest (Unbiased / Tuned)
5. Gradient Boosting
6. XGBoost / HistGradientBoosting
Handles class balancing and persists models to disk via joblib.
"""

import os
from typing import Dict, Any, Tuple, Optional
import numpy as np
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, HistGradientBoostingClassifier

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False

from .data_loader import generate_synthetic_data
from .feature_engineering import engineer_features
from .preprocessing import build_preprocessor, DEFAULT_NUMERICAL_FEATURES, DEFAULT_CATEGORICAL_FEATURES
from .evaluation import evaluate_model, analyze_thresholds

MODELS_DIR = os.path.join(os.path.dirname(__file__), '..', 'models')

def get_models_dict(random_state: int = 42, class_weight: Optional[str] = None) -> Dict[str, Any]:
    """Returns candidate estimators dictionary."""
    cw = 'balanced' if class_weight == 'balanced' else None
    
    models = {
        'Baseline Random Forest': RandomForestClassifier(
            n_estimators=100, max_depth=5, random_state=random_state, class_weight=cw
        ),
        'Logistic Regression': LogisticRegression(
            max_iter=1000, random_state=random_state, class_weight=cw
        ),
        'Decision Tree': DecisionTreeClassifier(
            max_depth=5, random_state=random_state, class_weight=cw
        ),
        'Random Forest (Tuned)': RandomForestClassifier(
            n_estimators=150, max_depth=6, min_samples_split=4, random_state=random_state, class_weight=cw
        ),
        'Gradient Boosting': GradientBoostingClassifier(
            n_estimators=100, learning_rate=0.1, max_depth=3, random_state=random_state
        )
    }

    if XGBOOST_AVAILABLE:
        models['XGBoost'] = xgb.XGBClassifier(
            n_estimators=100, max_depth=3, learning_rate=0.1, random_state=random_state, eval_metric='logloss'
        )
    else:
        models['Hist Gradient Boosting'] = HistGradientBoostingClassifier(
            max_iter=100, max_depth=3, random_state=random_state
        )

    return models

def run_training_pipeline(
    df: Optional[pd.DataFrame] = None,
    test_size: float = 0.20,
    random_state: int = 42,
    class_balancing: str = 'none',
    exclude_contract_type: bool = True,
    save_models: bool = True
) -> Dict[str, Any]:
    """
    Executes reproducible ML training pipeline:
    1. Loads / generates dataset
    2. Applies feature engineering
    3. Prevents data leakage by splitting train/test first
    4. Fits preprocessing only on train data
    5. Evaluates multiple algorithms
    6. Saves artifacts to models/
    """
    os.makedirs(MODELS_DIR, exist_ok=True)

    if df is None:
        raw_df = generate_synthetic_data(n_samples=1000, random_state=random_state)
    else:
        raw_df = df.copy()

    # Feature Engineering
    engineered_df = engineer_features(raw_df)

    # Feature selection
    if exclude_contract_type:
        drop_cols = ['CustomerID', 'Churn', 'ContractType']
        cat_cols = [c for c in DEFAULT_CATEGORICAL_FEATURES if c in engineered_df.columns]
        num_cols = [c for c in DEFAULT_NUMERICAL_FEATURES if c in engineered_df.columns]
    else:
        drop_cols = ['CustomerID', 'Churn']
        cat_cols = ['ContractType'] + [c for c in DEFAULT_CATEGORICAL_FEATURES if c in engineered_df.columns]
        num_cols = [c for c in DEFAULT_NUMERICAL_FEATURES if c in engineered_df.columns]

    X = engineered_df.drop(columns=[c for c in drop_cols if c in engineered_df.columns])
    y = engineered_df['Churn']

    # Step 15: Split FIRST to prevent data leakage
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )

    # Preprocessor built and fitted ONLY on training data
    preprocessor = build_preprocessor(numerical_features=num_cols, categorical_features=cat_cols)
    preprocessor.fit(X_train)

    cw = 'balanced' if class_balancing == 'class_weight' else None
    models = get_models_dict(random_state=random_state, class_weight=cw)

    comparison_results = []
    trained_pipelines = {}

    for name, clf in models.items():
        pipe = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', clf)
        ])
        pipe.fit(X_train, y_train)

        y_pred_proba = pipe.predict_proba(X_test)[:, 1]
        eval_metrics = evaluate_model(y_test, y_pred_proba, threshold=0.5)

        eval_metrics['model_name'] = name
        comparison_results.append(eval_metrics)
        trained_pipelines[name] = pipe

    # Baseline model
    baseline_pipe = trained_pipelines.get('Baseline Random Forest')

    # Selected model (Random Forest / Tuned)
    selected_name = 'Random Forest (Tuned)' if 'Random Forest (Tuned)' in trained_pipelines else 'Baseline Random Forest'
    selected_pipe = trained_pipelines[selected_name]

    if save_models:
        joblib.dump(preprocessor, os.path.join(MODELS_DIR, 'preprocessing_pipeline.pkl'))
        if baseline_pipe:
            joblib.dump(baseline_pipe, os.path.join(MODELS_DIR, 'baseline_random_forest.pkl'))
        joblib.dump(selected_pipe, os.path.join(MODELS_DIR, 'tuned_model.pkl'))

    # Threshold analysis for selected model
    selected_proba = selected_pipe.predict_proba(X_test)[:, 1]
    threshold_analysis = analyze_thresholds(y_test, selected_proba)

    return {
        'comparison': comparison_results,
        'selected_model_name': selected_name,
        'threshold_analysis': threshold_analysis,
        'train_shape': list(X_train.shape),
        'test_shape': list(X_test.shape),
        'class_distribution': {
            'train_churn_rate': float(y_train.mean()),
            'test_churn_rate': float(y_test.mean())
        }
    }
