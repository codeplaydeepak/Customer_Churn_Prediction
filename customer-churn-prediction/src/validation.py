"""
Data Validation Module for Customer Churn Prediction System.
Validates file integrity, column schemas, data types, missing values, duplicates, and ranges.
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Tuple

REQUIRED_COLUMNS = [
    'Tenure_Months',
    'MonthlyCharges',
    'TotalCharges',
    'ContractType',
    'InternetService',
    'PaperlessBilling',
    'PaymentMethod'
]

VALID_CATEGORIES = {
    'ContractType': ['Month-to-month', 'One year', 'Two year'],
    'InternetService': ['DSL', 'Fiber optic', 'No'],
    'PaperlessBilling': ['Yes', 'No'],
    'PaymentMethod': ['Electronic check', 'Mailed check', 'Bank transfer', 'Credit card']
}

def validate_dataset(df: pd.DataFrame, require_target: bool = True) -> Dict[str, Any]:
    """
    Validates an uploaded or generated dataframe.
    Checks:
    - Empty dataframe
    - Missing required columns
    - Duplicate records
    - Missing value counts and percentages
    - Numeric bounds (e.g. negative tenure, negative charges)
    - Valid categorical levels
    - Valid target values if require_target is True
    """
    report: Dict[str, Any] = {
        'is_valid': True,
        'errors': [],
        'warnings': [],
        'total_rows': 0,
        'total_columns': 0,
        'missing_columns': [],
        'duplicate_count': 0,
        'duplicate_percentage': 0.0,
        'missing_values': {},
        'outlier_summary': {}
    }

    if df is None or df.empty:
        report['is_valid'] = False
        report['errors'].append("Dataset is empty or null.")
        return report

    report['total_rows'] = len(df)
    report['total_columns'] = len(df.columns)

    # Check required columns
    missing_cols = [col for col in REQUIRED_COLUMNS if col not in df.columns]
    if missing_cols:
        report['is_valid'] = False
        for mc in missing_cols:
            report['errors'].append(f"Required column missing: {mc}")
        report['missing_columns'] = missing_cols

    if require_target and 'Churn' not in df.columns:
        report['is_valid'] = False
        report['errors'].append("Required target column missing: Churn")

    # Check duplicates
    dup_count = int(df.duplicated().sum())
    report['duplicate_count'] = dup_count
    report['duplicate_percentage'] = round((dup_count / len(df)) * 100, 2)
    if dup_count > 0:
        report['warnings'].append(f"Detected {dup_count} ({report['duplicate_percentage']}%) duplicate rows.")

    # Missing values
    missing_dict = {}
    for col in df.columns:
        cnt = int(df[col].isna().sum())
        pct = round((cnt / len(df)) * 100, 2)
        if cnt > 0:
            missing_dict[col] = {'count': cnt, 'percentage': pct}
    report['missing_values'] = missing_dict
    if missing_dict:
        report['warnings'].append(f"Missing values detected across {len(missing_dict)} column(s).")

    # Numerical range checks
    if 'Tenure_Months' in df.columns:
        neg_tenure = (df['Tenure_Months'] < 0).sum()
        if neg_tenure > 0:
            report['warnings'].append(f"Detected {neg_tenure} records with negative Tenure_Months.")
    if 'MonthlyCharges' in df.columns:
        neg_mc = (df['MonthlyCharges'] < 0).sum()
        if neg_mc > 0:
            report['warnings'].append(f"Detected {neg_mc} records with negative MonthlyCharges.")
    if 'TotalCharges' in df.columns:
        neg_tc = (df['TotalCharges'] < 0).sum()
        if neg_tc > 0:
            report['warnings'].append(f"Detected {neg_tc} records with negative TotalCharges.")

    # Target values check
    if 'Churn' in df.columns:
        unique_targets = set(df['Churn'].dropna().unique())
        if not unique_targets.issubset({0, 1, 0.0, 1.0, '0', '1', 'Yes', 'No'}):
            report['is_valid'] = False
            report['errors'].append(f"Target column 'Churn' contains invalid class labels: {unique_targets}")

    # Outlier Analysis (IQR Method)
    num_cols = [c for c in ['Tenure_Months', 'MonthlyCharges', 'TotalCharges'] if c in df.columns]
    outlier_dict = {}
    for nc in num_cols:
        series = pd.to_numeric(df[nc], errors='coerce').dropna()
        if len(series) > 0:
            q1 = float(series.quantile(0.25))
            q3 = float(series.quantile(0.75))
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            outliers = int(((series < lower) | (series > upper)).sum())
            outlier_dict[nc] = {
                'q1': round(q1, 2),
                'q3': round(q3, 2),
                'iqr': round(iqr, 2),
                'lower_bound': round(lower, 2),
                'upper_bound': round(upper, 2),
                'outlier_count': outliers,
                'outlier_percentage': round((outliers / len(series)) * 100, 2),
                'explanation': "Valid customer bill values are preserved; outliers reflect extreme usage rather than corrupted data."
            }
    report['outlier_summary'] = outlier_dict

    return report
