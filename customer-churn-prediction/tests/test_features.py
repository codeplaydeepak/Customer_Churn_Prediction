"""
Unit tests for feature engineering module.
"""

import pytest
import pandas as pd
import numpy as np
from src.feature_engineering import engineer_features, get_feature_documentation

def test_engineered_feature_columns_added():
    df = pd.DataFrame({
        'CustomerID': ['C1', 'C2'],
        'Tenure_Months': [4, 24],
        'MonthlyCharges': [50.0, 100.0],
        'TotalCharges': [200.0, 2400.0]
    })
    res = engineer_features(df)
    assert 'MonthlyToTotalRatio' in res.columns
    assert 'IsNewCustomer' in res.columns

def test_is_new_customer_binary_rule():
    df = pd.DataFrame({
        'Tenure_Months': [1, 6, 7, 36],
        'MonthlyCharges': [30.0, 40.0, 50.0, 60.0],
        'TotalCharges': [30.0, 240.0, 350.0, 2160.0]
    })
    res = engineer_features(df)
    assert res['IsNewCustomer'].tolist() == [1, 1, 0, 0]

def test_monthly_to_total_ratio_calculation():
    df = pd.DataFrame({
        'Tenure_Months': [10],
        'MonthlyCharges': [100.0],
        'TotalCharges': [999.0]
    })
    res = engineer_features(df)
    expected = 100.0 / (999.0 + 1.0) # 0.1
    assert np.isclose(res['MonthlyToTotalRatio'].iloc[0], expected)

def test_feature_documentation_completeness():
    docs = get_feature_documentation()
    assert 'MonthlyToTotalRatio' in docs
    assert 'IsNewCustomer' in docs
    assert 'potential_limitation' in docs['MonthlyToTotalRatio']
    assert 'potential_limitation' in docs['IsNewCustomer']
