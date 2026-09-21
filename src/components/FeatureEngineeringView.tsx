import React, { useState } from 'react';
import { Sliders, Calculator, CheckCircle2, AlertTriangle, Code, ArrowRight } from 'lucide-react';
import { computeEngineeredFeatures } from '../mlEngine';

export const FeatureEngineeringView: React.FC = () => {
  const [tenure, setTenure] = useState<number>(24);
  const [monthly, setMonthly] = useState<number>(85.5);
  const [total, setTotal] = useState<number>(256.5);

  const { monthlyToTotalRatio, isNewCustomer } = computeEngineeredFeatures({
    Tenure_Months: tenure,
    MonthlyCharges: monthly,
    TotalCharges: total
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Cards */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2">
        <h3 className="text-base font-bold text-slate-900">Domain-Driven Feature Engineering Architecture</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Raw telecommunications records often obscure non-linear velocity and lifecycle hazards.
          Our pipeline constructs two mathematically formalized engineered features prior to model ingestion,
          designed to isolate spending velocity and onboarding vulnerability without leaking ground-truth labels.
        </p>
      </div>

      {/* Feature 1: MonthlyToTotalRatio */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs font-mono">
              f1
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">MonthlyToTotalRatio (Spending Velocity)</h4>
              <p className="text-xs text-slate-500">Continuous ratio measuring immediate billing burden against cumulative tenure</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-mono text-xs font-semibold">
            Top #1 Model Importance (~25.5%)
          </span>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono">
            <code>MonthlyToTotalRatio = MonthlyCharges / (TotalCharges + 1.0)</code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Domain Rationale</span>
              <p className="text-slate-600">
                Captures rate of spend acceleration. Subscribers with recent upgrades, fee additions, or promo expirations display disproportionately high monthly bills relative to lifetime billings.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Mathematical Smoothing</span>
              <p className="text-slate-600">
                Adding the constant scalar <code className="font-mono text-indigo-600">+1.0</code> prevents division-by-zero errors when a brand-new subscriber exhibits zero or near-zero initial charges.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Academic Limitation</span>
              <p className="text-slate-600">
                Exhibits negative collinearity with tenure ($r \approx -0.68$), as total charges naturally expand monotonically with duration of subscription.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature 2: IsNewCustomer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs font-mono">
              f2
            </span>
            <div>
              <h4 className="text-sm font-bold text-slate-900">IsNewCustomer (Early Lifecycle Hazard Flag)</h4>
              <p className="text-xs text-slate-500">Binary indicator isolating the probationary first 6 months of service</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-mono text-xs font-semibold">
            Categorical Indicator (0/1)
          </span>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="p-3 bg-slate-900 text-slate-100 rounded-lg font-mono">
            <code>IsNewCustomer = 1 if Tenure_Months &lt;= 6 else 0</code>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Domain Rationale</span>
              <p className="text-slate-600">
                Telecommunications churn adheres to a "bathtub" hazard curve. The probability of churn is disproportionately concentrated in the initial onboarding phase before usage habits solidify.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Operational Utility</span>
              <p className="text-slate-600">
                Allows retention teams to direct welcome surveys, onboarding calls, and setup assistance directly to vulnerable accounts in their first 180 days.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
              <span className="font-bold text-slate-800">Academic Limitation</span>
              <p className="text-slate-600">
                Imposes an arbitrary, discontinuous threshold boundary: month 6 is tagged as high hazard (1), whereas month 7 is abruptly designated as mature (0).
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Feature Calculator Playground */}
      <div className="p-5 bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-200/80 rounded-xl space-y-4 shadow-xs">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-indigo-600" />
          <h4 className="text-sm font-bold text-slate-900">Interactive Feature Engineering Calculator</h4>
        </div>
        <p className="text-xs text-slate-600">
          Adjust customer attributes below to observe live evaluation of engineered features.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex justify-between">
              <span>Tenure:</span>
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
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex justify-between">
              <span>Monthly Charges:</span>
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
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex justify-between">
              <span>Total Charges:</span>
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
        </div>

        {/* Real-time Computed Values */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-indigo-100">
          <div className="p-3 bg-white rounded-lg border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Computed MonthlyToTotalRatio:</span>
              <p className="text-xs text-slate-400 mt-0.5">
                ${monthly.toFixed(2)} / (${total.toFixed(2)} + 1.0)
              </p>
            </div>
            <span className="text-xl font-bold font-mono text-indigo-600">
              {(monthlyToTotalRatio ?? 0).toFixed(4)}
            </span>
          </div>

          <div className="p-3 bg-white rounded-lg border border-indigo-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Computed IsNewCustomer:</span>
              <p className="text-xs text-slate-400 mt-0.5">
                {tenure} months &lt;= 6 months
              </p>
            </div>
            <span className={`text-xl font-bold font-mono ${isNewCustomer ? 'text-rose-600' : 'text-emerald-600'}`}>
              {isNewCustomer ? '1 (True)' : '0 (False)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
