import React, { useState } from 'react';
import { VIVA_QUESTIONS, VivaQuestion } from '../data/vivaQuestions';
import {
  GraduationCap,
  HelpCircle,
  Search,
  CheckCircle2,
  Cpu,
  Layers,
  Terminal,
  FileCode,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AboutVivaView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedId, setExpandedId] = useState<number | null>(1);

  const categories = [
    'All',
    'Fundamentals',
    'Data & Leakage',
    'Modeling & Algorithms',
    'Evaluation & Metrics',
    'Explainability & XAI',
    'Business & Implementation'
  ];

  const filteredQuestions = VIVA_QUESTIONS.filter((q) => {
    const matchesCategory = selectedCategory === 'All' || q.category === selectedCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.keyTakeaway.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16 max-w-5xl mx-auto">
      {/* Overview Banner */}
      <div className="p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <GraduationCap className="w-6 h-6" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
          B.Tech CSE Project Defense &amp; Comprehensive Viva Voce Guide
        </h2>
        <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed">
          34 curated technical examination questions spanning data leakage prevention, algorithm bias-variance trade-offs,
          SHAP explainability theory, and asymmetric error economics.
        </p>
      </div>

      {/* Architecture & Tech Stack Overview */}
      <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <Cpu className="w-4 h-4 text-indigo-600" />
          <span>Technical Architecture &amp; Execution Specifications</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">ML Backend Pipeline</span>
            <p className="text-slate-600">Python 3.11, scikit-learn, XGBoost 3.2.0, SHAP 0.44.1, joblib</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Interactive Frontend</span>
            <p className="text-slate-600">React 19, TypeScript, Tailwind CSS, Recharts, Lucide Icons</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <span className="font-bold text-slate-800">Reproducibility &amp; Tests</span>
            <p className="text-slate-600">15 pytest unit tests, 5-fold Stratified CV, fixed seed 42</p>
          </div>
        </div>

        {/* CLI Commands */}
        <div className="p-3 bg-slate-950 text-slate-300 rounded-xl font-mono text-[11px] space-y-1.5 overflow-x-auto">
          <div className="text-slate-500 font-sans text-[10px] font-semibold uppercase">Useful Commands:</div>
          <div><span className="text-emerald-400">$</span> python3 customer-churn-prediction/app.py --tenure 24 --monthly 85.50 --total 256.50</div>
          <div><span className="text-emerald-400">$</span> python3 -m pytest customer-churn-prediction/tests/</div>
          <div><span className="text-emerald-400">$</span> python3 customer-churn-prediction/src/train.py</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 text-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search viva questions..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-3">
        {filteredQuestions.map((q) => {
          const isExpanded = expandedId === q.id;
          return (
            <div
              key={q.id}
              className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition"
            >
              <button
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50/80 transition"
              >
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-bold font-mono text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {q.id}
                  </span>
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-600 uppercase tracking-wider block">
                      {q.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{q.question}</h4>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 space-y-3 text-xs">
                  <p className="text-slate-700 leading-relaxed text-justify">{q.answer}</p>
                  <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 text-indigo-950 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Key Takeaway for Examiner: </span>
                      <span>{q.keyTakeaway}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
