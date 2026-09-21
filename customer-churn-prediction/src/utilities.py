"""
Utilities Module for Customer Churn Prediction System.
Handles serialization, directory setup, CSV conversions, formatting, and experiment tracking logs.
"""

import os
import json
from typing import Dict, Any, List
import pandas as pd

def ensure_directories(base_dir: str = '.'):
    """Creates required project directories."""
    dirs = [
        os.path.join(base_dir, 'data', 'raw'),
        os.path.join(base_dir, 'data', 'processed'),
        os.path.join(base_dir, 'data', 'sample'),
        os.path.join(base_dir, 'models'),
        os.path.join(base_dir, 'notebooks'),
        os.path.join(base_dir, 'reports', 'figures'),
        os.path.join(base_dir, 'reports', 'results'),
        os.path.join(base_dir, 'tests')
    ]
    for d in dirs:
        os.makedirs(d, exist_ok=True)

def save_experiment_record(record: Dict[str, Any], filepath: str):
    """Appends an experiment tracking record to a JSON or CSV file."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    if filepath.endswith('.json'):
        existing = []
        if os.path.exists(filepath):
            try:
                with open(filepath, 'r') as f:
                    existing = json.load(f)
            except Exception:
                existing = []
        existing.append(record)
        with open(filepath, 'w') as f:
            json.dump(existing, f, indent=2)
    elif filepath.endswith('.csv'):
        df = pd.DataFrame([record])
        if not os.path.exists(filepath):
            df.to_csv(filepath, index=False)
        else:
            df.to_csv(filepath, mode='a', header=False, index=False)

def export_dataframe_to_csv(df: pd.DataFrame, filepath: str):
    """Saves dataframe to CSV with parent directory creation."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    df.to_csv(filepath, index=False)
