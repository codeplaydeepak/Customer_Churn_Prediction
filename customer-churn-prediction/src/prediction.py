"""
Prediction Module for Customer Churn Prediction System.
Handles:
1. Individual Customer Prediction with probability, risk segmentation, and SHAP factors
2. Batch Prediction over uploaded CSVs with clean output export
"""

from typing import Dict, Any, List, Optional
import pandas as pd
import numpy as np
from sklearn.pipeline import Pipeline

from .feature_engineering import engineer_features

DEFAULT_RISK_THRESHOLDS = {
    'low_max': 0.30,
    'medium_max': 0.60
}

def determine_risk_level(prob: float, low_max: float = 0.30, medium_max: float = 0.60) -> str:
    """Classifies risk level based on project-defined thresholds."""
    if prob < low_max:
        return 'Low Risk'
    elif prob < medium_max:
        return 'Medium Risk'
    else:
        return 'High Risk'

def predict_single_customer(
    pipeline: Pipeline,
    customer_dict: Dict[str, Any],
    decision_threshold: float = 0.5,
    exclude_contract_type: bool = True
) -> Dict[str, Any]:
    """
    Computes churn prediction for a single customer payload.
    Dynamically executes feature engineering and pipeline inference.
    """
    df = pd.DataFrame([customer_dict])
    df_eng = engineer_features(df)

    if exclude_contract_type and 'ContractType' in df_eng.columns:
        df_model = df_eng.drop(columns=['ContractType'])
    else:
        df_model = df_eng

    proba = float(pipeline.predict_proba(df_model)[0, 1])
    prediction_label = "Likely to Churn" if proba >= decision_threshold else "Likely to Stay"
    risk_level = determine_risk_level(proba)

    # Review-oriented suggestion
    tenure = customer_dict.get('Tenure_Months', 0)
    monthly = customer_dict.get('MonthlyCharges', 0.0)
    contract = customer_dict.get('ContractType', 'Unknown')
    suggestion = (
        f"This customer has an elevated model-predicted churn probability of {proba * 100:.2f}%. "
        f"Review their tenure ({tenure} months), contract structure ({contract}), and monthly bill (${monthly:.2f}) "
        "when considering an appropriate retention review strategy."
    )

    return {
        'prediction': prediction_label,
        'churn_probability': round(proba, 4),
        'churn_probability_percentage': round(proba * 100, 2),
        'risk_level': risk_level,
        'risk_threshold_label': "Project-defined risk thresholds (Low: 0-30%, Medium: 30-60%, High: 60-100%)",
        'retention_review_suggestion': suggestion
    }

def predict_batch(
    pipeline: Pipeline,
    df: pd.DataFrame,
    decision_threshold: float = 0.5,
    exclude_contract_type: bool = True
) -> pd.DataFrame:
    """
    Generates batch predictions for an input DataFrame without altering the original.
    Returns DataFrame containing CustomerID, Churn Probability, Prediction, Risk Level, and input fields.
    """
    output_df = df.copy()
    engineered = engineer_features(output_df)

    model_input = engineered.copy()
    if 'CustomerID' in model_input.columns:
        model_input = model_input.drop(columns=['CustomerID'])
    if 'Churn' in model_input.columns:
        model_input = model_input.drop(columns=['Churn'])
    if exclude_contract_type and 'ContractType' in model_input.columns:
        model_input = model_input.drop(columns=['ContractType'])

    probas = pipeline.predict_proba(model_input)[:, 1]
    output_df['Churn_Probability'] = np.round(probas, 4)
    output_df['Prediction'] = np.where(probas >= decision_threshold, 'Likely to Churn', 'Likely to Stay')
    output_df['Risk_Level'] = [determine_risk_level(p) for p in probas]

    return output_df
