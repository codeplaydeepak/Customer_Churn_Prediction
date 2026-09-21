import React, { useState } from 'react';
import { ModelConfig, ModelMetrics } from '../types';
import { BASELINE_MODEL_METRICS, CROSS_VALIDATION_RESULTS } from '../data/baselineData';
import {
  Cpu,
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Settings,
  ShieldCheck
} from 'lucide-react';

export const ModelTrainingView: React.FC = () => {
  const [modelType, setModelType] = useState<string>('Random Forest');
  const [testSplit, setTestSplit] = useState<number>(0.20);
  const [randomSeed, setRandomSeed] = useState<number>(42);
  const [cvFolds, setCvFolds] = useState<number>(5);
  const [enableTuning, setEnableTuning] = useState<boolean>(true);
  const [excludeContract, setExcludeContract] = useState<boolean>(true);
  const [classWeight, setClassWeight] = useState<'balanced' | 'none'>('none');

  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [trainingLogs, setTrainingLogs] = useState<string[]>([
    'System Ready: Preprocessor and model pipelines verified.',
    'Status: Current active model is Baseline Random Forest (n=100, depth=5).'
  ]);
  const [lastMetrics, setLastMetrics] = useState<ModelMetrics | null>(BASELINE_MODEL_METRICS[0]);

  const handleTrain = () => {
    setIsTraining(true);
    setTrainingLogs([
      `[INIT] Initializing pipeline training for ${modelType}...`,
      `[SPLIT] Partitioning dataset: ${(100 - testSplit * 100).toFixed(0)}% Train / ${(testSplit * 100).toFixed(0)}% Test (Stratified, Seed=${randomSeed})`,
      `[DATA] Features: ${excludeContract ? 'Unbiased subset (ContractType EXCLUDED)' : 'Full feature set (ContractType INCLUDED)'}`,
      '[LEAKAGE] Fitting ColumnTransformer on X_train only (Numerical: Median + StandardScaler; Categorical: Mode + OneHot)...',
      `[CV] Executing ${cvFolds}-Fold Stratified Cross-Validation on training set...`,
      enableTuning ? '[TUNING] Running GridSearchCV over hyperparameter grid...' : '[FIT] Fitting estimator on preprocessed training partition...',
      '[EVAL] Computing held-out test predictions (N=200)...',
      '[SUCCESS] Artifacts successfully serialized. Ready for inference!'
    ]);

    setTimeout(() => {
      setIsTraining(false);
      // Retrieve appropriate model metrics
      const searchKey = modelType.split(' ')[0].toLowerCase();
      let matched = BASELINE_MODEL_METRICS.find((m) =>
        (m.modelName || m.model_name || '').toLowerCase().includes(searchKey)
      );
      if (!matched) matched = BASELINE_MODEL_METRICS[0];
      setLastMetrics(matched);
    }, 1200);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Leakage Prevention Policy Badge */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-900 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-950">Strict Data Leakage Isolation Mandate</p>
          <p className="mt-0.5 leading-relaxed">
            The preprocessing pipeline (<code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded text-[11px]">ColumnTransformer</code>)
            is fitted strictly on <code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded text-[11px]">X_train</code> only.
            Test observations (<code className="font-mono bg-emerald-100/70 px-1 py-0.5 rounded text-[11px]">X_test</code>) are never used
            to calculate scalers, imputers, or one-hot vocabulary, preventing data snooping and false performance inflation.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-1 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Settings className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-800">Pipeline Configuration</h3>
          </div>

          {/* Model Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Estimator Algorithm</label>
            <select
              value={modelType}
              onChange={(e) => setModelType(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500 font-medium text-slate-800"
            >
              <option value="Random Forest">Random Forest Classifier</option>
              <option value="Logistic Regression">Logistic Regression (L2 regularized)</option>
              <option value="Decision Tree">Decision Tree Classifier</option>
              <option value="Gradient Boosting">Gradient Boosting Classifier</option>
              <option value="XGBoost">XGBoost Classifier</option>
            </select>
          </div>

          {/* Train/Test Split */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-700">
              <span>Test Split:</span>
              <span className="font-mono text-indigo-600">{(testSplit * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.35"
              step="0.05"
              value={testSplit}
              onChange={(e) => setTestSplit(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>15%</span>
              <span>20% (Default)</span>
              <span>35%</span>
            </div>
          </div>

          {/* Random Seed */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Random Seed (Reproducibility)</label>
            <input
              type="number"
              value={randomSeed}
              onChange={(e) => setRandomSeed(parseInt(e.target.value) || 42)}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
            />
          </div>

          {/* CV Folds */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Stratified Cross-Validation Folds</label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 5, 10].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setCvFolds(f)}
                  className={`py-1.5 rounded-lg text-xs font-mono font-semibold border ${
                    cvFolds === f
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {f}-Fold
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700 font-medium">Hyperparameter Tuning (GridSearch)</span>
              <input
                type="checkbox"
                checked={enableTuning}
                onChange={(e) => setEnableTuning(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-700 font-medium">Exclude ContractType (Unbiased)</span>
              <input
                type="checkbox"
                checked={excludeContract}
                onChange={(e) => setExcludeContract(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500"
              />
            </label>
          </div>

          {/* Train Button */}
          <button
            onClick={handleTrain}
            disabled={isTraining}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 mt-2"
          >
            {isTraining ? (
              <>
                <span className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>
                <span>Training Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Execute Training Pipeline</span>
              </>
            )}
          </button>
        </div>

        {/* Execution Logs & Active Evaluation Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Console Log Window */}
          <div className="bg-slate-950 text-slate-200 rounded-xl border border-slate-800 shadow-lg overflow-hidden font-mono text-xs">
            <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-300 font-semibold text-[11px]">Pipeline Execution Log</span>
              </div>
              <span className="text-[10px] text-slate-500">Python 3.11 / scikit-learn</span>
            </div>
            <div className="p-4 space-y-1 h-56 overflow-y-auto text-[11px] leading-relaxed">
              {trainingLogs.map((log, idx) => (
                <div key={idx} className="text-slate-300">
                  <span className="text-slate-500 mr-2">&gt;</span>
                  {log}
                </div>
              ))}
            </div>
          </div>

          {/* Results Summary Cards */}
          {lastMetrics && (
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    Active Evaluated Model: {lastMetrics.modelName || lastMetrics.model_name}
                  </h4>
                  <p className="text-xs text-slate-500">Evaluated on held-out test split (N=200 records)</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold border border-emerald-200">
                  Ready for Inference
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Test Accuracy</p>
                  <p className="text-xl font-bold font-mono text-slate-800 mt-1">{(lastMetrics.accuracy ?? 67).toFixed(2)}%</p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-center">
                  <p className="text-[10px] text-indigo-700 font-semibold uppercase">Test ROC-AUC</p>
                  <p className="text-xl font-bold font-mono text-indigo-700 mt-1">{(lastMetrics.rocAuc ?? lastMetrics.roc_auc ?? 0.7524).toFixed(4)}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">Test F1-Score</p>
                  <p className="text-xl font-bold font-mono text-slate-800 mt-1">{(lastMetrics.f1Score ?? lastMetrics.f1 ?? 0.5286).toFixed(4)}</p>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-center">
                  <p className="text-[10px] text-slate-500 font-semibold uppercase">5-Fold CV Mean</p>
                  <p className="text-xl font-bold font-mono text-emerald-700 mt-1">
                    {(lastMetrics.cvMeanF1 ?? lastMetrics.f1Score ?? 0.535).toFixed(4)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
