"""
Evaluation Module for Customer Churn Prediction System.
Calculates Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix,
ROC Curve, PR Curve, and Threshold Analysis across 0.30 - 0.70.
"""

from typing import Dict, Any, List
import numpy as np
import pandas as pd
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report,
    roc_curve,
    precision_recall_curve,
    average_precision_score
)

def evaluate_model(y_true: np.ndarray, y_pred_proba: np.ndarray, threshold: float = 0.5) -> Dict[str, Any]:
    """
    Evaluates binary predictions at a given decision threshold.
    Returns comprehensive metrics dictionary.
    """
    y_true = np.asarray(y_true).astype(int)
    y_pred_proba = np.asarray(y_pred_proba)
    y_pred = (y_pred_proba >= threshold).astype(int)

    cm = confusion_matrix(y_true, y_pred)
    tn, fp, fn, tp = cm.ravel()

    acc = accuracy_score(y_true, y_pred)
    prec = precision_score(y_true, y_pred, zero_division=0)
    rec = recall_score(y_true, y_pred, zero_division=0)
    f1 = f1_score(y_true, y_pred, zero_division=0)
    
    try:
        auc = roc_auc_score(y_true, y_pred_proba)
    except Exception:
        auc = 0.5

    report = classification_report(y_true, y_pred, output_dict=True, zero_division=0)

    # ROC curve points
    fpr, tpr, roc_thresholds = roc_curve(y_true, y_pred_proba)
    
    # PR curve points
    pr_precision, pr_recall, pr_thresholds = precision_recall_curve(y_true, y_pred_proba)
    avg_prec = average_precision_score(y_true, y_pred_proba)

    return {
        'threshold': round(threshold, 2),
        'accuracy': round(float(acc), 4),
        'precision': round(float(prec), 4),
        'recall': round(float(rec), 4),
        'f1': round(float(f1), 4),
        'roc_auc': round(float(auc), 4),
        'confusion_matrix': {
            'tn': int(tn),
            'fp': int(fp),
            'fn': int(fn),
            'tp': int(tp)
        },
        'classification_report': report,
        'roc_curve': {
            'fpr': [round(x, 4) for x in fpr[::max(1, len(fpr)//40)]],
            'tpr': [round(x, 4) for x in tpr[::max(1, len(tpr)//40)]],
            'auc': round(float(auc), 4)
        },
        'pr_curve': {
            'precision': [round(x, 4) for x in pr_precision[::max(1, len(pr_precision)//40)]],
            'recall': [round(x, 4) for x in pr_recall[::max(1, len(pr_recall)//40)]],
            'avg_precision': round(float(avg_prec), 4)
        }
    }

def analyze_thresholds(y_true: np.ndarray, y_pred_proba: np.ndarray) -> List[Dict[str, Any]]:
    """
    Evaluates classification performance across user-specified thresholds:
    0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70.
    """
    thresholds = [0.30, 0.35, 0.40, 0.45, 0.50, 0.55, 0.60, 0.65, 0.70]
    results = []
    for t in thresholds:
        eval_res = evaluate_model(y_true, y_pred_proba, threshold=t)
        results.append({
            'threshold': t,
            'precision': eval_res['precision'],
            'recall': eval_res['recall'],
            'f1': eval_res['f1'],
            'accuracy': eval_res['accuracy'],
            'tp': eval_res['confusion_matrix']['tp'],
            'fp': eval_res['confusion_matrix']['fp'],
            'fn': eval_res['confusion_matrix']['fn'],
            'tn': eval_res['confusion_matrix']['tn']
        })
    return results
