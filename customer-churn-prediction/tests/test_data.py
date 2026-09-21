"""
Unit tests for data loader and validation modules.
"""

import pytest
import numpy as np
import pandas as pd
from src.data_loader import generate_synthetic_data, load_dataset, REQUIRED_COLUMNS
from src.validation import validate_dataset

def test_synthetic_data_generation_reproducibility():
    df1 = generate_synthetic_data(n_samples=1000, random_state=42)
    df2 = generate_synthetic_data(n_samples=1000, random_state=42)
    pd.testing.assert_frame_equal(df1, df2)

def test_synthetic_data_shape_and_columns():
    df = generate_synthetic_data(n_samples=1000, random_state=42)
    assert len(df) == 1000
    assert len(df.columns) == 9
    for col in REQUIRED_COLUMNS:
        assert col in df.columns
    assert 'Churn' in df.columns

def test_synthetic_data_class_balance():
    df = generate_synthetic_data(n_samples=1000, random_state=42)
    churn_rate = df['Churn'].mean()
    assert 0.35 <= churn_rate <= 0.45, f"Unexpected churn rate: {churn_rate}"

def test_validation_valid_data():
    df = generate_synthetic_data(n_samples=100, random_state=42)
    res = validate_dataset(df)
    assert res['is_valid'] is True
    assert len(res['errors']) == 0

def test_validation_missing_columns():
    df = pd.DataFrame({'Tenure_Months': [12], 'MonthlyCharges': [50.0]})
    res = validate_dataset(df)
    assert res['is_valid'] is False
    assert len(res['missing_columns']) > 0

def test_validation_duplicate_detection():
    df = generate_synthetic_data(n_samples=10, random_state=42)
    df_dup = pd.concat([df, df.iloc[[0]]], ignore_index=True)
    res = validate_dataset(df_dup)
    assert res['duplicate_count'] == 1
