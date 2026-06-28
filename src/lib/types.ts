export const modelCategories = [
  "Basic Office AI",
  "Business Reasoning AI",
  "Large Context AI",
  "Developer AI",
  "High-Security AI"
] as const;

export type ModelCategory = (typeof modelCategories)[number];

export type UsageLevel = "light" | "standard" | "heavy" | "mission-critical";
export type DocumentCount =
  | "under-1k"
  | "1k-10k"
  | "10k-50k"
  | "50k-250k"
  | "over-250k"
  | "not-sure";
export type FileSize = "under-10gb" | "10gb-100gb" | "100gb-1tb" | "1tb-10tb" | "over-10tb" | "not-sure";
export type TypicalDocumentSize = "short" | "medium" | "large" | "very-large" | "libraries";
export type SecurityTierSlug =
  | "secure-connected"
  | "private-on-prem"
  | "offline-air-gapped"
  | "regulated-high-assurance"
  | "classified-support";
export type PerformancePreference = "cost-focused" | "balanced" | "performance-focused";
export type ExistingHardware = "new-hardware" | "may-have-hardware" | "already-server" | "already-gpus" | "not-sure";
export type BudgetSensitivity =
  | "lowest-cost"
  | "balance-cost-performance"
  | "prioritize-growth"
  | "not-sure";

export interface EstimatorConfig {
  employees: number;
  aiUsers: number;
  simultaneousUsers: number;
  usageLevel: UsageLevel;
  documentCount: DocumentCount;
  totalFileSize: FileSize;
  typicalDocumentSize: TypicalDocumentSize;
  fileTypes: string[];
  workloads: string[];
  securityTier: SecurityTierSlug;
  performancePreference: PerformancePreference;
  existingHardware: ExistingHardware;
  budgetSensitivity: BudgetSensitivity;
}

export interface ScoreSet {
  security: number;
  workloadComplexity: number;
  documentVolume: number;
  contextRequirement: number;
  fileComplexity: number;
  userConcurrency: number;
  toolComplexity: number;
  integrationComplexity: number;
  hardwareBudget: number;
}

export interface ModelCatalogItem {
  id?: string;
  name: string;
  exactModelId: string;
  provider: string;
  license: string;
  commercialUseAllowed: "yes" | "no" | "unclear";
  releaseDate: string;
  lastReviewedDate: string;
  modelCategory: ModelCategory;
  modelType: string;
  totalParameters: string;
  activeParameters: string;
  contextTokens: number;
  estimatedContextWords: number;
  maximumOutputTokens: number;
  modality: string;
  strengths: string[];
  weaknesses: string[];
  bestUseCases: string[];
  toolCallingSupport: boolean;
  structuredOutputSupport: boolean;
  agenticWorkflowSuitability: "low" | "medium" | "high";
  codingAbility: "low" | "medium" | "high";
  multimodalSupport: boolean;
  minimumVramGb: number;
  recommendedVramGb: number;
  minimumSystemRamGb: number;
  recommendedSystemRamGb: number;
  storageRequirementGb: number;
  supportedRuntimes: string[];
  offlineCapable: boolean;
  airGapSuitable: boolean;
  hardwareCategory: "Low to medium" | "Medium" | "Medium to high" | "High";
  notes: string;
  sourceUrl: string;
  enabled?: boolean;
}

export interface HardwareTier {
  id?: string;
  slug: string;
  tierName: string;
  customerDescription: string;
  minimumVramGb: number;
  recommendedVramGb: number;
  minimumRamGb: number;
  recommendedRamGb: number;
  cpuClass: string;
  storageRecommendation: string;
  gpuExamples: string[];
  expectedUsers: string;
  expectedDocumentWorkload: string;
  estimatedHardwareCostLow: number;
  estimatedHardwareCostHigh: number;
  notes: string;
}

export interface SecurityTier {
  id?: string;
  slug: SecurityTierSlug;
  tierName: string;
  description: string;
  internetAccessAllowed: boolean;
  localProcessingRequired: boolean;
  airGapRequired: boolean;
  auditLoggingRequired: boolean;
  roleBasedAccessRequired: boolean;
  offlineUpdateProcedureRequired: boolean;
  complianceDocumentationRequired: boolean;
  estimatedImplementationComplexity: number;
  costMultiplier: number;
  notes: string;
}

export interface ToolAddon {
  id?: string;
  slug: string;
  name: string;
  description: string;
  complexity: "low" | "medium" | "high" | "custom";
  estimatedSetupCostLow: number;
  estimatedSetupCostHigh: number;
  monthlySupportImpact: number;
  requiredSecurityConsiderations: string;
  notes: string;
}

export interface PricingAssumptions {
  id: "default";
  baseInstallationLow: number;
  baseInstallationHigh: number;
  customDevelopmentHourlyEstimate: number;
  monthlySupportLow: number;
  monthlySupportHigh: number;
  assessmentPrice: number;
  foundingCustomerDiscountPercent: number;
  notes: string;
}

export interface CatalogData {
  models: ModelCatalogItem[];
  hardwareTiers: HardwareTier[];
  securityTiers: SecurityTier[];
  toolAddons: ToolAddon[];
  pricing: PricingAssumptions;
}

export interface MoneyRange {
  low: number;
  high: number;
}

export interface EstimateResult {
  scores: ScoreSet;
  modelCategory: ModelCategory;
  topModel: ModelCatalogItem;
  alternativeModels: ModelCatalogItem[];
  hardwareTier: HardwareTier;
  securityTier: SecurityTier;
  toolAddons: ToolAddon[];
  estimatedHardwareCost: MoneyRange;
  estimatedImplementationCost: MoneyRange;
  estimatedMonthlySupport: MoneyRange;
  estimateConfidence: "Low" | "Medium" | "High";
  confidenceScore: number;
  explanations: string[];
  preliminaryNotice: string;
}

export interface LeadSubmissionInput {
  name: string;
  businessName: string;
  email: string;
  phone?: string;
  preferredContact: "email" | "phone" | "either";
  notes?: string;
  intent: "email-estimate" | "technical-review" | "consultation" | "save-configuration" | "contact";
  configuration: EstimatorConfig;
  estimate: EstimateResult;
}
