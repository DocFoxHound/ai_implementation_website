import { catalogData } from "./seed-data";
import type {
  BudgetSensitivity,
  CatalogData,
  EstimatorConfig,
  EstimateResult,
  HardwareTier,
  ModelCatalogItem,
  ModelCategory,
  ScoreSet,
  SecurityTier,
  ToolAddon
} from "./types";

const documentCountScore: Record<EstimatorConfig["documentCount"], number> = {
  "under-1k": 1,
  "1k-10k": 3,
  "10k-50k": 5,
  "50k-250k": 7,
  "over-250k": 9,
  "not-sure": 4
};

const fileSizeScore: Record<EstimatorConfig["totalFileSize"], number> = {
  "under-10gb": 1,
  "10gb-100gb": 3,
  "100gb-1tb": 5,
  "1tb-10tb": 7,
  "over-10tb": 9,
  "not-sure": 4
};

const documentSizeScore: Record<EstimatorConfig["typicalDocumentSize"], number> = {
  short: 1,
  medium: 3,
  large: 5,
  "very-large": 7,
  libraries: 9
};

const usageScore: Record<EstimatorConfig["usageLevel"], number> = {
  light: 1,
  standard: 3,
  heavy: 6,
  "mission-critical": 9
};

const securityScore: Record<EstimatorConfig["securityTier"], number> = {
  "secure-connected": 2,
  "private-on-prem": 5,
  "offline-air-gapped": 8,
  "regulated-high-assurance": 9,
  "classified-support": 10
};

const budgetScore: Record<BudgetSensitivity, number> = {
  "lowest-cost": 1,
  "balance-cost-performance": 5,
  "prioritize-growth": 9,
  "not-sure": 4
};

const complexFileTypes = new Set([
  "Scanned PDF",
  "Images",
  "CAD or engineering files",
  "Source code",
  "Database records",
  "Emails"
]);

const integrationFileTypes = new Set(["Emails", "CAD or engineering files", "Source code", "Database records", "Other"]);

const complexWorkloads = new Set([
  "Analyze contracts",
  "Compare policies",
  "Database lookup",
  "Developer/code assistant",
  "Scheduled reports",
  "Custom workflow tools"
]);

export function clampScore(value: number) {
  return Math.max(1, Math.min(10, Math.round(value)));
}

export function calculateScores(config: EstimatorConfig): ScoreSet {
  const concurrency = Math.min(10, Math.ceil(config.simultaneousUsers / 2));
  const aiUserPressure = Math.min(10, Math.ceil(config.aiUsers / 12));
  const fileComplexity =
    config.fileTypes.reduce((score, type) => score + (complexFileTypes.has(type) ? 1.4 : 0.35), 1) +
    (config.fileTypes.includes("Scanned PDF") ? 1.5 : 0);
  const workloadComplexity = config.workloads.reduce((score, workload) => score + (complexWorkloads.has(workload) ? 1.15 : 0.45), 1);
  const toolComplexity = config.workloads.reduce((score, workload) => {
    if (workload.includes("Custom")) return score + 2.5;
    if (workload.includes("Scheduled") || workload.includes("Database") || workload.includes("Developer")) return score + 1.5;
    return score + 0.45;
  }, 1);

  return {
    security: securityScore[config.securityTier],
    workloadComplexity: clampScore(workloadComplexity),
    documentVolume: clampScore((documentCountScore[config.documentCount] + fileSizeScore[config.totalFileSize]) / 2),
    contextRequirement: clampScore(
      (documentSizeScore[config.typicalDocumentSize] + documentCountScore[config.documentCount] + fileSizeScore[config.totalFileSize]) / 3
    ),
    fileComplexity: clampScore(fileComplexity),
    userConcurrency: clampScore((concurrency + aiUserPressure + usageScore[config.usageLevel]) / 3),
    toolComplexity: clampScore(toolComplexity),
    integrationComplexity: clampScore(
      config.fileTypes.reduce((score, type) => score + (integrationFileTypes.has(type) ? 1.5 : 0.2), 1) +
        config.workloads.reduce((score, workload) => score + (complexWorkloads.has(workload) ? 0.8 : 0.15), 0)
    ),
    hardwareBudget: budgetScore[config.budgetSensitivity]
  };
}

function chooseModelCategory(config: EstimatorConfig, scores: ScoreSet): ModelCategory {
  if (scores.security >= 8) return "High-Security AI";
  if (config.workloads.includes("Developer/code assistant") || config.fileTypes.includes("Source code")) return "Developer AI";
  if (scores.contextRequirement >= 7 || config.typicalDocumentSize === "libraries") return "Large Context AI";
  if (scores.workloadComplexity >= 6) return "Business Reasoning AI";
  return "Basic Office AI";
}

function modelFitScore(model: ModelCatalogItem, category: ModelCategory, config: EstimatorConfig, scores: ScoreSet) {
  let score = 0;
  if (model.modelCategory === category) score += 12;
  if (category === "Developer AI" && (model.codingAbility === "high" || model.bestUseCases.some((use) => use.toLowerCase().includes("code")))) score += 10;
  if (category === "High-Security AI" && model.airGapSuitable) score += 8;
  if (scores.contextRequirement >= 6 && model.contextTokens >= 65536) score += 7;
  if (scores.contextRequirement >= 8 && model.contextTokens >= 131072) score += 5;
  if (scores.toolComplexity >= 6 && model.toolCallingSupport) score += 5;
  if (scores.workloadComplexity >= 6 && model.structuredOutputSupport) score += 3;
  if (config.budgetSensitivity === "lowest-cost" && model.recommendedVramGb <= 32) score += 6;
  if (config.budgetSensitivity === "prioritize-growth" && model.recommendedVramGb >= 48) score += 4;
  if (config.performancePreference === "performance-focused" && model.recommendedVramGb >= 48) score += 3;
  if (model.commercialUseAllowed === "yes") score += 2;
  if (model.commercialUseAllowed === "unclear") score -= 1;
  if (config.securityTier === "secure-connected" && model.recommendedVramGb > 100 && config.budgetSensitivity !== "prioritize-growth") score -= 4;
  return score;
}

function recommendModels(config: EstimatorConfig, scores: ScoreSet, category: ModelCategory, data: CatalogData) {
  const enabledModels = data.models.filter((model) => model.enabled !== false);
  const scored = enabledModels
    .map((model) => ({ model, score: modelFitScore(model, category, config, scores) }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((item) => item.model);
}

function hardwareIndexForModel(model: ModelCatalogItem) {
  if (model.recommendedVramGb >= 140) return 4;
  if (model.recommendedVramGb >= 80) return 3;
  if (model.recommendedVramGb >= 48) return 2;
  if (model.recommendedVramGb >= 24) return 1;
  return 0;
}

function recommendHardware(
  config: EstimatorConfig,
  scores: ScoreSet,
  model: ModelCatalogItem,
  securityTier: SecurityTier,
  tiers: HardwareTier[]
) {
  let index = hardwareIndexForModel(model);

  if (scores.documentVolume >= 8 || scores.userConcurrency >= 8 || scores.toolComplexity >= 8) index = Math.max(index, 3);
  if (scores.documentVolume >= 6 || scores.userConcurrency >= 6 || scores.toolComplexity >= 6) index = Math.max(index, 2);
  if (securityTier.airGapRequired || config.securityTier === "classified-support") index = Math.max(index, 4);
  if (config.securityTier === "regulated-high-assurance") index = Math.max(index, 4);
  if (config.performancePreference === "performance-focused") index += 1;
  if (config.performancePreference === "cost-focused" && config.budgetSensitivity === "lowest-cost") index -= 1;

  const finalIndex = Math.max(0, Math.min(tiers.length - 1, index));
  return tiers[finalIndex] ?? tiers[1];
}

function recommendAddons(config: EstimatorConfig, scores: ScoreSet, data: CatalogData) {
  const slugs = new Set<string>(["secure-document-indexing", "source-citations"]);

  if (scores.documentVolume >= 4) slugs.add("scheduled-folder-scans");
  if (scores.documentVolume >= 6) slugs.add("folder-monitoring");
  if (scores.documentVolume >= 7 || config.workloads.includes("Summarize documents")) slugs.add("background-document-summaries");
  if (scores.security >= 5) slugs.add("user-groups-permissions");
  if (scores.security >= 8) {
    slugs.add("audit-logs");
    slugs.add("admin-dashboard");
  }
  if (config.securityTier === "offline-air-gapped" || config.securityTier === "classified-support") slugs.add("offline-update-package-support");
  if (config.fileTypes.includes("Scanned PDF") || config.fileTypes.includes("Images")) slugs.add("ocr-processing");
  if (config.fileTypes.includes("Emails") || config.workloads.includes("Summarize emails or tickets")) slugs.add("email-ticket-summarization");
  if (config.fileTypes.includes("Database records") || config.workloads.includes("Database lookup")) slugs.add("database-lookup");
  if (config.fileTypes.includes("Source code") || config.workloads.includes("Developer/code assistant")) {
    slugs.add("codebase-search");
    slugs.add("developer-assistant-integration");
  }
  if (config.workloads.includes("Scheduled reports") || config.workloads.includes("Generate reports")) slugs.add("scheduled-reports");
  if (config.workloads.includes("Analyze contracts")) slugs.add("contract-comparison");
  if (config.workloads.includes("Compare policies")) slugs.add("policy-qa");
  if (config.workloads.includes("Custom workflow tools")) slugs.add("custom-workflow-tool");

  return data.toolAddons.filter((addon) => slugs.has(addon.slug));
}

function sumAddonCosts(addons: ToolAddon[]) {
  return addons.reduce(
    (total, addon) => ({
      low: total.low + addon.estimatedSetupCostLow,
      high: total.high + addon.estimatedSetupCostHigh,
      monthly: total.monthly + addon.monthlySupportImpact
    }),
    { low: 0, high: 0, monthly: 0 }
  );
}

function confidence(config: EstimatorConfig, scores: ScoreSet) {
  let value = 88;
  if (config.documentCount === "not-sure") value -= 10;
  if (config.totalFileSize === "not-sure") value -= 10;
  if (config.existingHardware !== "new-hardware") value -= 10;
  if (config.budgetSensitivity === "not-sure") value -= 6;
  if (scores.security >= 8) value -= 8;
  if (scores.integrationComplexity >= 8) value -= 6;

  const confidenceScore = Math.max(35, Math.min(95, value));
  const label = confidenceScore >= 78 ? "High" : confidenceScore >= 58 ? "Medium" : "Low";
  return { confidenceScore, label: label as "Low" | "Medium" | "High" };
}

function buildExplanations(
  config: EstimatorConfig,
  scores: ScoreSet,
  modelCategory: ModelCategory,
  model: ModelCatalogItem,
  hardware: HardwareTier,
  security: SecurityTier,
  addons: ToolAddon[]
) {
  const explanations: string[] = [];

  if (scores.contextRequirement >= 7) explanations.push("Your document volume and document length suggest a long-context model.");
  if (config.securityTier !== "secure-connected") explanations.push(`Your security selection points toward ${security.tierName}.`);
  if (scores.userConcurrency >= 6) explanations.push("Your expected user count increases the recommended hardware tier.");
  if (config.fileTypes.includes("Scanned PDF") || config.fileTypes.includes("Images")) {
    explanations.push("Scanned PDFs or images may require OCR processing before they can be searched reliably.");
  }
  if (config.workloads.includes("Custom workflow tools") || scores.toolComplexity >= 7) {
    explanations.push("Your selected tools require custom integration work and a technical review.");
  }
  if (config.existingHardware !== "new-hardware") {
    explanations.push("Existing hardware may reduce cost. Final recommendation requires technical review.");
  }
  if (model.commercialUseAllowed === "unclear") {
    explanations.push("Model license and business terms must be reviewed before final recommendation.");
  }

  explanations.push(`${modelCategory} is the closest starting category for this configuration.`);
  explanations.push(`${model.name} is the current top candidate based on context, tools, budget, and security fit.`);
  explanations.push(`${hardware.tierName} is the estimated hardware class for planning purposes.`);

  if (addons.some((addon) => addon.complexity === "custom")) {
    explanations.push("Custom add-ons create the widest pricing range until the workflow is scoped.");
  }

  return explanations.slice(0, 8);
}

export function buildEstimate(config: EstimatorConfig, data: CatalogData = catalogData): EstimateResult {
  const scores = calculateScores(config);
  const modelCategory = chooseModelCategory(config, scores);
  const recommendedModels = recommendModels(config, scores, modelCategory, data);
  const topModel = recommendedModels[0] ?? data.models[0];
  const securityTier = data.securityTiers.find((tier) => tier.slug === config.securityTier) ?? data.securityTiers[1];
  const hardwareTier = recommendHardware(config, scores, topModel, securityTier, data.hardwareTiers);
  const toolAddons = recommendAddons(config, scores, data);
  const addonCosts = sumAddonCosts(toolAddons);
  const securityMultiplier = securityTier.costMultiplier || 1;
  const discountMultiplier = data.pricing.foundingCustomerDiscountPercent
    ? 1 - data.pricing.foundingCustomerDiscountPercent / 100
    : 1;

  const implementationLow = Math.round((data.pricing.baseInstallationLow * securityMultiplier + addonCosts.low) * discountMultiplier);
  const implementationHigh = Math.round((data.pricing.baseInstallationHigh * securityMultiplier + addonCosts.high) * discountMultiplier);
  const monthlyLow = Math.round((data.pricing.monthlySupportLow + addonCosts.monthly) * (securityMultiplier > 1.5 ? 1.2 : 1));
  const monthlyHigh = Math.round((data.pricing.monthlySupportHigh + addonCosts.monthly * 1.4) * (securityMultiplier > 1.5 ? 1.25 : 1));
  const confidenceResult = confidence(config, scores);

  return {
    scores,
    modelCategory,
    topModel,
    alternativeModels: recommendedModels.slice(1),
    hardwareTier,
    securityTier,
    toolAddons,
    estimatedHardwareCost: {
      low: hardwareTier.estimatedHardwareCostLow,
      high: hardwareTier.estimatedHardwareCostHigh
    },
    estimatedImplementationCost: {
      low: implementationLow,
      high: implementationHigh
    },
    estimatedMonthlySupport: {
      low: monthlyLow,
      high: monthlyHigh
    },
    estimateConfidence: confidenceResult.label,
    confidenceScore: confidenceResult.confidenceScore,
    explanations: buildExplanations(config, scores, modelCategory, topModel, hardwareTier, securityTier, toolAddons),
    preliminaryNotice: "This is a preliminary estimate. Final pricing requires a technical assessment."
  };
}
