"""
Risk Analysis Module for Customer Churn Prediction System.
Segments customer base into Low, Medium, and High Risk tiers.
Calculates cohort KPIs (count, %, avg prob, avg tenure, avg monthly charges)
and isolates high-risk portfolios for retention review.
"""

from typing import Dict, Any, List
import pandas as pd
import numpy as np

def segment_customer_risk(df_with_predictions: pd.DataFrame) -> Dict[str, Any]:
    """
    Computes risk tier statistics across the customer population:
    - Low Risk: [0.0, 0.30)
    - Medium Risk: [0.30, 0.60)
    - High Risk: [0.60, 1.00]
    """
    df = df_with_predictions.copy()
    if 'Churn_Probability' not in df.columns and 'predictedProbability' in df.columns:
        df['Churn_Probability'] = df['predictedProbability']

    total = len(df)
    if total == 0:
        return {'segments': [], 'summary': {}}

    def assign_tier(p):
        if p < 0.30:
            return 'Low Risk'
        elif p < 0.60:
            return 'Medium Risk'
        else:
            return 'High Risk'

    df['Risk_Tier'] = df['Churn_Probability'].apply(assign_tier)

    segments = []
    for tier in ['Low Risk', 'Medium Risk', 'High Risk']:
        sub = df[df['Risk_Tier'] == tier]
        count = len(sub)
        pct = round((count / total) * 100, 2)
        avg_prob = round(float(sub['Churn_Probability'].mean() * 100), 2) if count > 0 else 0.0
        avg_tenure = round(float(sub['Tenure_Months'].mean()), 2) if 'Tenure_Months' in sub.columns and count > 0 else 0.0
        avg_charges = round(float(sub['MonthlyCharges'].mean()), 2) if 'MonthlyCharges' in sub.columns and count > 0 else 0.0

        segments.append({
            'tier': tier,
            'count': count,
            'percentage': pct,
            'avg_churn_probability': avg_prob,
            'avg_tenure_months': avg_tenure,
            'avg_monthly_charges': avg_charges
        })

    # High risk portfolio
    high_risk_df = df[df['Risk_Tier'] == 'High Risk'].sort_values(by='Churn_Probability', ascending=False)

    return {
        'segments': segments,
        'high_risk_count': len(high_risk_df),
        'high_risk_percentage': round((len(high_risk_df) / total) * 100, 2),
        'high_risk_records': high_risk_df.to_dict(orient='records')
    }
