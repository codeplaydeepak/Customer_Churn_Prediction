"""
Feature Engineering Module for Customer Churn Prediction System.
Implements, documents, and validates baseline and extended engineered features:
1. MonthlyToTotalRatio: MonthlyCharges / (TotalCharges + 1)
2. IsNewCustomer: Tenure_Months <= 6
"""

import pandas as pd
import numpy as np
from typing import Dict, Any

FEATURE_METADATA = {
    'MonthlyToTotalRatio': {
        'name': 'MonthlyToTotalRatio',
        'formula': 'MonthlyCharges / (TotalCharges + 1)',
        'purpose': 'Quantifies expenditure velocity and tenure-normalized billing burden.',
        'interpretation': 'Higher values indicate recent subscription, uncollected tenure discounts, or recent rate jumps.',
        'potential_limitation': 'Distorted for zero or near-zero TotalCharges without the smoothing constant (+1); volatile in first billing cycle.'
    },
    'IsNewCustomer': {
        'name': 'IsNewCustomer',
        'formula': 'Tenure_Months <= 6',
        'purpose': 'Captures onboarding vulnerability and early-lifecycle retention fragility.',
        'interpretation': 'Binary flag (1 for tenure <= 6 months, 0 otherwise). New subscribers lack habit formation and exhibit elevated churn rate.',
        'potential_limitation': 'Imposes an arbitrary sharp cutoff at 6 months; does not distinguish month 1 from month 6.'
    }
}

def engineer_features(df: pd.DataFrame, copy: bool = True) -> pd.DataFrame:
    """
    Applies the baseline feature engineering pipeline.
    Preserves existing features:
    - MonthlyToTotalRatio = MonthlyCharges / (TotalCharges + 1)
    - IsNewCustomer = (Tenure_Months <= 6).astype(int)
    """
    data = df.copy() if copy else df

    if 'MonthlyCharges' in data.columns and 'TotalCharges' in data.columns:
        data['MonthlyToTotalRatio'] = data['MonthlyCharges'] / (data['TotalCharges'] + 1.0)

    if 'Tenure_Months' in data.columns:
        data['IsNewCustomer'] = (data['Tenure_Months'] <= 6).astype(int)

    return data

def get_feature_documentation() -> Dict[str, Any]:
    """Returns documentation dictionary for all engineered features."""
    return FEATURE_METADATA
