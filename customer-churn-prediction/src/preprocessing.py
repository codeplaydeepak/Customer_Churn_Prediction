"""
Preprocessing Pipeline Module for Customer Churn Prediction System.
Implements reproducible ColumnTransformer with StandardScaler, OneHotEncoder,
and median/mode imputation.
Enforces strict data leakage prevention.
"""

from typing import List, Tuple, Optional
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.impute import SimpleImputer

DEFAULT_NUMERICAL_FEATURES = [
    'Tenure_Months',
    'MonthlyCharges',
    'TotalCharges',
    'MonthlyToTotalRatio',
    'IsNewCustomer'
]

DEFAULT_CATEGORICAL_FEATURES = [
    'InternetService',
    'PaperlessBilling',
    'PaymentMethod'
]

# When ContractType is retained (Baseline full feature set)
BASELINE_CATEGORICAL_FEATURES = [
    'ContractType',
    'InternetService',
    'PaperlessBilling',
    'PaymentMethod'
]
BASELINE_NUMERICAL_FEATURES = [
    'Tenure_Months',
    'MonthlyCharges',
    'TotalCharges'
]

def build_preprocessor(
    numerical_features: Optional[List[str]] = None,
    categorical_features: Optional[List[str]] = None
) -> ColumnTransformer:
    """
    Constructs a ColumnTransformer with median imputation + StandardScaler for numerical
    and most-frequent imputation + OneHotEncoder(handle_unknown='ignore') for categorical.
    """
    if numerical_features is None:
        numerical_features = DEFAULT_NUMERICAL_FEATURES
    if categorical_features is None:
        categorical_features = DEFAULT_CATEGORICAL_FEATURES

    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore', sparse_output=False))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numerical_features),
            ('cat', categorical_transformer, categorical_features)
        ],
        remainder='drop'
    )
    return preprocessor

def get_feature_names(preprocessor: ColumnTransformer, num_cols: List[str], cat_cols: List[str]) -> List[str]:
    """Extracts transformed feature names from fitted ColumnTransformer."""
    names = list(num_cols)
    try:
        cat_encoder = preprocessor.named_transformers_['cat'].named_steps['onehot']
        cat_names = list(cat_encoder.get_feature_names_out(cat_cols))
        names.extend(cat_names)
    except Exception:
        for c in cat_cols:
            names.append(f"{c}_encoded")
    return names
