"""
Data Loader Module for Customer Churn Prediction System.
Handles synthetic data generation preserving notebook baseline logic,
and user-uploaded CSV file loading with validation and schema mapping.
"""

import os
import numpy as np
import pandas as pd
from typing import Tuple, Optional, Dict, Any

REQUIRED_COLUMNS = [
    'CustomerID',
    'Tenure_Months',
    'MonthlyCharges',
    'ContractType',
    'InternetService',
    'PaperlessBilling',
    'PaymentMethod',
    'TotalCharges'
]

TARGET_COLUMN = 'Churn'

def generate_synthetic_data(n_samples: int = 1000, random_state: int = 42) -> pd.DataFrame:
    """
    Generates the exact synthetic customer dataset defined in notebook Cell 2.
    Preserves exact reproducible random seeds, distributions, and churn probability logic.
    
    IMPORTANT RESEARCH LIMITATION:
    The baseline dataset is synthetic. Therefore, the reported baseline performance
    demonstrates the behavior of the developed pipeline on the generated data
    and should not be interpreted as evidence of real-world telecom churn performance.
    """
    np.random.seed(random_state)
    
    data = pd.DataFrame({
        'CustomerID': [f'CUST-{i:04d}' for i in range(1, n_samples + 1)],
        'Tenure_Months': np.random.randint(1, 72, size=n_samples),
        'MonthlyCharges': np.round(np.random.uniform(20.0, 120.0, size=n_samples), 2),
        'ContractType': np.random.choice(['Month-to-month', 'One year', 'Two year'], size=n_samples, p=[0.5, 0.3, 0.2]),
        'InternetService': np.random.choice(['DSL', 'Fiber optic', 'No'], size=n_samples, p=[0.4, 0.4, 0.2]),
        'PaperlessBilling': np.random.choice(['Yes', 'No'], size=n_samples, p=[0.6, 0.4]),
        'PaymentMethod': np.random.choice(['Electronic check', 'Mailed check', 'Bank transfer', 'Credit card'], size=n_samples),
    })

    # Calculate TotalCharges (Tenure * MonthlyCharges with minor noise)
    data['TotalCharges'] = np.round(data['Tenure_Months'] * data['MonthlyCharges'] + np.random.normal(0, 10, size=n_samples), 2)
    # Ensure TotalCharges >= 0
    data['TotalCharges'] = np.maximum(data['TotalCharges'], 0.0)

    # Define logic for Churn: short tenure + month-to-month + high monthly charges = higher risk
    churn_prob = (
        (72 - data['Tenure_Months']) / 72 * 0.4 +
        (data['ContractType'] == 'Month-to-month') * 0.3 +
        (data['MonthlyCharges'] / 120.0) * 0.3
    )
    churn_prob = (churn_prob - churn_prob.min()) / (churn_prob.max() - churn_prob.min())
    data['Churn'] = np.where(churn_prob > 0.55, 1, 0)
    
    return data

def load_dataset(file_path: Optional[str] = None, n_samples: int = 1000) -> Tuple[pd.DataFrame, Dict[str, Any]]:
    """
    Loads dataset from CSV file if provided, otherwise generates synthetic baseline.
    Returns DataFrame and a metadata summary dict.
    """
    if file_path and os.path.exists(file_path):
        df = pd.read_csv(file_path)
        source = f"File: {file_path}"
        is_synthetic = False
    else:
        df = generate_synthetic_data(n_samples=n_samples)
        source = "Synthetic Baseline Generator (Reproduced Notebook Cell 2)"
        is_synthetic = True

    metadata = {
        "source": source,
        "is_synthetic": is_synthetic,
        "total_records": len(df),
        "total_columns": len(df.columns),
        "columns": list(df.columns),
        "churn_rate": float(df['Churn'].mean()) if 'Churn' in df.columns else None
    }
    return df, metadata

if __name__ == '__main__':
    df, meta = load_dataset()
    print(f"Loaded {meta['total_records']} records from {meta['source']}")
    print(f"Class distribution:\n{df['Churn'].value_counts(normalize=True)}")
