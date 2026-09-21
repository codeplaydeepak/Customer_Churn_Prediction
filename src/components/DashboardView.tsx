import React, { useMemo } from 'react';
import { CustomerRecord, ActiveTab } from '../types';
import { runBatchPrediction } from '../mlEngine';
import {
  Users,
  UserX,
  UserCheck,
  Percent,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  ArrowRight,
  Database,
  Cpu,
  CheckCircle2
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface DashboardViewProps {
  customers: CustomerRecord[];
  setActiveTab: (tab: ActiveTab) => void;
  decisionThreshold: number;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  setActiveTab,
  decisionThreshold
}) => {
  const total = customers.length;
  const churnedCount = customers.filter((c) => c.Churn === 1).length;
  const retainedCount = total - churnedCount;
  const churnRate = total > 0 ? (churnedCount / total) * 100 : 0;

  // Risk segments (scored using machine learning engine)
  const scoredCustomers = useMemo(() => {
    if (customers.length > 0 && customers[0].predictedProbability !== undefined) {
      return customers;
    }
    return runBatchPrediction(customers, decisionThreshold, true);
  }, [customers, decisionThreshold]);

  const highRisk = scoredCustomers.filter((c) => (c.predictedProbability ?? 0) >= 0.60).length;
  const mediumRisk = scoredCustomers.filter(
    (c) => (c.predictedProbability ?? 0) >= 0.30 && (c.predictedProbability ?? 0) < 0.60
  ).length;
  const lowRisk = Math.max(0, total - highRisk - mediumRisk);

  // Chart data: Churn Donut
  const churnDonutData = [
    { name: 'Retained Subscribers', value: retainedCount, color: '#10b981' },
    { name: 'Churned Subscribers', value: churnedCount, color: '#ef4444' }
  ];

  // Chart data: Risk Distribution
  const riskDonutData = [
    { name: 'Low Risk (<30%)', value: lowRisk, color: '#3b82f6' },
    { name: 'Medium Risk (30-60%)', value: mediumRisk, color: '#f59e0b' },
    { name: 'High Risk (≥60%)', value: highRisk, color: '#ef4444' }
  ];

  // Contract Type breakdown
  const contractTypes = ['Month-to-month', 'One year', 'Two year'];
  const contractData = contractTypes.map((ct) => {
    const subset = customers.filter((c) => c.ContractType === ct);
    const cTotal = subset.length;
    const cChurn = subset.filter((c) => c.Churn === 1).length;
    const cRetained = cTotal - cChurn;
    return {
      contract: ct,
      Churned: cChurn,
      Retained: cRetained,
      rate: cTotal > 0 ? Math.round((cChurn / cTotal) * 100) : 0
    };
  });

  // Internet Service breakdown
  const internetTypes = ['DSL', 'Fiber optic', 'No'];
  const internetData = internetTypes.map((it) => {
    const subset = customers.filter((c) => c.InternetService === it);
    const iTotal = subset.length;
    const iChurn = subset.filter((c) => c.Churn === 1).length;
    return {
      service: it === 'No' ? 'No Internet' : it,
      Churned: iChurn,
      Retained: iTotal - iChurn,
      rate: iTotal > 0 ? Math.round((iChurn / iTotal) * 100) : 0
    };
  });

  // Payment Method breakdown
  const paymentMethods = ['Electronic check', 'Mailed check', 'Bank transfer', 'Credit card'];
  const paymentData = paymentMethods.map((pm) => {
    const subset = customers.filter((c) => c.PaymentMethod === pm);
    const pTotal = subset.length;
    const pChurn = subset.filter((c) => c.Churn === 1).length;
    return {
      method: pm.replace(' (automatic)', ''),
      Churned: pChurn,
      Retained: pTotal - pChurn,
      rate: pTotal > 0 ? Math.round((pChurn / pTotal) * 100) : 0
    };
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Academic Integrity & Synthetic Data Notice */}
      <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-xs text-indigo-900 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-indigo-950">
            Baseline Research Architecture & Synthetic Benchmark Notice
          </p>
          <p className="text-indigo-800 leading-relaxed">
            The baseline dataset ($N=1,000$, 41.4% churn) is synthetically generated according to the exact probabilistic rules established in notebook Cell 2.
            Reported performance metrics validate the data science and explainability architecture and must not be cited as empirical real-world telecom churn performance.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Subscribers</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1 font-mono">{total.toLocaleString()}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span>Full active portfolio</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Churn Rate */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Baseline Churn Rate</p>
            <h3 className="text-2xl font-bold text-rose-600 mt-1 font-mono">{churnRate.toFixed(1)}%</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <UserX className="w-3.5 h-3.5 text-rose-500" />
              <span>{churnedCount} subscribers lost</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        {/* Retained Subscribers */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Retained Subscribers</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{retainedCount}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{(100 - churnRate).toFixed(1)}% retention rate</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        {/* High Risk Subscribers */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">High Risk Portfolio</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1 font-mono">{highRisk}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>≥60% model churn prob</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Primary Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Churn Distribution Donut */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Subscriber Ground-Truth Distribution</h3>
              <p className="text-xs text-slate-500">Retained vs Churned subscriber population</p>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
              N={total}
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={churnDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {churnDonutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => {
                    const num = typeof val === 'number' ? val : Number(val) || 0;
                    const pct = total > 0 ? ((num / total) * 100).toFixed(1) : '0.0';
                    return [`${num} customers (${pct}%)`, 'Count'];
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <span className="block font-bold text-sm font-mono">{retainedCount}</span>
              <span>Retained ({(100 - churnRate).toFixed(1)}%)</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-800">
              <span className="block font-bold text-sm font-mono">{churnedCount}</span>
              <span>Churned ({churnRate.toFixed(1)}%)</span>
            </div>
          </div>
        </div>

        {/* Model-Predicted Risk Tiers Donut */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Portfolio Risk Segmentation</h3>
              <p className="text-xs text-slate-500">Project-defined churn probability tiers</p>
            </div>
            <button
              onClick={() => setActiveTab('risk_analysis')}
              className="text-xs text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDonutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {riskDonutData.map((entry, index) => (
                    <Cell key={`cell-risk-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => {
                    const num = typeof val === 'number' ? val : Number(val) || 0;
                    const pct = total > 0 ? ((num / total) * 100).toFixed(1) : '0.0';
                    return [`${num} customers (${pct}%)`, 'Count'];
                  }}
                />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
            <div className="p-2 rounded-lg bg-blue-50 text-blue-800">
              <span className="block font-bold text-sm font-mono">{lowRisk}</span>
              <span>Low (&lt;30%)</span>
            </div>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-800">
              <span className="block font-bold text-sm font-mono">{mediumRisk}</span>
              <span>Medium (30-60%)</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-800">
              <span className="block font-bold text-sm font-mono">{highRisk}</span>
              <span>High (≥60%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Visualizations: Contract, Internet, Payment Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Churn by Contract */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Churn by Contract Type</h3>
          <p className="text-xs text-slate-500">Month-to-month contracts demonstrate highest churn</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={contractData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="contract" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Churned" fill="#ef4444" stackId="a" />
                <Bar dataKey="Retained" fill="#10b981" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn by Internet Service */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Churn by Internet Service</h3>
          <p className="text-xs text-slate-500">Fiber optic subscribers face competitive pressure</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={internetData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="service" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Churned" fill="#ef4444" />
                <Bar dataKey="Retained" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Churn by Payment Method */}
        <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Churn by Payment Method</h3>
          <p className="text-xs text-slate-500">Electronic checks correlate with higher attrition</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="method" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="Churned" fill="#ef4444" />
                <Bar dataKey="Retained" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Pipeline Status Banner */}
      <div className="p-5 bg-slate-900 text-white rounded-xl shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h4 className="font-bold text-sm">Trained Model Artifacts Active</h4>
          </div>
          <p className="text-xs text-slate-300">
            Baseline Random Forest ($N=100$, Depth=5) &amp; Tuned Model with ColumnTransformer preprocessing loaded.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setActiveTab('prediction')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition shadow-xs flex items-center gap-1.5"
          >
            <span>Predict Customer</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTab('model_comparison')}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition border border-slate-700"
          >
            <span>Compare Models</span>
          </button>
        </div>
      </div>
    </div>
  );
};
