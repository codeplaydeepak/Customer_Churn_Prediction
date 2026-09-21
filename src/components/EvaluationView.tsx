import React, { useState } from 'react';
import { BASELINE_MODEL_METRICS, THRESHOLD_ANALYSIS_DATA } from '../data/baselineData';
import {
  FlaskConical,
  SlidersHorizontal,
  AlertTriangle,
  Info,
  CheckCircle2,
  TrendingDown,
  TrendingUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

interface EvaluationViewProps {
  decisionThreshold: number;
  setDecisionThreshold: (t: number) => void;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  decisionThreshold,
  setDecisionThreshold
}) => {
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);
  const currentModel = BASELINE_MODEL_METRICS[selectedModelIndex] || BASELINE_MODEL_METRICS[0];

  // Dynamic values calculated from threshold
  // As threshold lowers: recall increases, precision drops, TP increases, FP increases
  const matchedThreshold = THRESHOLD_ANALYSIS_DATA.find(
    (t) => Math.abs(t.threshold - decisionThreshold) < 0.03
  ) || THRESHOLD_ANALYSIS_DATA[4]; // default 0.50

  const tn = matchedThreshold.tn;
  const fp = matchedThreshold.fp;
  const fn = matchedThreshold.fn;
  const tp = matchedThreshold.tp;

  // ROC Curve Data (Simulated points matching AUC = 0.7524)
  const rocPoints = [
    { fpr: 0.0, tpr: 0.0, random: 0.0 },
    { fpr: 0.05, tpr: 0.22, random: 0.05 },
    { fpr: 0.10, tpr: 0.38, random: 0.10 },
    { fpr: 0.17, tpr: 0.45, random: 0.17 }, // 0.50 threshold point
    { fpr: 0.25, tpr: 0.62, random: 0.25 },
    { fpr: 0.35, tpr: 0.75, random: 0.35 },
    { fpr: 0.50, tpr: 0.86, random: 0.50 },
    { fpr: 0.70, tpr: 0.94, random: 0.70 },
    { fpr: 1.0, tpr: 1.0, random: 1.0 }
  ];

  // Precision-Recall curve data
  const prPoints = [
    { recall: 0.10, precision: 0.85 },
    { recall: 0.25, precision: 0.76 },
    { recall: 0.446, precision: 0.649 }, // exact 0.50 threshold
    { recall: 0.65, precision: 0.56 },
    { recall: 0.80, precision: 0.48 },
    { recall: 0.95, precision: 0.42 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Model Selection and Threshold Controller */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Diagnostic Model Evaluation</h3>
            <p className="text-xs text-slate-500">
              Examining held-out test split ($N=200$, 117 retained, 83 churned)
            </p>
          </div>
          <select
            value={selectedModelIndex}
            onChange={(e) => setSelectedModelIndex(parseInt(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800"
          >
            {BASELINE_MODEL_METRICS.map((m, idx) => (
              <option key={m.modelName || m.model_name || idx} value={idx}>
                {m.modelName || m.model_name}
              </option>
            ))}
          </select>
        </div>

        {/* Threshold Slider */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600" />
              <span>Operational Decision Threshold ($\tau$):</span>
            </span>
            <span className="font-mono font-bold text-indigo-600 text-sm">{(decisionThreshold ?? 0.5).toFixed(2)}</span>
          </div>
          <input
            type="range"
            min="0.30"
            max="0.70"
            step="0.05"
            value={decisionThreshold}
            onChange={(e) => setDecisionThreshold(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>0.30 (Aggressive Recall / Catch More Churners)</span>
            <span>0.50 (Standard Midpoint)</span>
            <span>0.70 (Conservative / High Precision)</span>
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Cost Analysis Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Confusion Matrix */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800">
              Confusion Matrix ($\tau = {decisionThreshold.toFixed(2)}$)
            </h4>
            <span className="text-xs text-slate-500 font-mono">Total = 200</span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            {/* True Negative */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                True Negative (TN)
              </span>
              <p className="text-2xl font-bold font-mono text-emerald-700">{tn}</p>
              <p className="text-[11px] text-emerald-600">Correctly identified retained customers</p>
            </div>

            {/* False Positive */}
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800">
                False Positive (FP - Type I)
              </span>
              <p className="text-2xl font-bold font-mono text-amber-700">{fp}</p>
              <p className="text-[11px] text-amber-600">False alarms (customer would have stayed)</p>
            </div>

            {/* False Negative */}
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-800">
                False Negative (FN - Type II)
              </span>
              <p className="text-2xl font-bold font-mono text-rose-700">{fn}</p>
              <p className="text-[11px] text-rose-600">Missed churners (costliest error)</p>
            </div>

            {/* True Positive */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-800">
                True Positive (TP)
              </span>
              <p className="text-2xl font-bold font-mono text-blue-700">{tp}</p>
              <p className="text-[11px] text-blue-600">Successfully flagged churners</p>
            </div>
          </div>

          {/* Quick Metrics from Matrix */}
          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Precision</span>
              <span className="font-bold font-mono text-slate-800">
                {((matchedThreshold?.precision ?? 0.5738) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[10px]">Recall</span>
              <span className="font-bold font-mono text-indigo-600">
                {((matchedThreshold?.recall ?? 0.4217) * 100).toFixed(1)}%
              </span>
            </div>
            <div className="p-2 bg-slate-50 rounded-lg">
              <span className="text-slate-500 block text-[10px]">F1-Score</span>
              <span className="font-bold font-mono text-slate-800">
                {(matchedThreshold?.f1 ?? 0.4861).toFixed(4)}
              </span>
            </div>
          </div>
        </div>

        {/* Business Cost Analysis */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-slate-800">Asymmetric Business Error Economics</h4>
          <div className="space-y-3 text-xs">
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
              <div className="flex items-center justify-between font-bold text-rose-950">
                <span>False Negative (FN) Impact</span>
                <span className="font-mono text-sm">${(fn * 850).toLocaleString()} est. loss</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Occurs when the model classifies an impending churner as "Retained".
                The subscriber terminates service without intervention.
                Average customer lifetime value (LTV) lost is estimated at <strong>$850 per subscriber</strong>.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1 text-amber-900">
              <div className="flex items-center justify-between font-bold text-amber-950">
                <span>False Positive (FP) Impact</span>
                <span className="font-mono text-sm">${(fp * 15).toLocaleString()} wasted outreach</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Occurs when a satisfied customer is flagged as "Likely to Churn".
                The business incurs the nominal cost of an automated SMS/email or a $10-$15 discount voucher.
                Economic impact is negligible compared to a False Negative.
              </p>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-[11px]">
              <span className="font-bold">Operational Guidance: </span>
              In production, lower the decision threshold to <strong>0.35 - 0.40</strong> to reduce False Negatives from 46 down to ~25, saving substantial subscriber revenue at minimal incremental cost.
            </div>
          </div>
        </div>
      </div>

      {/* ROC & PR Curve Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ROC Curve */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Receiver Operating Characteristic (ROC)</h4>
              <p className="text-xs text-slate-500">True Positive Rate vs. False Positive Rate</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-bold">
              ROC-AUC = {(currentModel?.rocAuc ?? currentModel?.roc_auc ?? 0.7524).toFixed(4)}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rocPoints}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="fpr" label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fontSize: 11 }} tick={{ fontSize: 10 }} />
                <YAxis label={{ value: 'True Positive Rate (Recall)', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tpr" stroke="#6366f1" strokeWidth={2.5} name="Model ROC" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="random" stroke="#94a3b8" strokeDasharray="4 4" name="Random Guess (AUC=0.5)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* PR Curve */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-800">Precision-Recall Curve</h4>
              <p className="text-xs text-slate-500">Precision trade-off as Recall is expanded</p>
            </div>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={prPoints}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="recall" label={{ value: 'Recall (Coverage)', position: 'insideBottom', offset: -5, fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, 1]} />
                <YAxis label={{ value: 'Precision', angle: -90, position: 'insideLeft', fontSize: 11 }} tick={{ fontSize: 10 }} domain={[0, 1]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="precision" stroke="#10b981" strokeWidth={2.5} name="Precision vs Recall" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
