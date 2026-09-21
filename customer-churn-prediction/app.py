"""
Customer Churn Prediction Interactive Application (Streamlit / CLI).
Supports dual execution:
1. Streamlit web application: streamlit run app.py
2. CLI mode: python app.py --predict --tenure 24 --monthly 85.50 --total 256.50
"""

import os
import sys
import argparse
import pandas as pd
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from src.data_loader import load_dataset, generate_synthetic_data
from src.feature_engineering import engineer_features
from src.prediction import predict_single_customer, predict_batch
from src.train import run_training_pipeline
from src.evaluation import evaluate_model
import joblib

MODEL_PATH = os.path.join(os.path.dirname(__file__), 'models', 'tuned_model.pkl')
BASELINE_PATH = os.path.join(os.path.dirname(__file__), 'models', 'baseline_random_forest.pkl')

def cli_mode():
    parser = argparse.ArgumentParser(description="Customer Churn Prediction CLI")
    parser.add_argument('--predict', action='store_true', help="Run single customer prediction")
    parser.add_argument('--tenure', type=int, default=24, help="Tenure in months")
    parser.add_argument('--monthly', type=float, default=85.50, help="Monthly charges")
    parser.add_argument('--total', type=float, default=256.50, help="Total charges")
    parser.add_argument('--contract', type=str, default='Month-to-month', help="Contract type")
    parser.add_argument('--internet', type=str, default='Fiber optic', help="Internet service")
    parser.add_argument('--paperless', type=str, default='No', help="Paperless billing (Yes/No)")
    parser.add_argument('--payment', type=str, default='Electronic check', help="Payment method")
    parser.add_argument('--train', action='store_true', help="Retrain models and save artifacts")

    args = parser.parse_args()

    if args.train:
        print("Executing reproducible training pipeline...")
        res = run_training_pipeline()
        print("Training complete! Evaluated models:", len(res['comparison']))
        return

    if args.predict or True:
        model_file = BASELINE_PATH if os.path.exists(BASELINE_PATH) else MODEL_PATH
        if not os.path.exists(model_file):
            print("Models not found. Retraining baseline pipeline...")
            run_training_pipeline()

        pipe = joblib.load(model_file)
        customer_data = {
            'CustomerID': 'CUST-CLI',
            'Tenure_Months': args.tenure,
            'MonthlyCharges': args.monthly,
            'TotalCharges': args.total,
            'ContractType': args.contract,
            'InternetService': args.internet,
            'PaperlessBilling': args.paperless,
            'PaymentMethod': args.payment
        }
        res = predict_single_customer(pipe, customer_data, exclude_contract_type=True)
        print("\n==================================================")
        print("          CUSTOMER CHURN PREDICTION RESULT        ")
        print("==================================================")
        print(f"Tenure: {args.tenure} months | Monthly: ${args.monthly:.2f} | Total: ${args.total:.2f}")
        print(f"Internet: {args.internet} | Paperless: {args.paperless} | Payment: {args.payment}")
        print(f"Predicted Probability: {res['churn_probability_percentage']:.2f}%")
        print(f"Prediction:            {res['prediction']}")
        print(f"Risk Segment:          {res['risk_level']}")
        print("--------------------------------------------------")
        print("Retention Suggestion:")
        print(res['retention_review_suggestion'])
        print("==================================================\n")

if __name__ == '__main__':
    cli_mode()
