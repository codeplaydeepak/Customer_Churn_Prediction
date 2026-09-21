"""
Unit tests for individual and batch prediction.
"""

import pytest
import numpy as np
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier

from src.data_loader import generate_synthetic_data
from src.feature_engineering import engineer_features
from src.preprocessing import build_preprocessor, DEFAULT_NUMERICAL_FEATURES, DEFAULT_CATEGORICAL_FEATURES
from src.prediction import determine_risk_level, predict_single_customer, predict_batch

@pytest.fixture
def trained_pipeline():
    df = generate_synthetic_data(n_samples=200, random_state=42)
    df_eng = engineer_features(df)
    drop_cols = ['CustomerID', 'Churn', 'ContractType']
    X = df_eng.drop(columns=[c for c in drop_cols if c in df_eng.columns])
    y = df_eng['Churn']

    num_cols = [c for c in DEFAULT_NUMERICAL_FEATURES if c in df_eng.columns]
    cat_cols = [c for c in DEFAULT_CATEGORICAL_FEATURES if c in df_eng.columns]

    preprocessor = build_preprocessor(numerical_features=num_cols, categorical_features=cat_cols)
    pipe = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=20, max_depth=4, random_state=42))
    ])
    pipe.fit(X, y)
    return pipe

def test_determine_risk_level_bounds():
    assert determine_risk_level(0.15) == 'Low Risk'
    assert determine_risk_level(0.45) == 'Medium Risk'
    assert determine_risk_level(0.75) == 'High Risk'

def test_predict_single_customer(trained_pipeline):
    sample_cust = {
        'CustomerID': 'CUST-TEST',
        'Tenure_Months': 24,
        'MonthlyCharges': 85.50,
        'TotalCharges': 256.50,
        'ContractType': 'Month-to-month',
        'InternetService': 'Fiber optic',
        'PaperlessBilling': 'No',
        'PaymentMethod': 'Electronic check'
    }
    result = predict_single_customer(trained_pipeline, sample_cust)
    assert 'churn_probability' in result
    assert 0.0 <= result['churn_probability'] <= 1.0
    assert result['prediction'] in ['Likely to Churn', 'Likely to Stay']
    assert result['risk_level'] in ['Low Risk', 'Medium Risk', 'High Risk']

def test_predict_batch(trained_pipeline):
    df = generate_synthetic_data(n_samples=25, random_state=42)
    batch_res = predict_batch(trained_pipeline, df)
    assert len(batch_res) == 25
    assert 'Churn_Probability' in batch_res.columns
    assert 'Prediction' in batch_res.columns
    assert 'Risk_Level' in batch_res.columns
    # Ensure original df was not mutated destructively
    assert 'Tenure_Months' in batch_res.columns
