export interface VivaQuestion {
  id: number;
  category: 'Fundamentals' | 'Data & Leakage' | 'Modeling & Algorithms' | 'Evaluation & Metrics' | 'Explainability & XAI' | 'Business & Implementation';
  question: string;
  answer: string;
  keyTakeaway: string;
}

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: 'Fundamentals',
    question: 'What is customer churn, and why is predicting it critical for telecommunications businesses?',
    answer: 'Customer churn refers to subscribers discontinuing their service with a provider. In telecommunications, customer acquisition cost (CAC) is typically 5 to 7 times higher than customer retention cost. Predicting churn in advance allows operators to proactively offer tailored retention incentives, pricing reviews, or customer service interventions before service termination occurs.',
    keyTakeaway: 'Retention cost is significantly lower than acquisition cost; predictive intervention preserves high customer lifetime value (LTV).'
  },
  {
    id: 2,
    category: 'Fundamentals',
    question: 'What is the primary objective of this research-oriented project?',
    answer: 'To develop a rigorous, reproducible, and explainable end-to-end machine learning pipeline that identifies churn-prone subscribers, explains the mathematical basis behind individual and global predictions using SHAP, stratifies risk, and adheres strictly to academic standards such as data leakage prevention and cross-validation.',
    keyTakeaway: 'Combining reproducible predictive machine learning with local/global explainable AI (XAI) and actionable risk stratification.'
  },
  {
    id: 3,
    category: 'Fundamentals',
    question: 'Why must we clearly disclose that the baseline dataset is synthetic?',
    answer: 'Academic integrity requires explicit disclosure of dataset origin. Synthetic data, even when generated with realistic probabilistic distributions (41.4% churn, tenure correlations), exhibits known algorithmic relationships and lacks the nuanced noise, seasonality, and unobserved confounders of real-world telecommunications logs. Performance on synthetic data demonstrates pipeline functionality, not real-world commercial accuracy.',
    keyTakeaway: 'Synthetic benchmarks validate methodological integrity, but do not substitute for empirical real-world validation.'
  },
  {
    id: 4,
    category: 'Data & Leakage',
    question: 'What is data leakage (target leakage), and how did we strictly prevent it?',
    answer: 'Data leakage occurs when information from outside the training dataset (such as test set distributions, target labels, or future temporal data) is used during feature engineering, scaling, or model fitting, leading to artificially inflated performance metrics. In our pipeline, we strictly partition the dataset into 80% train and 20% test before any scaling or encoding. The ColumnTransformer is fitted exclusively on X_train and applied to transform X_test.',
    keyTakeaway: 'Always train/test split before fitting any transformers; fit on train, transform on test.'
  },
  {
    id: 5,
    category: 'Data & Leakage',
    question: 'Why did we perform an experiment excluding ContractType from the feature set?',
    answer: 'In the baseline synthetic data generation equation, ContractType == "Month-to-month" directly contributed 0.30 to the probability formula that created the ground-truth Churn label. Training on ContractType risked trivializing the model by learning the exact synthetic formula. Excluding ContractType creates an "unbiased" test bed that tests whether behavioral features (tenure, billing velocity, service choices) can predict churn independently.',
    keyTakeaway: 'Feature exclusion isolates behavioral indicators when a single contractual variable has synthetic or tautological correlation with the label.'
  },
  {
    id: 6,
    category: 'Data & Leakage',
    question: 'What is the mathematical definition and rationale for MonthlyToTotalRatio?',
    answer: 'MonthlyToTotalRatio is calculated as MonthlyCharges / (TotalCharges + 1.0). The +1.0 constant prevents division-by-zero errors in initial billing cycles. This ratio captures the spending velocity and billing intensity relative to tenure. A high ratio indicates a subscriber who is either brand-new or recently received a rate hike, both of which are high-risk indicators for attrition.',
    keyTakeaway: 'Captures tenure-normalized spending velocity with smoothing to handle zero or near-zero initial charges.'
  },
  {
    id: 7,
    category: 'Data & Leakage',
    question: 'What is the IsNewCustomer feature, and what is its methodological limitation?',
    answer: 'IsNewCustomer is a binary indicator where Tenure_Months <= 6 evaluates to 1, and 0 otherwise. Its rationale is that telecommunications churn exhibits an L-shaped "bathtub" hazard curve, where churn risk is highest during the initial 6-month onboarding window. Its limitation is the imposition of an arbitrary sharp threshold: month 6 is treated identically to month 1, while month 7 is treated as a veteran subscriber.',
    keyTakeaway: 'Captures onboarding vulnerability, but imposes an artificial step-function boundary.'
  },
  {
    id: 8,
    category: 'Data & Leakage',
    question: 'How were missing values and outliers detected and handled?',
    answer: 'Missing values are audited per feature and handled via median imputation for numerical features (robust to skewness) and mode imputation for categorical features. Outliers were quantified using the Interquartile Range (IQR = Q3 - Q1, bounds: Q1 - 1.5*IQR to Q3 + 1.5*IQR). Outliers in TotalCharges were not discarded because extreme bills reflect legitimate high-usage enterprise or multi-line customers, which the tree models can partition naturally without distortion.',
    keyTakeaway: 'Extreme values in customer billing represent real commercial behaviors, not sensor errors; tree models partition them safely.'
  },
  {
    id: 9,
    category: 'Modeling & Algorithms',
    question: 'What are the exact hyperparameters and performance of the Baseline Random Forest?',
    answer: 'The Baseline Random Forest uses n_estimators=100, max_depth=5, and random_state=42. Evaluated on the held-out test set (N=200, 117 class 0, 83 class 1), it achieves: Accuracy = 67.00%, Precision = 64.91%, Recall = 44.58%, F1-Score = 52.86%, and ROC-AUC = 0.7524. The confusion matrix is TN=97, FP=20, FN=46, TP=37.',
    keyTakeaway: 'Conservative, constrained-depth baseline preserving the exact results from notebook Cell 6.'
  },
  {
    id: 10,
    category: 'Modeling & Algorithms',
    question: 'Why did we compare multiple algorithms (Logistic Regression, Decision Tree, Random Forest, Gradient Boosting, XGBoost)?',
    answer: 'Different algorithms possess distinct inductive biases. Logistic Regression serves as a linear baseline; Decision Trees provide interpretable hierarchical partitions; Random Forest reduces variance via bagging and feature subspace sampling; Gradient Boosting and XGBoost sequentially reduce bias by fitting trees to negative gradients of the loss function. Comparing them establishes an empirical performance ceiling and tests linear vs. non-linear separability.',
    keyTakeaway: 'Comparing bagging, boosting, linear, and single-tree paradigms reveals bias-variance trade-offs across the dataset.'
  },
  {
    id: 11,
    category: 'Modeling & Algorithms',
    question: 'Why does Decision Tree achieve higher raw test accuracy (70.00%) than Random Forest (67.00%) in this specific experiment?',
    answer: 'On a synthetic dataset generated from linear threshold rules, an unconstrained or depth-5 decision tree can isolate rectangular feature subspaces that happen to align closely with the test sample partition. However, in 5-fold cross-validation, the Baseline Random Forest demonstrates superior out-of-fold generalization (Mean ROC-AUC = 0.7719 vs 0.7303 for Decision Tree), proving that the single Decision Tree was slightly overfitted to the single test split.',
    keyTakeaway: 'Single-split performance can be misleading; cross-validation proves ensemble models have lower variance and superior generalization.'
  },
  {
    id: 12,
    category: 'Evaluation & Metrics',
    question: 'Why is Accuracy an inadequate metric for evaluating churn models?',
    answer: 'In datasets with class imbalance, a naïve classifier predicting the majority class (No Churn) for every customer achieves high accuracy while failing completely at identifying churners (Recall = 0%). Furthermore, the business cost of a False Negative (losing an $85/month customer forever) is much higher than a False Positive (sending a retention email to someone who wasn\'t going to churn). Precision, Recall, F1, and ROC-AUC are far more informative.',
    keyTakeaway: 'Accuracy fails under class imbalance; Recall and F1 reflect true business intervention capability.'
  },
  {
    id: 13,
    category: 'Evaluation & Metrics',
    question: 'Explain the difference between False Positives (FP) and False Negatives (FN) in customer churn.',
    answer: 'A False Positive (Type I error) occurs when a customer who would have stayed is predicted to churn. The cost is the operational expense of a retention outreach or unnecessary discount offer ($10-$30). A False Negative (Type II error) occurs when a customer who will churn is predicted to stay. The cost is the total lost future revenue (Customer Lifetime Value, often $500-$2000). Therefore, minimizing False Negatives (maximizing Recall) is typically prioritized.',
    keyTakeaway: 'FN cost (lost customer revenue) severely outweighs FP cost (unnecessary retention outreach).'
  },
  {
    id: 14,
    category: 'Evaluation & Metrics',
    question: 'What is ROC-AUC, and why is it threshold-independent?',
    answer: 'ROC-AUC (Receiver Operating Characteristic Area Under Curve) evaluates the classifier\'s discriminative power across all possible decision thresholds from 0.0 to 1.0. It plots the True Positive Rate (Sensitivity/Recall) against the False Positive Rate (1 - Specificity). An AUC of 0.7524 means there is a 75.24% probability that the model will assign a higher churn probability to a randomly chosen churner than to a randomly chosen non-churner.',
    keyTakeaway: 'ROC-AUC measures class separation capability independent of any single operational classification threshold.'
  },
  {
    id: 15,
    category: 'Evaluation & Metrics',
    question: 'What is the purpose of Threshold Analysis (tuning decision threshold from 0.30 to 0.70)?',
    answer: 'The default threshold of 0.50 is an arbitrary mathematical midpoint that implicitly treats FP and FN costs as equal. By systematically lowering the threshold to 0.35 or 0.40, we capture significantly more true churners (increasing Recall from 44.58% to 65%+) at the cost of some additional false alarms. Operators can select the optimal operating point based on their specific retention marketing budget.',
    keyTakeaway: 'Threshold tuning aligns model probability outputs with commercial cost-benefit trade-offs.'
  },
  {
    id: 16,
    category: 'Explainability & XAI',
    question: 'What is Explainable AI (XAI), and why is it essential in telecommunications?',
    answer: 'XAI provides transparent, mathematically grounded explanations for black-box machine learning models. In telecommunications, predicting that a customer will churn is useless if customer service agents do not know *why*. XAI identifies whether churn risk is driven by billing spikes, long unresolved technical tickets, or contract expiration, enabling targeted, appropriate retention responses.',
    keyTakeaway: 'Predictions enable detection; explainability enables targeted, cost-effective remediation.'
  },
  {
    id: 17,
    category: 'Explainability & XAI',
    question: 'How do SHAP (Shapley Additive exPlanations) values work?',
    answer: 'SHAP is grounded in cooperative game theory (Shapley values). It evaluates how much each feature contributes to shifting the model\'s prediction away from the baseline expected value (mean prediction across the dataset). SHAP guarantees additive efficiency (sum of feature attributions equals the difference between the prediction and baseline) and consistency across all feature combinations.',
    keyTakeaway: 'Game-theoretic attribution that fairly distributes the prediction difference among all features.'
  },
  {
    id: 18,
    category: 'Explainability & XAI',
    question: 'Why is it critical to phrase feature importance non-causally?',
    answer: 'Observational machine learning models discover statistical associations and predictive patterns, not causal mechanisms. Saying "High monthly charges caused this subscriber to churn" is an unwarranted causal leap. The correct scientific phrasing is: "High monthly charges contributed +0.14 to the model\'s predicted churn probability." External unmeasured variables (competitor discounts, service outages) could be the true causal driver.',
    keyTakeaway: 'Correlations and model feature importances indicate predictive reliance, never causal proof.'
  },
  {
    id: 19,
    category: 'Explainability & XAI',
    question: 'What were the top features in the Baseline Random Forest according to Gini importance?',
    answer: 'The top features were: 1. MonthlyToTotalRatio (~25.5%), 2. Tenure_Months (~25.3%), 3. MonthlyCharges (~22.7%), 4. TotalCharges (~15.6%), and 5. IsNewCustomer (~2.5%). Engineered ratios and tenure metrics collectively accounted for over 50% of the impurity reduction.',
    keyTakeaway: 'Spending velocity and subscriber tenure dominate tree split decisions.'
  },
  {
    id: 20,
    category: 'Explainability & XAI',
    question: 'What is Permutation Feature Importance, and how does it differ from Gini Importance?',
    answer: 'Gini feature importance is computed during training by summing impurity reductions across tree splits; it is biased toward high-cardinality continuous variables and can inflate importance on overfitted trees. Permutation importance is computed post-hoc on validation data by shuffling the values of a single feature and measuring the resulting decrease in ROC-AUC. It is an unbiased estimate of actual test generalization reliance.',
    keyTakeaway: 'Permutation importance directly measures performance loss upon feature corruption on held-out validation data.'
  },
  {
    id: 21,
    category: 'Business & Implementation',
    question: 'How are customer risk segments defined in this project?',
    answer: 'The subscriber base is stratified into three actionable tiers based on predicted churn probability: 1. Low Risk (< 30%), 2. Medium Risk (30% to 60%), and 3. High Risk (>= 60%). These are project-defined thresholds that can be calibrated to match retention budget capacity.',
    keyTakeaway: 'Stratifies customer population into tiered priority buckets for customer support and marketing teams.'
  },
  {
    id: 22,
    category: 'Business & Implementation',
    question: 'What retention strategy is appropriate for a high-risk subscriber with high MonthlyToTotalRatio?',
    answer: 'A high MonthlyToTotalRatio indicates high recent spending or an abrupt rate jump on a short tenure. The appropriate retention action is a plan audit: reviewing whether the customer is on an outdated rate plan, offering a promotional bundle discount, or transitioning them to an annual contract with guaranteed price lock.',
    keyTakeaway: 'Review contract structure and offer loyalty discounts to counter spending velocity shocks.'
  },
  {
    id: 23,
    category: 'Business & Implementation',
    question: 'How did the sample customer from Notebook Cell 8 evaluate?',
    answer: 'The sample customer (Tenure: 24 months, MonthlyCharges: $85.50, TotalCharges: $256.50, Fiber optic, PaperlessBilling: No, PaymentMethod: Electronic check) yielded an exact predicted churn probability of 62.73%, classifying them as High Risk (CHURN RISK). The primary driver was their elevated monthly charge and fiber optic tier.',
    keyTakeaway: 'Demonstrates exact reproducibility of the original exploratory notebook\'s individual customer evaluation.'
  },
  {
    id: 24,
    category: 'Business & Implementation',
    question: 'How does batch prediction scale in production?',
    answer: 'Batch prediction accepts a batch CSV file of arbitrary size (e.g. 1,000 to 100,000 subscribers), applies the vectorized feature engineering transformations and ColumnTransformer in linear time O(N), and runs model inference to output probability scores, risk tiers, and downloadable reports without modifying the source raw data.',
    keyTakeaway: 'Vectorized pipeline ensures linear O(N) scaling for periodic operational batch scoring.'
  }
];
