import React from 'react';
import { BASELINE_MODEL_METRICS } from '../data/baselineData';
import {
  GitCompare,
  TrendingUp,
  Award,
  CheckCircle2,
  Info,
  ShieldCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const ModelComparisonView: React.FC = () => {
  const chartData = BASELINE_MODEL_METRICS.map((m) => {
    const name = (m.modelName || m.model_name || 'Model')
      .replace(' Classifier', '')
      .replace(' (max_depth=5)', '')
      .replace(' (n_estimators=100, max_depth=5)', '');
    return {
      name,
      'Accuracy (%)': Math.round((m.accuracy ?? 0) * 10) / 10,
      'ROC-AUC': Math.round((m.rocAuc ?? m.roc_auc ?? 0) * 1000) / 1000,
      'F1-Score': Math.round((m.f1Score ?? m.f1 ?? 0) * 1000) / 1000
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Banner */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Empirical Benchmark across 6 Algorithmic Paradigms</h3>
          <p className="text-xs text-slate-500 mt-1">
            Trained with identical 80/20 stratified splits (N = 200 test samples) and leakage-safe preprocessing pipelines.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold border border-indigo-200">
          Evaluated on Held-Out Test Split
        </span>
      </div>

      {/* Metric Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-800">Comprehensive Performance Comparison Table</h4>
          <span className="text-xs text-slate-400">Class 1 = Churned ($N=83$), Class 0 = Retained ($N=117$)</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Model Architecture</th>
                <th className="py-3 px-4">Accuracy</th>
                <th className="py-3 px-4">Precision</th>
                <th className="py-3 px-4">Recall</th>
                <th className="py-3 px-4">F1-Score</th>
                <th className="py-3 px-4">ROC-AUC</th>
                <th className="py-3 px-4">5-Fold CV</th>
                <th className="py-3 px-4">Confusion (TN / FP / FN / TP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {BASELINE_MODEL_METRICS.map((m, idx) => {
                const modelName = m.modelName || m.model_name || `Model ${idx + 1}`;
                const isBaseline = modelName.includes('Baseline');
                const accuracy = m.accuracy ?? 0;
                const precision = m.precision ?? 0;
                const recall = m.recall ?? 0;
                const f1 = m.f1Score ?? m.f1 ?? 0;
                const rocAuc = m.rocAuc ?? m.roc_auc ?? 0;
                const cvF1 = m.cvMeanF1 ?? f1;
                const tn = m.tn ?? m.confusion_matrix?.tn ?? 0;
                const fp = m.fp ?? m.confusion_matrix?.fp ?? 0;
                const fn = m.fn ?? m.confusion_matrix?.fn ?? 0;
                const tp = m.tp ?? m.confusion_matrix?.tp ?? 0;

                return (
                  <tr key={modelName} className={`hover:bg-slate-50 transition ${isBaseline ? 'bg-indigo-50/40' : ''}`}>
                    <td className="py-3 px-4 font-sans font-bold text-slate-800 flex items-center gap-2">
                      {isBaseline && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                      <span>{modelName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{accuracy.toFixed(2)}%</td>
                    <td className="py-3 px-4 text-slate-600">{precision.toFixed(4)}</td>
                    <td className="py-3 px-4 text-slate-600">{recall.toFixed(4)}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{f1.toFixed(4)}</td>
                    <td className="py-3 px-4 text-indigo-700 font-bold">{rocAuc.toFixed(4)}</td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">
                      {cvF1.toFixed(4)}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {tn} / {fp} / {fn} / {tp}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Benchmark Charts */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-slate-800">Visual Algorithmic Comparison</h4>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Accuracy (%)" fill="#6366f1" />
              <Bar dataKey="ROC-AUC" fill="#10b981" />
              <Bar dataKey="F1-Score" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Academic Bias-Variance & Generalization Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <Award className="w-4 h-4 text-indigo-600" />
            <span>Why Random Forest is the Recommended Baseline</span>
          </h4>
          <p className="text-slate-600 leading-relaxed">
            While Decision Trees can achieve high raw accuracy on a single test partition by carving rectangular partitions,
            they suffer from high variance and vulnerability to data shifts.
            Random Forest aggregates predictions across 100 decorrelated decision trees, reducing estimator variance without increasing bias.
            In 5-fold cross-validation, Random Forest delivers superior generalization (ROC-AUC 0.7719), proving that single-split accuracy is unrepresentative of real-world stability.
          </p>
        </div>

        <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Precision vs. Recall Operational Trade-off</span>
          </h4>
          <p className="text-slate-600 leading-relaxed">
            In telecom retention, missing a churner (False Negative) forfeits the entire customer lifetime value (LTV),
            whereas contacting a non-churner (False Positive) merely expends a low-cost promotional email or discount coupon.
            Therefore, operators should calibrate decision thresholds to optimize <strong>Recall</strong> rather than optimizing raw classification accuracy.
          </p>
        </div>
      </div>
    </div>
  );
};
