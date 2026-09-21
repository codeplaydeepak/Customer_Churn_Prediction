import React, { useState } from 'react';
import { CustomerRecord } from '../types';
import { runBatchPrediction, downloadCSV } from '../mlEngine';
import {
  FileSpreadsheet,
  Download,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Upload,
  Play,
  ArrowUpDown
} from 'lucide-react';

interface BatchPredictionViewProps {
  customers: CustomerRecord[];
  decisionThreshold: number;
}

export const BatchPredictionView: React.FC<BatchPredictionViewProps> = ({
  customers,
  decisionThreshold
}) => {
  const [scoredList, setScoredList] = useState<CustomerRecord[]>(() =>
    runBatchPrediction(customers, decisionThreshold, true)
  );
  const [filterRisk, setFilterRisk] = useState<'All' | 'High' | 'Medium' | 'Low'>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  const handleRunBatch = () => {
    const scored = runBatchPrediction(customers, decisionThreshold, true);
    setScoredList(scored);
    setPage(1);
  };

  const handleLoadSample50 = () => {
    const sample = customers.slice(0, 50);
    const scored = runBatchPrediction(sample, decisionThreshold, true);
    setScoredList(scored);
    setPage(1);
  };

  const filtered = scoredList.filter((c) => {
    const matchesSearch =
      c.CustomerID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.ContractType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.PaymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRisk = filterRisk === 'All' || c.riskSegment === filterRisk;
    return matchesSearch && matchesRisk;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const highRiskCount = scoredList.filter((c) => c.riskSegment === 'High').length;
  const medRiskCount = scoredList.filter((c) => c.riskSegment === 'Medium').length;
  const lowRiskCount = scoredList.filter((c) => c.riskSegment === 'Low').length;

  const handleDownloadResults = () => {
    const exportRows = scoredList.map((c) => ({
      CustomerID: c.CustomerID,
      Tenure_Months: c.Tenure_Months,
      MonthlyCharges: c.MonthlyCharges,
      TotalCharges: c.TotalCharges,
      ContractType: c.ContractType,
      InternetService: c.InternetService,
      PaymentMethod: c.PaymentMethod,
      Churn_Probability: (c.predictedProbability ?? 0).toFixed(4),
      Predicted_Label: c.predictedLabel === 1 ? 'Likely to Churn' : 'Likely to Stay',
      Risk_Tier: c.riskSegment ?? 'Low'
    }));
    downloadCSV('churn_predictions.csv', exportRows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Overview & Actions */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Batch Subscriber Inference &amp; Scoring</h3>
          <p className="text-xs text-slate-500">
            Vectorized pipeline scoring across {scoredList.length} subscribers in portfolio
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunBatch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-xs"
          >
            <Play className="w-3.5 h-3.5" />
            <span>Score Full Portfolio ({customers.length})</span>
          </button>

          <button
            onClick={handleLoadSample50}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition"
          >
            Load Sample 50 Batch
          </button>

          <button
            onClick={handleDownloadResults}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download churn_predictions.csv</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase">Total Scored</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{scoredList.length}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase">High Risk (&ge;60%)</span>
          <p className="text-2xl font-bold font-mono text-rose-600 mt-1">
            {highRiskCount} ({((highRiskCount / (scoredList.length || 1)) * 100).toFixed(1)}%)
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase">Medium Risk (30-60%)</span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">
            {medRiskCount} ({((medRiskCount / (scoredList.length || 1)) * 100).toFixed(1)}%)
          </p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs text-center">
          <span className="text-xs font-semibold text-slate-500 uppercase">Low Risk (&lt;30%)</span>
          <p className="text-2xl font-bold font-mono text-blue-600 mt-1">
            {lowRiskCount} ({((lowRiskCount / (scoredList.length || 1)) * 100).toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-600">Filter Risk Tier:</span>
          {(['All', 'High', 'Medium', 'Low'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => {
                setFilterRisk(tier);
                setPage(1);
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                filterRisk === tier
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by ID, contract, payment..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
      </div>

      {/* Scored Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Tenure</th>
                <th className="py-3 px-4">Monthly ($)</th>
                <th className="py-3 px-4">Total ($)</th>
                <th className="py-3 px-4">Contract</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Predicted Churn Prob</th>
                <th className="py-3 px-4">Risk Tier</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {paginated.map((c) => {
                const prob = c.predictedProbability ?? 0;
                return (
                  <tr key={c.CustomerID} className="hover:bg-slate-50 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{c.CustomerID}</td>
                    <td className="py-2.5 px-4 text-slate-600">{c.Tenure_Months} mos</td>
                    <td className="py-2.5 px-4 text-slate-600">${(c.MonthlyCharges ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-slate-600">${(c.TotalCharges ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{c.ContractType}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{c.PaymentMethod}</td>
                    <td className="py-2.5 px-4 font-bold text-indigo-600">
                      {(prob * 100).toFixed(2)}%
                    </td>
                    <td className="py-2.5 px-4 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          c.riskSegment === 'High'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : c.riskSegment === 'Medium'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {c.riskSegment} Risk
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-50 text-xs font-medium"
            >
              Previous
            </button>
            <span className="px-2 font-mono font-semibold text-slate-700">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 disabled:opacity-50 text-xs font-medium"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
