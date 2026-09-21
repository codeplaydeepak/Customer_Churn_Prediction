import React, { useState } from 'react';
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Layers,
  ArrowRight,
  ShieldAlert,
  GitPullRequest
} from 'lucide-react';

export const BusinessInsightsView: React.FC = () => {
  const [activeStudy, setActiveStudy] = useState<'patterns' | 'retention' | 'sensitivity'>('patterns');

  return (
    <div className="space-y-6 pb-12">
      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveStudy('patterns')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeStudy === 'patterns' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Observed Portfolio Patterns
        </button>
        <button
          onClick={() => setActiveStudy('retention')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeStudy === 'retention' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Retention Action Framework
        </button>
        <button
          onClick={() => setActiveStudy('sensitivity')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            activeStudy === 'sensitivity' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Sensitivity Study (ContractType Exclusion)
        </button>
      </div>

      {/* View 1: Observed Portfolio Patterns */}
      {activeStudy === 'patterns' && (
        <div className="space-y-4">
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-3 shadow-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-950">Correlation vs. Causation Guardrail</p>
              <p className="mt-0.5 leading-relaxed">
                The patterns documented below reflect observed statistical relationships within the baseline dataset.
                Correlation indicates co-occurrence, not direct mechanistic causality.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pattern 1 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px]">
                Pattern 01
              </span>
              <h4 className="text-sm font-bold text-slate-900">Contract Commitment &amp; Churn Hazard</h4>
              <p className="text-slate-600 leading-relaxed">
                Subscribers on <strong>Month-to-month</strong> contracts exhibit a churn rate of ~60%, compared to &lt;15% for Two-year contracts.
                The absence of contractual commitment creates frictionless switching opportunities whenever competitor offers arise.
              </p>
            </div>

            {/* Pattern 2 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px]">
                Pattern 02
              </span>
              <h4 className="text-sm font-bold text-slate-900">Early-Lifecycle "Bathtub" Onboarding Hazard</h4>
              <p className="text-slate-600 leading-relaxed">
                Subscribers within their first 6 months (<code className="font-mono text-indigo-600 font-bold">IsNewCustomer = 1</code>)
                experience double the attrition rate of subscribers with over 24 months of tenure.
                Habitual integration and service reliance require approximately 6 to 12 months to stabilize.
              </p>
            </div>

            {/* Pattern 3 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px]">
                Pattern 03
              </span>
              <h4 className="text-sm font-bold text-slate-900">Payment Channel Disparities</h4>
              <p className="text-slate-600 leading-relaxed">
                Subscribers paying by manual <strong>Electronic Check</strong> experience elevated churn (~55%),
                while subscribers enrolled in automated <strong>Bank Transfer</strong> or <strong>Credit Card</strong> autopay
                exhibit under 28% churn. Active manual payments force a monthly purchase decision.
              </p>
            </div>

            {/* Pattern 4 */}
            <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-bold font-mono text-[10px]">
                Pattern 04
              </span>
              <h4 className="text-sm font-bold text-slate-900">Fiber Optic Price Sensitivity</h4>
              <p className="text-slate-600 leading-relaxed">
                Fiber optic subscribers face higher monthly bills ($70-$120), creating greater bill shock and heightened responsiveness
                to promotional price undercutting by competing fiber and 5G home internet providers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Retention Action Framework */}
      {activeStudy === 'retention' && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-base font-bold text-slate-900">Operational Retention Playbooks by Subscriber Cohort</h4>
            <p className="text-xs text-slate-500">
              Prescriptive guidelines for customer success agents, pricing specialists, and marketing teams.
            </p>

            <div className="space-y-3 text-xs pt-2">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Cohort A: Brand-New Subscribers (Tenure &le; 6 Months)</span>
                  <span className="text-rose-600 font-mono">High Urgency</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Action:</strong> Automated 14-day and 45-day satisfaction check-ins. Assign dedicated onboarding specialists to assist with hardware setup and WiFi optimization. Offer a 3-month bill credit guarantee for report of any technical dissatisfaction.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Cohort B: High Monthly Bill + High Velocity (MonthlyToTotalRatio &gt; 0.15)</span>
                  <span className="text-amber-600 font-mono">Medium-High Urgency</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Action:</strong> Account audit. Identify expiring introductory promotions and proactively apply an annual rate-freeze loyalty package or bundled streaming discount before the customer calls to cancel.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>Cohort C: Month-to-Month Contract + Electronic Check</span>
                  <span className="text-indigo-600 font-mono">Process Optimization</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  <strong>Action:</strong> Incentivize migration to automated recurring credit card / bank autopay by offering a recurring $5.00/month paperless autopay credit.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View 3: Sensitivity Study */}
      {activeStudy === 'sensitivity' && (
        <div className="space-y-4">
          <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <GitPullRequest className="w-5 h-5 text-indigo-600" />
              <h4 className="text-base font-bold text-slate-900">
                Sensitivity Study: Impact of Feature-Exclusion on Model Generalization
              </h4>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              In the baseline synthetic data generation equation (notebook Cell 2), <code className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[11px]">ContractType == "Month-to-month"</code>
              explicitly added <code className="font-mono text-indigo-600 font-bold">+0.30</code> directly to the probability formula that created the ground-truth Churn label.
              Including ContractType during training risks training the model to memorize the synthetic generative equation rather than learning genuine subscriber behavior.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              {/* Included */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <span className="font-bold text-slate-800 text-sm">Experiment A: ContractType INCLUDED</span>
                <div className="space-y-1 font-mono text-[11px]">
                  <p className="text-slate-600">Test Accuracy: <strong className="text-slate-900">76.50%</strong></p>
                  <p className="text-slate-600">Test ROC-AUC: <strong className="text-indigo-600">0.8240</strong></p>
                  <p className="text-slate-600">ContractType Importance: <strong className="text-rose-600">~42% (Dominant)</strong></p>
                </div>
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                  Risk: Artificially inflated metrics due to synthetic label circularity.
                </p>
              </div>

              {/* Excluded (Our Default) */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-2 text-xs">
                <span className="font-bold text-indigo-950 text-sm">Experiment B: ContractType EXCLUDED (Unbiased Default)</span>
                <div className="space-y-1 font-mono text-[11px]">
                  <p className="text-slate-700">Test Accuracy: <strong className="text-slate-900">67.00%</strong></p>
                  <p className="text-slate-700">Test ROC-AUC: <strong className="text-indigo-700">0.7524</strong></p>
                  <p className="text-slate-700">Top Feature: <strong className="text-emerald-700">MonthlyToTotalRatio (~25.5%)</strong></p>
                </div>
                <p className="text-[11px] text-indigo-800 pt-1 border-t border-indigo-200">
                  Benefit: Forces model to learn behavioral and spending velocity predictors without label leakage.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
