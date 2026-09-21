import React, { useState } from 'react';
import { CustomerRecord } from '../types';
import { runBatchPrediction, downloadCSV } from '../mlEngine';
import {
  AlertTriangle,
  Download,
  Search,
  CheckCircle2,
  TrendingDown,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface RiskAnalysisViewProps {
  customers: CustomerRecord[];
  decisionThreshold: number;
}

export const RiskAnalysisView: React.FC<RiskAnalysisViewProps> = ({
  customers,
  decisionThreshold
}) => {
  const scoredList = runBatchPrediction(customers, decisionThreshold, true);
  const total = scoredList.length;

  const highRisk = scoredList.filter((c) => (c.predictedProbability ?? 0) >= 0.60);
  const mediumRisk = scoredList.filter(
    (c) => (c.predictedProbability ?? 0) >= 0.30 && (c.predictedProbability ?? 0) < 0.60
  );
  const lowRisk = scoredList.filter((c) => (c.predictedProbability ?? 0) < 0.30);

  const calcSegmentStats = (subset: CustomerRecord[]) => {
    const n = subset.length;
    if (n === 0) return { avgTenure: 0, avgMonthly: 0, avgTotal: 0, avgProb: 0 };
    const avgTenure = subset.reduce((acc, c) => acc + c.Tenure_Months, 0) / n;
    const avgMonthly = subset.reduce((acc, c) => acc + c.MonthlyCharges, 0) / n;
    const avgTotal = subset.reduce((acc, c) => acc + c.TotalCharges, 0) / n;
    const avgProb = subset.reduce((acc, c) => acc + (c.predictedProbability ?? 0), 0) / n;
    return {
      avgTenure: Math.round(avgTenure * 10) / 10,
      avgMonthly: Math.round(avgMonthly * 100) / 100,
      avgTotal: Math.round(avgTotal * 100) / 100,
      avgProb: Math.round(avgProb * 10000) / 100
    };
  };

  const highStats = calcSegmentStats(highRisk);
  const medStats = calcSegmentStats(mediumRisk);
  const lowStats = calcSegmentStats(lowRisk);

  const [searchTerm, setSearchTerm] = useState('');
  const filteredHighRisk = highRisk.filter(
    (c) =>
      c.CustomerID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ContractType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadHighRisk = () => {
    const rows = highRisk.map((c) => ({
      CustomerID: c.CustomerID,
      Tenure_Months: c.Tenure_Months,
      MonthlyCharges: c.MonthlyCharges,
      TotalCharges: c.TotalCharges,
      ContractType: c.ContractType,
      InternetService: c.InternetService,
      PaymentMethod: c.PaymentMethod,
      Churn_Probability: (c.predictedProbability ?? 0).toFixed(4),
      Recommended_Action:
        c.Tenure_Months <= 6
          ? 'Onboarding call + Welcome discount package'
          : c.MonthlyCharges >= 85
          ? 'Plan optimization review + 12-month rate freeze'
          : 'Contract renewal incentive'
    }));
    downloadCSV('high_risk_subscribers.csv', rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Risk Threshold Banner */}
      <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3 shadow-xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950">Project-Defined Risk Stratification Standard</p>
          <p className="mt-0.5 leading-relaxed">
            Risk tiers are calibrated using project-defined decision boundaries:
            <strong> Low Risk (&lt; 30%)</strong>, <strong>Medium Risk (30% to 60%)</strong>, and <strong>High Risk (&ge; 60%)</strong>.
            These thresholds align operational interventions with retention marketing budget capacity.
          </p>
        </div>
      </div>

      {/* Tier Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* High Risk Card */}
        <div className="p-5 bg-white rounded-xl border border-rose-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
              High Risk (&ge;60%)
            </span>
            <span className="font-mono text-xl font-bold text-rose-600">{highRisk.length} accounts</span>
          </div>
          <p className="text-xs text-slate-500">
            Accounts exhibiting imminent churn hazard; prioritize for outreach.
          </p>
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Portfolio Share:</span>
              <span className="font-bold text-slate-800">{((highRisk.length / total) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Tenure:</span>
              <span className="font-bold text-slate-800 font-mono">{highStats.avgTenure} Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Monthly Bill:</span>
              <span className="font-bold text-slate-800 font-mono">${(highStats.avgMonthly ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Churn Prob:</span>
              <span className="font-bold text-rose-600 font-mono">{highStats.avgProb}%</span>
            </div>
          </div>
        </div>

        {/* Medium Risk Card */}
        <div className="p-5 bg-white rounded-xl border border-amber-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs border border-amber-200">
              Medium Risk (30-60%)
            </span>
            <span className="font-mono text-xl font-bold text-amber-600">{mediumRisk.length} accounts</span>
          </div>
          <p className="text-xs text-slate-500">
            Vulnerable subscribers sensitive to price changes or contract expirations.
          </p>
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Portfolio Share:</span>
              <span className="font-bold text-slate-800">{((mediumRisk.length / total) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Tenure:</span>
              <span className="font-bold text-slate-800 font-mono">{medStats.avgTenure} Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Monthly Bill:</span>
              <span className="font-bold text-slate-800 font-mono">${(medStats.avgMonthly ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Churn Prob:</span>
              <span className="font-bold text-amber-600 font-mono">{medStats.avgProb}%</span>
            </div>
          </div>
        </div>

        {/* Low Risk Card */}
        <div className="p-5 bg-white rounded-xl border border-blue-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200">
              Low Risk (&lt;30%)
            </span>
            <span className="font-mono text-xl font-bold text-blue-600">{lowRisk.length} accounts</span>
          </div>
          <p className="text-xs text-slate-500">
            Stable, highly retained subscribers on multi-year terms or automated payments.
          </p>
          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Portfolio Share:</span>
              <span className="font-bold text-slate-800">{((lowRisk.length / total) * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Tenure:</span>
              <span className="font-bold text-slate-800 font-mono">{lowStats.avgTenure} Months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Monthly Bill:</span>
              <span className="font-bold text-slate-800 font-mono">${(lowStats.avgMonthly ?? 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Average Churn Prob:</span>
              <span className="font-bold text-blue-600 font-mono">{lowStats.avgProb}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* High-Risk Customer Action Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Priority High-Risk Retention Queue ({highRisk.length})</h4>
            <p className="text-xs text-slate-500">Accounts with estimated churn probability &ge; 60%</p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search high-risk accounts..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <button
              onClick={handleDownloadHighRisk}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition shrink-0 shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download high_risk_subscribers.csv</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-4">Customer ID</th>
                <th className="py-2.5 px-4">Tenure</th>
                <th className="py-2.5 px-4">Monthly Bill</th>
                <th className="py-2.5 px-4">Contract</th>
                <th className="py-2.5 px-4">Predicted Prob</th>
                <th className="py-2.5 px-4">Action Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {filteredHighRisk.slice(0, 10).map((c) => {
                const prob = (c.predictedProbability ?? 0) * 100;
                return (
                  <tr key={c.CustomerID} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{c.CustomerID}</td>
                    <td className="py-2.5 px-4 text-slate-600">{c.Tenure_Months} mos</td>
                    <td className="py-2.5 px-4 text-slate-600">${(c.MonthlyCharges ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{c.ContractType}</td>
                    <td className="py-2.5 px-4 font-bold text-rose-600">{prob.toFixed(2)}%</td>
                    <td className="py-2.5 px-4 font-sans text-slate-600 text-xs">
                      {c.Tenure_Months <= 6
                        ? 'Priority welcome check-in & setup support'
                        : c.MonthlyCharges >= 85
                        ? 'Plan optimization review & 1-yr loyalty price lock'
                        : 'Contract term upgrade offer'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
