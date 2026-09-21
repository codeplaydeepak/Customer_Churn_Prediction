"""
Hyperparameter Tuning Module for Customer Churn Prediction System.
Performs GridSearchCV on training data using StratifiedKFold.
The test set is strictly sequestered until final evaluation.
"""

from typing import Dict, Any, Optional
import numpy as np
import pandas as pd
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

from .data_loader import generate_synthetic_data
from .feature_engineering import engineer_features
from .preprocessing import build_preprocessor, DEFAULT_NUMERICAL_FEATURES, DEFAULT_CATEGORICAL_FEATURES
from .evaluation import evaluate_model

def tune_random_forest(
    df: Optional[pd.DataFrame] = None,
    random_state: int = 42,
    cv_folds: int = 5
) -> Dict[str, Any]:
    """
    Executes GridSearchCV over Random Forest hyperparameter space.
    Search grid:
    - n_estimators: [50, 100, 150]
    - max_depth: [4, 6, 8]
    - min_samples_split: [2, 4, 6]
    - min_samples_leaf: [1, 2, 4]
    """
    if df is None:
        raw_df = generate_synthetic_data(n_samples=1000, random_state=random_state)
    else:
        raw_df = df.copy()

    engineered_df = engineer_features(raw_df)
    drop_cols = ['CustomerID', 'Churn', 'ContractType']
    cat_cols = [c for c in DEFAULT_CATEGORICAL_FEATURES if c in engineered_df.columns]
    num_cols = [c for c in DEFAULT_NUMERICAL_FEATURES if c in engineered_df.columns]

    X = engineered_df.drop(columns=[c for c in drop_cols if c in engineered_df.columns])
    y = engineered_df['Churn']

    # Strict isolation: 80% train, 20% test
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=random_state, stratify=y
    )

    preprocessor = build_preprocessor(numerical_features=num_cols, categorical_features=cat_cols)

    pipe = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(random_state=random_state))
    ])

    param_grid = {
        'classifier__n_estimators': [50, 100, 150],
        'classifier__max_depth': [4, 6, 8],
        'classifier__min_samples_split': [2, 4],
        'classifier__min_samples_leaf': [1, 2]
    }

    cv = StratifiedKFold(n_splits=cv_folds, shuffle=True, random_state=random_state)
    grid_search = GridSearchCV(
        pipe, param_grid, cv=cv, scoring='roc_auc', n_jobs=-1, return_train_score=False
    )
    grid_search.fit(X_train, y_train)

    best_pipe = grid_search.best_estimator_
    test_proba = best_pipe.predict_proba(X_test)[:, 1]
    test_metrics = evaluate_model(y_test, test_proba, threshold=0.5)

    return {
        'best_params': {k.replace('classifier__', ''): v for k, v in grid_search.best_params_.items()},
        'best_cv_roc_auc': round(float(grid_search.best_score_), 4),
        'test_metrics': test_metrics,
        'search_space_description': param_grid,
        'leakage_prevention_confirmation': "Tuning was conducted solely across training cross-validation folds. The test set was touched exclusively for final evaluation."
    }
