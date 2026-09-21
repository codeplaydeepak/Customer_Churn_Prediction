import React from 'react';
import { ActiveTab } from '../types';
import {
  Download,
  RotateCcw,
  Upload,
  CheckCircle2,
  SlidersHorizontal,
  FileDown
} from 'lucide-react';
import { downloadCSV } from '../mlEngine';
import { BASELINE_CUSTOMERS } from '../data/baselineData';

interface TopNavbarProps {
  activeTab: ActiveTab;
  datasetSource: 'synthetic' | 'uploaded';
  onResetToBaseline: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  decisionThreshold: number;
  setDecisionThreshold: (t: number) => void;
}

const TAB_TITLES: Record<ActiveTab, { title: string; subtitle: string }> = {
  dashboard: {
    title: 'Executive & Operational Dashboard',
    subtitle: 'High-level KPI metrics, subscriber churn rates, and portfolio risk distributions'
  },
  dataset: {
    title: 'Dataset Exploration & Schema',
    subtitle: 'Raw tabular inspection, feature types, five-number statistical summaries, and exports'
  },
  data_quality: {
    title: 'Data Quality & Outlier Diagnostics',
    subtitle: 'Interquartile range (IQR) outlier audits, missing value verification, and integrity checks'
  },
  eda: {
    title: 'Exploratory Data Analysis (EDA)',
    subtitle: 'Subscriber churn distributions, numerical histograms, and categorical cross-tabulations'
  },
  feature_engineering: {
    title: 'Feature Engineering Lab',
    subtitle: 'Mathematical formulation, domain rationale, limitations, and live ratio calculators'
  },
  model_training: {
    title: 'Interactive Model Training Pipeline',
    subtitle: 'Configurable estimators, cross-validation partitions, hyperparameter tuning, and class balancing'
  },
  model_comparison: {
    title: 'Model Benchmark Comparison',
    subtitle: 'Rigorous benchmark of 6 algorithms: Accuracy, Precision, Recall, F1, and ROC-AUC'
  },
  evaluation: {
    title: 'In-Depth Model Evaluation',
    subtitle: 'Confusion matrix, interactive ROC curve, PR curve, and threshold sensitivity analysis'
  },
  explainability: {
    title: 'Explainable AI & SHAP Attributions',
    subtitle: 'Gini tree importance, permutation importance, and local SHAP factor waterfalls'
  },
  prediction: {
    title: 'Individual Customer Churn Prediction',
    subtitle: 'Real-time inference, probability estimation, risk tiering, and retention suggestions'
  },
  batch_prediction: {
    title: 'Batch Customer Scoring',
    subtitle: 'Bulk CSV evaluation, multi-customer inference, risk segmentation, and CSV export'
  },
  risk_analysis: {
    title: 'Subscriber Risk Stratification',
    subtitle: 'Low, Medium, and High risk cohort breakdown and actionable portfolio review'
  },
  business_insights: {
    title: 'Business Insights & Retention Strategy',
    subtitle: 'Empirical pattern analysis, causal caveats, and ContractType feature-exclusion study'
  },
  research: {
    title: 'Academic Research Report',
    subtitle: 'Full paper format, 12-dimension literature synthesis, experimental logs, and limitations'
  },
  about: {
    title: 'About & Comprehensive Viva Voce Guide',
    subtitle: '34 curated B.Tech CSE Viva examination questions with rigorous technical answers'
  }
};

export const TopNavbar: React.FC<TopNavbarProps> = ({
  activeTab,
  datasetSource,
  onResetToBaseline,
  onFileUpload,
  decisionThreshold,
  setDecisionThreshold
}) => {
  const current = TAB_TITLES[activeTab] || { title: 'Churn System', subtitle: '' };

  const handleDownloadDataset = () => {
    downloadCSV('telecom_churn_dataset.csv', BASELINE_CUSTOMERS);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-10 shrink-0">
      <div>
        <h2 className="text-base font-bold text-slate-800 tracking-tight flex items-center gap-2">
          {current.title}
          <span className="text-xs font-normal text-slate-500 hidden md:inline">|</span>
          <span className="text-xs font-normal text-slate-500 hidden md:inline">{current.subtitle}</span>
        </h2>
      </div>

      <div className="flex items-center gap-3">
        {/* Decision Threshold Controller */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-slate-600 font-medium">Decision Threshold:</span>
          <span className="font-mono font-bold text-indigo-600">{(decisionThreshold ?? 0.5).toFixed(2)}</span>
          <input
            type="range"
            min="0.30"
            max="0.70"
            step="0.05"
            value={decisionThreshold}
            onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        {/* Upload Dataset Button */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium cursor-pointer transition shadow-xs">
          <Upload className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Upload CSV</span>
          <input type="file" accept=".csv" onChange={onFileUpload} className="hidden" />
        </label>

        {/* Export Data Button */}
        <button
          onClick={handleDownloadDataset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium transition shadow-xs"
          title="Download full dataset CSV"
        >
          <FileDown className="w-3.5 h-3.5 text-slate-500" />
          <span className="hidden sm:inline">Export Dataset</span>
        </button>

        {/* Reset Button */}
        {datasetSource === 'uploaded' && (
          <button
            onClick={onResetToBaseline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium hover:bg-rose-100 transition shadow-xs"
            title="Reset to synthetic baseline dataset"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
            <span>Reset Baseline</span>
          </button>
        )}
      </div>
    </header>
  );
};
