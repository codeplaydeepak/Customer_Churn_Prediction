export interface CustomerRecord {
  CustomerID: string;
  Tenure_Months: number;
  MonthlyCharges: number;
  ContractType: 'Month-to-month' | 'One year' | 'Two year' | string;
  InternetService: 'DSL' | 'Fiber optic' | 'No' | string;
  PaperlessBilling: 'Yes' | 'No' | string;
  PaymentMethod: 'Electronic check' | 'Mailed check' | 'Bank transfer' | 'Credit card' | string;
  TotalCharges: number;
  MonthlyToTotalRatio?: number;
  IsNewCustomer?: number;
  Churn: number; // 0: Retained, 1: Churned
  predictedProbability?: number;
  predictedLabel?: number;
  riskSegment?: 'Low' | 'Medium' | 'High';
}

export interface ModelMetrics {
  name?: string;
  modelName: string;
  model_name?: string;
  key?: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1?: number;
  f1Score: number;
  rocAuc: number;
  roc_auc?: number;
  cvMeanAccuracy?: number;
  cvStdAccuracy?: number;
  cvMeanPrecision?: number;
  cvMeanRecall?: number;
  cvMeanF1?: number;
  cvMeanRocAuc?: number;
  tn?: number;
  fp?: number;
  fn?: number;
  tp?: number;
  confusionMatrix?: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  confusion_matrix?: {
    tn: number;
    fp: number;
    fn: number;
    tp: number;
  };
  notes?: string;
}

export interface ModelConfig {
  estimator: string;
  testSplit: number;
  randomSeed: number;
  cvFolds: number;
  hyperparameterTuning: boolean;
  classBalancing: boolean;
  excludeContractType: boolean;
}

export interface ThresholdEvaluation {
  threshold: number;
  accuracy?: number;
  precision: number;
  recall: number;
  f1: number;
  tp: number;
  fp: number;
  tn: number;
  fn: number;
}

export interface FeatureImportanceItem {
  feature: string;
  importance: number;
  importance_percentage?: number;
  type?: string;
  std?: number;
  category?: 'Numerical' | 'Categorical' | 'Engineered';
  description?: string;
}

export interface ShapContribution {
  feature: string;
  value: string | number;
  impact: number;
  direction: 'increases_churn' | 'decreases_churn';
  explanation: string;
}

export interface PredictionResult {
  churnProbability: number;
  prediction: 'Likely to Churn' | 'Likely to Stay';
  riskLevel: 'Low' | 'Medium' | 'High';
  riskThresholdLabel: string;
  topPositiveFactors: ShapContribution[];
  topNegativeFactors: ShapContribution[];
  retentionSuggestion: string;
}

export interface OutlierStats {
  feature: string;
  q1: number;
  q3: number;
  iqr: number;
  lowerBound: number;
  upperBound: number;
  outlierCount: number;
  outlierPercentage: number;
  treatment: string;
}

export type ActiveTab =
  | 'dashboard'
  | 'dataset'
  | 'data_quality'
  | 'eda'
  | 'feature_engineering'
  | 'model_training'
  | 'model_comparison'
  | 'evaluation'
  | 'explainability'
  | 'prediction'
  | 'batch_prediction'
  | 'risk_analysis'
  | 'business_insights'
  | 'research'
  | 'about';
