import React, { useState } from 'react';
import { predictCustomer } from '../mlEngine';
import {
  UserCheck,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  Zap,
  TrendingUp,
  TrendingDown,
  Info,
  CheckCircle2,
  FileText
} from 'lucide-react';

interface PredictionViewProps {
  decisionThreshold: number;
}

export const PredictionView: React.FC<PredictionViewProps> = ({ decisionThreshold }) => {
  const [tenure, setTenure] = useState<number>(24);
  const [monthly, setMonthly] = useState<number>(85.50);
  const [total, setTotal] = useState<number>(256.50);
  const [contract, setContract] = useState<string>('Month-to-month');
  const [internet, setInternet] = useState<string>('Fiber optic');
  const [paperless, setPaperless] = useState<string>('No');
  const [payment, setPayment] = useState<string>('Electronic check');

  // Compute live prediction
  const result = predictCustomer(
    {
      Tenure_Months: tenure,
      MonthlyCharges: monthly,
      TotalCharges: total,
      ContractType: contract,
      InternetService: internet,
      PaperlessBilling: paperless,
      PaymentMethod: payment
    },
    decisionThreshold,
    true
  );

  // Preset Handlers
  const loadCell8Preset = () => {
    setTenure(24);
    setMonthly(85.50);
    setTotal(256.50);
    setContract('Month-to-month');
    setInternet('Fiber optic');
    setPaperless('No');
    setPayment('Electronic check');
  };

  const loadHighRiskPreset = () => {
    setTenure(3);
    setMonthly(110.00);
    setTotal(330.00);
    setContract('Month-to-month');
    setInternet('Fiber optic');
    setPaperless('Yes');
    setPayment('Electronic check');
  };

  const loadLoyalPreset = () => {
    setTenure(58);
    setMonthly(38.00);
    setTotal(2204.00);
    setContract('Two year');
    setInternet('DSL');
    setPaperless('No');
    setPayment('Credit card');
  };

  const probPercent = (((result?.churnProbability ?? 0) * 100)).toFixed(2);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner & Quick Presets */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Individual Customer Inference Engine</h3>
          <p className="text-xs text-slate-500">
            Real-time probability scoring powered by trained Random Forest pipeline
          </p>
        </div>

        {/* Quick Preset Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Presets:</span>
          <button
            onClick={loadCell8Preset}
            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200 transition"
          >
            Notebook Cell 8 (62.73%)
          </button>
          <button
            onClick={loadHighRiskPreset}
            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold border border-rose-200 transition"
          >
            High Risk Profile
          </button>
          <button
            onClick={loadLoyalPreset}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold border border-emerald-200 transition"
          >
            Loyal Profile
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Input Controls */}
        <div className="lg:col-span-2 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-5">
          <h4 className="text-sm font-bold text-slate-800 pb-2 border-b border-slate-100">
            Subscriber Profile Attributes
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Tenure */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Tenure Duration:</span>
                <span className="font-mono text-indigo-600">{tenure} Months</span>
              </label>
              <input
                type="range"
                min="1"
                max="72"
                value={tenure}
                onChange={(e) => setTenure(parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>1 mo (High risk)</span>
                <span>36 mos</span>
                <span>72 mos (Veteran)</span>
              </div>
            </div>

            {/* Monthly Charges */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Monthly Bill:</span>
                <span className="font-mono text-indigo-600">${monthly.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="20"
                max="120"
                step="0.5"
                value={monthly}
                onChange={(e) => setMonthly(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$20 (Basic)</span>
                <span>$70 (Mid)</span>
                <span>$120 (Premium)</span>
              </div>
            </div>

            {/* Total Charges */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 flex justify-between">
                <span>Cumulative Total Charges:</span>
                <span className="font-mono text-indigo-600">${total.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="20"
                max="8600"
                step="10"
                value={total}
                onChange={(e) => setTotal(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Contract Type */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Contract Commitment</label>
              <select
                value={contract}
                onChange={(e) => setContract(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="Month-to-month">Month-to-month (Highest Risk)</option>
                <option value="One year">One year</option>
                <option value="Two year">Two year (Highest Retention)</option>
              </select>
            </div>

            {/* Internet Service */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Internet Service</label>
              <select
                value={internet}
                onChange={(e) => setInternet(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="Fiber optic">Fiber optic</option>
                <option value="DSL">DSL</option>
                <option value="No">No Internet (Phone Only)</option>
              </select>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Payment Method</label>
              <select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="Electronic check">Electronic check (Elevated churn)</option>
                <option value="Mailed check">Mailed check</option>
                <option value="Bank transfer">Bank transfer (Automatic)</option>
                <option value="Credit card">Credit card (Automatic)</option>
              </select>
            </div>

            {/* Paperless Billing */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Paperless Billing</label>
              <select
                value={paperless}
                onChange={(e) => setPaperless(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-800"
              >
                <option value="Yes">Yes (Paperless e-bill)</option>
                <option value="No">No (Mailed paper bill)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Real-time Inference Result Card */}
        <div className="lg:col-span-1 p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800">Model Inference Output</h4>
              <span className="text-[10px] text-slate-400 font-mono">$\tau = {(decisionThreshold ?? 0.5).toFixed(2)}$</span>
            </div>

            {/* Probability Gauge Box */}
            <div className="p-4 rounded-xl bg-slate-900 text-white text-center space-y-1">
              <span className="text-[11px] text-slate-400 font-medium">Estimated Churn Probability</span>
              <p className="text-3xl font-bold font-mono text-indigo-400">{probPercent}%</p>
              <div className="pt-2">
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      result.churnProbability >= 0.60
                        ? 'bg-rose-500'
                        : result.churnProbability >= 0.30
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, result.churnProbability * 100))}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Classification Badges */}
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Model Decision</span>
                <span
                  className={`font-bold ${
                    result.prediction === 'Likely to Churn' ? 'text-rose-600' : 'text-emerald-600'
                  }`}
                >
                  {result.prediction}
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-slate-500 text-[10px] block">Risk Tier</span>
                <span
                  className={`font-bold ${
                    result.riskLevel === 'High'
                      ? 'text-rose-600'
                      : result.riskLevel === 'Medium'
                      ? 'text-amber-600'
                      : 'text-blue-600'
                  }`}
                >
                  {result.riskLevel} Risk
                </span>
              </div>
            </div>

            {/* Retention Suggestion */}
            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 text-xs text-indigo-900 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-indigo-950">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                <span>Retention Action Framework</span>
              </div>
              <p className="text-[11px] leading-relaxed text-indigo-800">
                {result.retentionSuggestion}
              </p>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 text-center pt-2 border-t border-slate-100">
            Based on project-defined risk thresholds (Low: &lt;30%, Medium: 30-60%, High: ≥60%)
          </div>
        </div>
      </div>
    </div>
  );
};
