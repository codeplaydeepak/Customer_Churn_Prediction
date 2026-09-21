# Customer Churn Prediction System

A production-style analytics dashboard for telecom churn risk prediction, model evaluation, feature engineering, and business insight generation.

## Overview

This project combines:
- a React + Vite dashboard for interactive exploration
- a customer churn risk engine with threshold-based decisioning
- feature engineering and explainability views
- a Python ML pipeline for training and validation

## Prerequisites

- Node.js 18+
- Python 3.10+

## Frontend setup

1. Install dependencies:
   `npm install`
2. Start the development server:
   `npm run dev`
3. Build for production:
   `npm run build`

## Python ML setup

From the project root:

```bash
python -m pip install -r customer-churn-prediction/requirements.txt
```

Then run the pipeline tests:

```bash
python -m pytest customer-churn-prediction/tests -q
```

## Project structure

- `src/` - React application and dashboard views
- `customer-churn-prediction/` - Python training, validation, and reporting pipeline
- `data/` - processed and raw datasets
- `reports/` - JSON outputs and analysis artifacts
