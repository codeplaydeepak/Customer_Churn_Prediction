import React, { useState } from 'react';
import { FEATURE_IMPORTANCE_DATA } from '../data/baselineData';
import { predictCustomer } from '../mlEngine';
import {
  Eye,
  BarChart3,
  HelpCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

export const ExplainabilityView: React.FC = () => {
  const [selectedSample, setSelectedSample] = useState<'cell8' | 'highRisk' | 'loyal'>('cell8');

  // Sample customer configs
  const sampleProfiles = {
    cell8: {
      title: 'Notebook Cell 8 Sample',
      tenure: 24,
      monthly: 85.50,
      total: 256.50,
      contract: 'Month-to-month',
      internet: 'Fiber optic',
      paperless: 'No',
      payment: 'Electronic check'
    },
    highRisk: {
      title: 'Extreme High-Risk New Subscriber',
      tenure: 2,
      monthly: 110.00,
      total: 220.00,
      contract: 'Month-to-month',
      internet: 'Fiber optic',
      paperless: 'Yes',
      payment: 'Electronic check'
    },
    loyal: {
      title: 'Loyal Long-Term Subscriber',
      tenure: 60,
      monthly: 40.00,
      total: 2400.00,
      contract: 'Two year',
      internet: 'DSL',
      paperless: 'No',
      payment: 'Bank transfer'
    }
  };

  const activeProfile = sampleProfiles[selectedSample];
  const predResult = predictCustomer({
    Tenure_Months: activeProfile.tenure,
    MonthlyCharges: activeProfile.monthly,
    TotalCharges: activeProfile.total,
    ContractType: activeProfile.contract,
    InternetService: activeProfile.internet,
    PaperlessBilling: activeProfile.paperless,
    PaymentMethod: activeProfile.payment
  });

  const baseRate = 0.414; // baseline expected value
  const finalProb = predResult.churnProbability;

  const chartData = FEATURE_IMPORTANCE_DATA.slice(0, 8).map((f) => ({
    name: f.feature,
    Importance: Math.round((f.importance ?? 0) * 1000) / 10,
    pct: `${((f.importance ?? 0) * 100).toFixed(1)}%`
  }));

  return (
    <div className="space-y-6 pb-12">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950">Scientific Epistemology Caveat: Non-Causal Model Attribution</p>
          <p className="mt-0.5 leading-relaxed">
            Feature importances and SHAP values measure statistical attribution towards the machine learning model's output.
            They indicate which inputs the algorithm relied upon to minimize impurity or cross-entropy loss.
            They do <strong>not</strong> prove causal etiology. Stating that "high monthly charges caused churn" is an unwarranted causal leap;
            unmeasured confounding factors (e.g., local infrastructure disruptions or aggressive competitor promotions) may be the true generative mechanism.
          </p>
        </div>
      </div>

      {/* Global Feature Importance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Tree Gini Feature Importance Ranking</h3>
              <p className="text-xs text-slate-500">Relative mean decrease in node impurity across 100 trees</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold">
              Baseline RF
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={chartData} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" unit="%" tick={{ fontSize: 10 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip formatter={(val: any) => [`${val}%`, 'Gini Importance']} />
                <Bar dataKey="Importance" fill="#6366f1" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Importance Table & Explanation */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800">Top Feature Attributes Summary</h3>
          <div className="overflow-hidden rounded-lg border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Feature Name</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Importance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {FEATURE_IMPORTANCE_DATA.slice(0, 6).map((f) => (
                  <tr key={f.feature} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-800">{f.feature}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-500">
                      {f.feature.includes('Ratio') || f.feature.includes('IsNew') ? 'Engineered' : 'Original'}
                    </td>
                    <td className="py-2.5 px-3 font-bold text-indigo-600">{(f.importance * 100).toFixed(2)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 text-slate-600">
            <span className="font-bold text-slate-800">Key Observation: </span>
            <span>
              The engineered <code className="font-mono text-indigo-600 font-bold">MonthlyToTotalRatio</code> (~25.5%)
              and subscriber <code className="font-mono text-indigo-600 font-bold">Tenure_Months</code> (~25.3%)
              dominate node partitions, proving that rate of spending velocity and tenure maturity account for over 50% of the tree split decisions.
            </span>
          </div>
        </div>
      </div>

      {/* Local Explainable AI: SHAP Force Waterfall Simulator */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-800">Local SHAP Force Waterfall Attribution</h3>
            </div>
            <p className="text-xs text-slate-500">
              Visualizing how individual customer attributes shift prediction away from baseline expected value ($E[f(x)] = 0.414$)
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setSelectedSample('cell8')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedSample === 'cell8' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cell 8 Sample (62.7%)
            </button>
            <button
              onClick={() => setSelectedSample('highRisk')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedSample === 'highRisk' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              High Risk
            </button>
            <button
              onClick={() => setSelectedSample('loyal')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition ${
                selectedSample === 'loyal' ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Loyal Low Risk
            </button>
          </div>
        </div>

        {/* Profile Card & Prediction Output */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-slate-500">Tenure:</span>
            <p className="font-bold font-mono text-slate-800">{activeProfile.tenure} Months</p>
          </div>
          <div>
            <span className="text-slate-500">Monthly Bill:</span>
            <p className="font-bold font-mono text-slate-800">${(activeProfile.monthly ?? 0).toFixed(2)}</p>
          </div>
          <div>
            <span className="text-slate-500">Contract:</span>
            <p className="font-bold text-slate-800">{activeProfile.contract}</p>
          </div>
          <div>
            <span className="text-slate-500">Predicted Churn Prob:</span>
            <p className="font-bold font-mono text-indigo-600 text-sm">
              {((finalProb ?? 0) * 100).toFixed(2)}% ({predResult.riskLevel} Risk)
            </p>
          </div>
        </div>

        {/* Waterfall Explanation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Risk Factors Increasing Churn */}
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2">
            <h4 className="font-bold text-rose-950 flex items-center gap-1.5 text-xs">
              <TrendingUp className="w-4 h-4 text-rose-600" />
              <span>Features Increasing Churn Probability (Push Toward Churn)</span>
            </h4>
            <div className="space-y-1.5">
              {predResult.topPositiveFactors.map((f, i) => (
                <div key={i} className="p-2 bg-white rounded-lg border border-rose-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{f.feature}: </span>
                    <span className="text-slate-600">{f.value}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{f.explanation}</p>
                  </div>
                  <span className="font-mono font-bold text-rose-600 shrink-0 ml-2">
                    +{(f.impact ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
              {predResult.topPositiveFactors.length === 0 && (
                <p className="text-slate-500 text-[11px]">No significant risk-elevating attributes detected.</p>
              )}
            </div>
          </div>

          {/* Protective Factors Decreasing Churn */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
            <h4 className="font-bold text-emerald-950 flex items-center gap-1.5 text-xs">
              <TrendingDown className="w-4 h-4 text-emerald-600" />
              <span>Features Decreasing Churn Probability (Protective Factors)</span>
            </h4>
            <div className="space-y-1.5">
              {predResult.topNegativeFactors.map((f, i) => (
                <div key={i} className="p-2 bg-white rounded-lg border border-emerald-100 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-800">{f.feature}: </span>
                    <span className="text-slate-600">{f.value}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{f.explanation}</p>
                  </div>
                  <span className="font-mono font-bold text-emerald-600 shrink-0 ml-2">
                    {(f.impact ?? 0).toFixed(2)}
                  </span>
                </div>
              ))}
              {predResult.topNegativeFactors.length === 0 && (
                <p className="text-slate-500 text-[11px]">No protective factors identified for this profile.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
