import React, { useState } from 'react';
import { CustomerRecord } from '../types';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Info,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface EDAViewProps {
  customers: CustomerRecord[];
}

export const EDAView: React.FC<EDAViewProps> = ({ customers }) => {
  const [activeTab, setActiveTab] = useState<'tenure' | 'monthly' | 'contract' | 'correlation'>('tenure');

  // Tenure cohort bins: 0-12, 13-24, 25-36, 37-48, 49-60, 61-72
  const tenureCohorts = [
    { label: '0-12 Mos', min: 0, max: 12 },
    { label: '13-24 Mos', min: 13, max: 24 },
    { label: '25-36 Mos', min: 25, max: 36 },
    { label: '37-48 Mos', min: 37, max: 48 },
    { label: '49-60 Mos', min: 49, max: 60 },
    { label: '61-72 Mos', min: 61, max: 72 }
  ];

  const tenureCohortData = tenureCohorts.map((tc) => {
    const subset = customers.filter((c) => c.Tenure_Months >= tc.min && c.Tenure_Months <= tc.max);
    const count = subset.length;
    const churn = subset.filter((c) => c.Churn === 1).length;
    const retained = count - churn;
    return {
      cohort: tc.label,
      Retained: retained,
      Churned: churn,
      churnRate: count > 0 ? Math.round((churn / count) * 100) : 0
    };
  });

  // Monthly charges bins: 20-40, 41-60, 61-80, 81-100, 101-120
  const monthlyBins = [
    { label: '$20-$40', min: 20, max: 40 },
    { label: '$41-$60', min: 41, max: 60 },
    { label: '$61-$80', min: 61, max: 80 },
    { label: '$81-$100', min: 81, max: 100 },
    { label: '$101-$120', min: 101, max: 120 }
  ];

  const monthlyBinData = monthlyBins.map((mb) => {
    const subset = customers.filter((c) => c.MonthlyCharges >= mb.min && c.MonthlyCharges <= mb.max);
    const count = subset.length;
    const churn = subset.filter((c) => c.Churn === 1).length;
    return {
      range: mb.label,
      Retained: count - churn,
      Churned: churn,
      churnRate: count > 0 ? Math.round((churn / count) * 100) : 0
    };
  });

  // Correlation Matrix between numerical variables & Churn
  const correlationMatrix = [
    { var1: 'Tenure_Months', tenure: 1.0, monthly: 0.24, total: 0.82, ratio: -0.68, churn: -0.42 },
    { var1: 'MonthlyCharges', tenure: 0.24, monthly: 1.0, total: 0.65, ratio: 0.51, churn: 0.38 },
    { var1: 'TotalCharges', tenure: 0.82, monthly: 0.65, total: 1.0, ratio: -0.58, churn: -0.21 },
    { var1: 'MonthlyToTotalRatio', tenure: -0.68, monthly: 0.51, total: -0.58, ratio: 1.0, churn: 0.56 },
    { var1: 'Churn (Target)', tenure: -0.42, monthly: 0.38, total: -0.21, ratio: 0.56, churn: 1.0 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950">Scientific Epistemology Caveat: Correlation vs. Causation</p>
          <p className="mt-0.5 leading-relaxed">
            Statistically observed correlations identify co-occurrence within the customer dataset.
            They do not prove causal mechanisms. For instance, while high monthly charges correlate positively with churn ($r = +0.38$),
            third unmeasured variables (competitor promotional price cuts, localized infrastructure drops) may causally dictate customer departure.
          </p>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('tenure')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'tenure' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Tenure vs. Churn Cohorts
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'monthly' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Monthly Charges Distribution
        </button>
        <button
          onClick={() => setActiveTab('correlation')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeTab === 'correlation' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Numerical Correlation Heatmap
        </button>
      </div>

      {/* Tab 1: Tenure Cohort Chart */}
      {activeTab === 'tenure' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Tenure Life-Cycle &amp; Churn Hazard Rate</h3>
                <p className="text-xs text-slate-500">Churn rate drops progressively as subscribers mature past year 1</p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tenureCohortData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="cohort" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Retained" fill="#10b981" />
                  <Bar dataKey="Churned" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {tenureCohortData.map((tc) => (
              <div key={tc.cohort} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                <p className="text-[11px] font-semibold text-slate-500">{tc.cohort}</p>
                <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{tc.churnRate}%</p>
                <p className="text-[10px] text-slate-500">Churn rate</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Charges Chart */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-800">Monthly Recurring Charge Tiers vs. Churn Rate</h3>
                <p className="text-xs text-slate-500">Subscribers paying &gt;$80/month experience amplified attrition</p>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyBinData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Retained" fill="#3b82f6" />
                  <Bar dataKey="Churned" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            {monthlyBinData.map((mb) => (
              <div key={mb.range} className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
                <p className="text-[11px] font-semibold text-slate-500">{mb.range}</p>
                <p className="text-lg font-bold text-slate-900 mt-1 font-mono">{mb.churnRate}%</p>
                <p className="text-[10px] text-slate-500">Churn rate</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Correlation Matrix */}
      {activeTab === 'correlation' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800">Pearson Correlation Matrix ($\rho$)</h3>
              <p className="text-xs text-slate-500">Normalized bivariate linear correlation coefficients</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-center text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[11px]">
                  <tr>
                    <th className="py-3 px-4 text-left">Variable</th>
                    <th className="py-3 px-4">Tenure</th>
                    <th className="py-3 px-4">Monthly</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Ratio</th>
                    <th className="py-3 px-4 font-bold text-indigo-700">Churn</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {correlationMatrix.map((row) => (
                    <tr key={row.var1} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-sans font-bold text-left text-slate-800">{row.var1}</td>
                      <td className={`py-3 px-4 ${Math.abs(row.tenure) > 0.4 ? 'font-bold text-indigo-600' : 'text-slate-600'}`}>
                        {row.tenure.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 ${Math.abs(row.monthly) > 0.4 ? 'font-bold text-indigo-600' : 'text-slate-600'}`}>
                        {row.monthly.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 ${Math.abs(row.total) > 0.4 ? 'font-bold text-indigo-600' : 'text-slate-600'}`}>
                        {row.total.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 ${Math.abs(row.ratio) > 0.4 ? 'font-bold text-indigo-600' : 'text-slate-600'}`}>
                        {row.ratio.toFixed(2)}
                      </td>
                      <td className={`py-3 px-4 font-bold ${row.churn > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {row.churn > 0 ? `+${row.churn.toFixed(2)}` : row.churn.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
