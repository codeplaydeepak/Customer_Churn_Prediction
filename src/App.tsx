import React, { useState } from 'react';
import { ActiveTab, CustomerRecord } from './types';
import { BASELINE_CUSTOMERS } from './data/baselineData';
import { Sidebar } from './components/Sidebar';
import { TopNavbar } from './components/TopNavbar';
import { DashboardView } from './components/DashboardView';
import { DatasetView } from './components/DatasetView';
import { DataQualityView } from './components/DataQualityView';
import { EDAView } from './components/EDAView';
import { FeatureEngineeringView } from './components/FeatureEngineeringView';
import { ModelTrainingView } from './components/ModelTrainingView';
import { ModelComparisonView } from './components/ModelComparisonView';
import { EvaluationView } from './components/EvaluationView';
import { ExplainabilityView } from './components/ExplainabilityView';
import { PredictionView } from './components/PredictionView';
import { BatchPredictionView } from './components/BatchPredictionView';
import { RiskAnalysisView } from './components/RiskAnalysisView';
import { BusinessInsightsView } from './components/BusinessInsightsView';
import { ResearchView } from './components/ResearchView';
import { AboutVivaView } from './components/AboutVivaView';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [customers, setCustomers] = useState<CustomerRecord[]>(BASELINE_CUSTOMERS);
  const [datasetSource, setDatasetSource] = useState<'synthetic' | 'uploaded'>('synthetic');
  const [decisionThreshold, setDecisionThreshold] = useState<number>(0.50);

  const handleResetToBaseline = () => {
    setCustomers(BASELINE_CUSTOMERS);
    setDatasetSource('synthetic');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      try {
        const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
        if (lines.length < 2) return;

        const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
        const parsedRows: CustomerRecord[] = [];

        for (let i = 1; i < lines.length; i++) {
          // simple CSV parser handling commas
          const rowValues = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));
          const record: any = {};

          headers.forEach((header, index) => {
            record[header] = rowValues[index] ?? '';
          });

          const customerId = record.CustomerID || `CUST-${String(i).padStart(4, '0')}`;
          const tenure = parseInt(record.Tenure_Months || record.tenure || '1') || 1;
          const monthly = parseFloat(record.MonthlyCharges || record.monthly || '20.0') || 20.0;
          const total = parseFloat(record.TotalCharges || record.total || `${tenure * monthly}`) || (tenure * monthly);
          const contract = record.ContractType || record.contract || 'Month-to-month';
          const internet = record.InternetService || record.internet || 'Fiber optic';
          const paperless = record.PaperlessBilling || record.paperless || 'No';
          const payment = record.PaymentMethod || record.payment || 'Electronic check';
          const churn = record.Churn !== undefined ? parseInt(record.Churn) : 0;

          parsedRows.push({
            CustomerID: customerId,
            Tenure_Months: tenure,
            MonthlyCharges: monthly,
            TotalCharges: total,
            ContractType: contract,
            InternetService: internet,
            PaperlessBilling: paperless,
            PaymentMethod: payment,
            Churn: churn
          });
        }

        if (parsedRows.length > 0) {
          setCustomers(parsedRows);
          setDatasetSource('uploaded');
          setActiveTab('dataset');
        }
      } catch (err) {
        console.error('Failed to parse uploaded CSV:', err);
      }
    };

    reader.readAsText(file);
    // Reset file input value so user can upload the same file again if needed
    e.target.value = '';
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-800 antialiased font-sans">
      {/* Sidebar Navigation (15 tabs) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        datasetSource={datasetSource}
        totalCustomers={customers.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <TopNavbar
          activeTab={activeTab}
          datasetSource={datasetSource}
          onResetToBaseline={handleResetToBaseline}
          onFileUpload={handleFileUpload}
          decisionThreshold={decisionThreshold}
          setDecisionThreshold={setDecisionThreshold}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <DashboardView
              customers={customers}
              setActiveTab={setActiveTab}
              decisionThreshold={decisionThreshold}
            />
          )}

          {activeTab === 'dataset' && (
            <DatasetView
              customers={customers}
              datasetSource={datasetSource}
            />
          )}

          {activeTab === 'data_quality' && (
            <DataQualityView customers={customers} />
          )}

          {activeTab === 'eda' && (
            <EDAView customers={customers} />
          )}

          {activeTab === 'feature_engineering' && (
            <FeatureEngineeringView />
          )}

          {activeTab === 'model_training' && (
            <ModelTrainingView />
          )}

          {activeTab === 'model_comparison' && (
            <ModelComparisonView />
          )}

          {activeTab === 'evaluation' && (
            <EvaluationView
              decisionThreshold={decisionThreshold}
              setDecisionThreshold={setDecisionThreshold}
            />
          )}

          {activeTab === 'explainability' && (
            <ExplainabilityView />
          )}

          {activeTab === 'prediction' && (
            <PredictionView decisionThreshold={decisionThreshold} />
          )}

          {activeTab === 'batch_prediction' && (
            <BatchPredictionView
              customers={customers}
              decisionThreshold={decisionThreshold}
            />
          )}

          {activeTab === 'risk_analysis' && (
            <RiskAnalysisView
              customers={customers}
              decisionThreshold={decisionThreshold}
            />
          )}

          {activeTab === 'business_insights' && (
            <BusinessInsightsView />
          )}

          {activeTab === 'research' && (
            <ResearchView />
          )}

          {activeTab === 'about' && (
            <AboutVivaView />
          )}
        </main>
      </div>
    </div>
  );
}
