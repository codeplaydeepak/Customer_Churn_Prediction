import React from 'react';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Database,
  ShieldCheck,
  BarChart3,
  Sliders,
  Cpu,
  GitCompare,
  FlaskConical,
  Eye,
  UserCheck,
  FileSpreadsheet,
  AlertTriangle,
  Lightbulb,
  GraduationCap,
  Info,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  datasetSource: 'synthetic' | 'uploaded';
  totalCustomers: number;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  datasetSource,
  totalCustomers
}) => {
  const navGroups: NavGroup[] = [
    {
      title: 'EXPLORATION & DATA',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'dataset', label: 'Dataset Explorer', icon: Database, badge: `${totalCustomers}` },
        { id: 'data_quality', label: 'Data Quality & Outliers', icon: ShieldCheck },
        { id: 'eda', label: 'Exploratory Analysis', icon: BarChart3 }
      ]
    },
    {
      title: 'ML PIPELINE & MODELS',
      items: [
        { id: 'feature_engineering', label: 'Feature Engineering', icon: Sliders },
        { id: 'model_training', label: 'Model Training', icon: Cpu },
        { id: 'model_comparison', label: 'Model Comparison', icon: GitCompare, badge: '6 Models' },
        { id: 'evaluation', label: 'Model Evaluation', icon: FlaskConical },
        { id: 'explainability', label: 'Explainable AI (SHAP)', icon: Eye }
      ]
    },
    {
      title: 'INFERENCE & RETENTION',
      items: [
        { id: 'prediction', label: 'Customer Prediction', icon: UserCheck, badge: 'Live' },
        { id: 'batch_prediction', label: 'Batch Prediction', icon: FileSpreadsheet },
        { id: 'risk_analysis', label: 'Risk Segmentation', icon: AlertTriangle },
        { id: 'business_insights', label: 'Business Insights', icon: Lightbulb }
      ]
    },
    {
      title: 'ACADEMIC & REPORTING',
      items: [
        { id: 'research', label: 'Research Paper', icon: GraduationCap },
        { id: 'about', label: 'About & Viva Voce', icon: Info, badge: '34 Q&A' }
      ]
    }
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-200 border-r border-slate-800 flex flex-col h-screen select-none shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base tracking-tight leading-none">ChurnPredict XAI</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Telecom ML & Risk System</p>
          </div>
        </div>

        {/* Dataset Status Banner */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium">
              {datasetSource === 'synthetic' ? 'Synthetic Baseline' : 'User CSV Data'}
            </span>
          </div>
          <span className="px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono text-[10px]">
            N={totalCustomers}
          </span>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h2 className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              {group.title}
            </h2>
            <div className="space-y-0.5 pt-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`nav-tab-${item.id}`}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                          isActive
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
        <div className="flex justify-between items-center text-slate-300 font-medium">
          <span>Baseline Model</span>
          <span className="text-emerald-400 font-mono">RF (depth=5)</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[10px]">
          <span>Test ROC-AUC</span>
          <span className="font-mono text-slate-300">0.7524</span>
        </div>
        <div className="flex justify-between items-center text-slate-400 text-[10px]">
          <span>Test Accuracy</span>
          <span className="font-mono text-slate-300">67.00%</span>
        </div>
      </div>
    </aside>
  );
};
