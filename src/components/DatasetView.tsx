import React, { useState } from 'react';
import { CustomerRecord } from '../types';
import {
  Download,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { downloadCSV } from '../mlEngine';

interface DatasetViewProps {
  customers: CustomerRecord[];
  datasetSource: 'synthetic' | 'uploaded';
}

export const DatasetView: React.FC<DatasetViewProps> = ({
  customers,
  datasetSource
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState<'preview' | 'schema' | 'stats'>('preview');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const totalRecords = customers.length;
  const churned = customers.filter((c) => c.Churn === 1).length;
  const retained = totalRecords - churned;
  const churnPct = totalRecords > 0 ? (churned / totalRecords) * 100 : 0;

  // Filtered customers
  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.CustomerID.toLowerCase().includes(q) ||
      c.ContractType.toLowerCase().includes(q) ||
      c.InternetService.toLowerCase().includes(q) ||
      c.PaymentMethod.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Feature types
  const schemaInfo = [
    { name: 'CustomerID', type: 'Categorical (ID)', sample: 'CUST-0001', desc: 'Unique customer identifier' },
    { name: 'Tenure_Months', type: 'Numerical (int)', sample: '24', desc: 'Total subscription duration in months (1-72)' },
    { name: 'MonthlyCharges', type: 'Numerical (float)', sample: '$85.50', desc: 'Monthly recurring bill ($20 - $120)' },
    { name: 'TotalCharges', type: 'Numerical (float)', sample: '$2052.00', desc: 'Cumulative charges across tenure ($0 - $8640)' },
    { name: 'ContractType', type: 'Categorical', sample: 'Month-to-month', desc: 'Contract commitment (Month-to-month, One year, Two year)' },
    { name: 'InternetService', type: 'Categorical', sample: 'Fiber optic', desc: 'Network connection type (DSL, Fiber optic, No)' },
    { name: 'PaperlessBilling', type: 'Categorical (Binary)', sample: 'Yes', desc: 'Opted in to paperless electronic invoices' },
    { name: 'PaymentMethod', type: 'Categorical', sample: 'Electronic check', desc: 'Payment method (Electronic check, Mailed check, Credit card, Bank transfer)' },
    { name: 'Churn', type: 'Binary Target (0/1)', sample: '1', desc: 'Ground-truth label (1 = Churned subscriber, 0 = Retained)' }
  ];

  // Five-number statistical summary
  const calculateStats = (key: keyof CustomerRecord) => {
    const vals = customers.map((c) => Number(c[key] ?? 0)).filter((v) => !isNaN(v)).sort((a, b) => a - b);
    const n = vals.length;
    if (n === 0) return { count: 0, mean: 0, std: 0, min: 0, q25: 0, median: 0, q75: 0, max: 0 };
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n);
    return {
      count: n,
      mean: Math.round(mean * 100) / 100,
      std: Math.round(std * 100) / 100,
      min: Math.round(vals[0] * 100) / 100,
      q25: Math.round(vals[Math.floor(n * 0.25)] * 100) / 100,
      median: Math.round(vals[Math.floor(n * 0.5)] * 100) / 100,
      q75: Math.round(vals[Math.floor(n * 0.75)] * 100) / 100,
      max: Math.round(vals[n - 1] * 100) / 100
    };
  };

  const tenureStats = calculateStats('Tenure_Months');
  const monthlyStats = calculateStats('MonthlyCharges');
  const totalStats = calculateStats('TotalCharges');

  const statsRows = [
    { metric: 'Tenure (Months)', ...tenureStats },
    { metric: 'Monthly Charges ($)', ...monthlyStats },
    { metric: 'Total Charges ($)', ...totalStats }
  ];

  const handleExportSummary = () => {
    downloadCSV('dataset_summary_statistics.csv', statsRows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Records</p>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">{totalRecords.toLocaleString()}</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Features</p>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">8 + 1 target</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Numerical</p>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">3 (raw) + 2 (eng)</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Categorical</p>
          <p className="text-xl font-bold text-slate-900 mt-1 font-mono">4</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Churn Count</p>
          <p className="text-xl font-bold text-rose-600 mt-1 font-mono">{churned} ({churnPct.toFixed(1)}%)</p>
        </div>
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Retained Count</p>
          <p className="text-xl font-bold text-emerald-600 mt-1 font-mono">{retained} ({(100 - churnPct).toFixed(1)}%)</p>
        </div>
      </div>

      {/* View Tabs & Actions Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedView('preview')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedView === 'preview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tabular Preview ({totalRecords})
          </button>
          <button
            onClick={() => setSelectedView('schema')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedView === 'schema'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Schema &amp; Data Types
          </button>
          <button
            onClick={() => setSelectedView('stats')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedView === 'stats'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Statistical Summary
          </button>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {selectedView === 'preview' && (
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder="Search ID, contract, payment..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          )}

          <button
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-medium shrink-0"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Stats (CSV)</span>
          </button>
        </div>
      </div>

      {/* View 1: Tabular Preview */}
      {selectedView === 'preview' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Customer ID</th>
                  <th className="py-3 px-4">Tenure (Mos)</th>
                  <th className="py-3 px-4">Monthly ($)</th>
                  <th className="py-3 px-4">Total ($)</th>
                  <th className="py-3 px-4">Contract</th>
                  <th className="py-3 px-4">Internet</th>
                  <th className="py-3 px-4">Paperless</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Ground Truth</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {paginated.map((c) => (
                  <tr key={c.CustomerID} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-4 font-bold text-slate-800">{c.CustomerID}</td>
                    <td className="py-2.5 px-4 text-slate-600">{c.Tenure_Months}</td>
                    <td className="py-2.5 px-4 text-slate-600">${(c.MonthlyCharges ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-4 text-slate-600">${(c.TotalCharges ?? 0).toFixed(2)}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{c.ContractType}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{c.InternetService}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{c.PaperlessBilling}</td>
                    <td className="py-2.5 px-4 font-sans text-slate-700">{c.PaymentMethod}</td>
                    <td className="py-2.5 px-4">
                      {c.Churn === 1 ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-sans font-semibold text-[10px] border border-rose-200">
                          Churned
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-sans font-semibold text-[10px] border border-emerald-200">
                          Retained
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
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
      )}

      {/* View 2: Schema & Feature Types */}
      {selectedView === 'schema' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Feature Name</th>
                <th className="py-3 px-4">Data Type</th>
                <th className="py-3 px-4">Sample Observation</th>
                <th className="py-3 px-4">Functional Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schemaInfo.map((s) => (
                <tr key={s.name} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono font-bold text-slate-800">{s.name}</td>
                  <td className="py-3 px-4 text-indigo-600 font-semibold">{s.type}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{s.sample}</td>
                  <td className="py-3 px-4 text-slate-600">{s.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View 3: Five-Number Statistical Summary */}
      {selectedView === 'stats' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Numerical Variable</th>
                <th className="py-3 px-4">Count</th>
                <th className="py-3 px-4">Mean</th>
                <th className="py-3 px-4">Std Dev</th>
                <th className="py-3 px-4">Min</th>
                <th className="py-3 px-4">25% (Q1)</th>
                <th className="py-3 px-4">Median (50%)</th>
                <th className="py-3 px-4">75% (Q3)</th>
                <th className="py-3 px-4">Max</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {statsRows.map((r) => (
                <tr key={r.metric} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-sans font-bold text-slate-800">{r.metric}</td>
                  <td className="py-3 px-4 text-slate-600">{r.count}</td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">{r.mean}</td>
                  <td className="py-3 px-4 text-slate-600">{r.std}</td>
                  <td className="py-3 px-4 text-slate-600">{r.min}</td>
                  <td className="py-3 px-4 text-slate-600">{r.q25}</td>
                  <td className="py-3 px-4 text-indigo-600 font-bold">{r.median}</td>
                  <td className="py-3 px-4 text-slate-600">{r.q75}</td>
                  <td className="py-3 px-4 text-slate-600">{r.max}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
