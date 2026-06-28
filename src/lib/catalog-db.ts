import { Prisma } from "@prisma/client";
import { catalogData } from "./seed-data";
import type { CatalogData, HardwareTier, ModelCatalogItem, SecurityTier, ToolAddon } from "./types";
import { prisma } from "./prisma";

function stringify(value: unknown) {
  return JSON.stringify(value);
}

function parseArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export async function seedCatalogDatabase() {
  await Promise.all(
    catalogData.models.map((model) =>
      prisma.aiModel.upsert({
        where: { exactModelId: model.exactModelId },
        update: modelToDb(model),
        create: modelToDb(model)
      })
    )
  );

  await Promise.all(
    catalogData.hardwareTiers.map((tier) =>
      prisma.hardwareTier.upsert({
        where: { slug: tier.slug },
        update: hardwareToDb(tier),
        create: hardwareToDb(tier)
      })
    )
  );

  await Promise.all(
    catalogData.securityTiers.map((tier) =>
      prisma.securityTier.upsert({
        where: { slug: tier.slug },
        update: securityToDb(tier),
        create: securityToDb(tier)
      })
    )
  );

  await Promise.all(
    catalogData.toolAddons.map((addon) =>
      prisma.toolAddon.upsert({
        where: { slug: addon.slug },
        update: addonToDb(addon),
        create: addonToDb(addon)
      })
    )
  );

  await prisma.pricingAssumption.upsert({
    where: { id: catalogData.pricing.id },
    update: catalogData.pricing,
    create: catalogData.pricing
  });
}

export async function ensureCatalogSeeded() {
  const [models, hardware, security, addons, pricing] = await Promise.all([
    prisma.aiModel.count(),
    prisma.hardwareTier.count(),
    prisma.securityTier.count(),
    prisma.toolAddon.count(),
    prisma.pricingAssumption.count()
  ]);

  if (!models || !hardware || !security || !addons || !pricing) {
    await seedCatalogDatabase();
  }
}

export async function getCatalogDataFromDb(): Promise<CatalogData> {
  await ensureCatalogSeeded();

  const [models, hardwareTiers, securityTiers, toolAddons, pricing] = await Promise.all([
    prisma.aiModel.findMany({ where: { enabled: true }, orderBy: { name: "asc" } }),
    prisma.hardwareTier.findMany({ orderBy: { estimatedHardwareCostLow: "asc" } }),
    prisma.securityTier.findMany({ orderBy: { estimatedImplementationComplexity: "asc" } }),
    prisma.toolAddon.findMany({ orderBy: { name: "asc" } }),
    prisma.pricingAssumption.findUnique({ where: { id: "default" } })
  ]);

  return {
    models: models.map((model) => ({
      ...model,
      commercialUseAllowed: model.commercialUseAllowed as ModelCatalogItem["commercialUseAllowed"],
      modelCategory: model.modelCategory as ModelCatalogItem["modelCategory"],
      agenticWorkflowSuitability: model.agenticWorkflowSuitability as ModelCatalogItem["agenticWorkflowSuitability"],
      codingAbility: model.codingAbility as ModelCatalogItem["codingAbility"],
      hardwareCategory: model.hardwareCategory as ModelCatalogItem["hardwareCategory"],
      strengths: parseArray(model.strengthsJson),
      weaknesses: parseArray(model.weaknessesJson),
      bestUseCases: parseArray(model.bestUseCasesJson),
      supportedRuntimes: parseArray(model.supportedRuntimesJson)
    })),
    hardwareTiers: hardwareTiers.map((tier) => ({
      ...tier,
      gpuExamples: parseArray(tier.gpuExamplesJson)
    })),
    securityTiers: securityTiers.map((tier) => ({
      ...tier,
      slug: tier.slug as SecurityTier["slug"]
    })),
    toolAddons: toolAddons.map((addon) => ({
      ...addon,
      complexity: addon.complexity as ToolAddon["complexity"]
    })),
    pricing: pricing
      ? {
          id: "default",
          baseInstallationLow: pricing.baseInstallationLow,
          baseInstallationHigh: pricing.baseInstallationHigh,
          customDevelopmentHourlyEstimate: pricing.customDevelopmentHourlyEstimate,
          monthlySupportLow: pricing.monthlySupportLow,
          monthlySupportHigh: pricing.monthlySupportHigh,
          assessmentPrice: pricing.assessmentPrice,
          foundingCustomerDiscountPercent: pricing.foundingCustomerDiscountPercent,
          notes: pricing.notes
        }
      : catalogData.pricing
  };
}

export async function getCatalogDataWithFallback(): Promise<CatalogData> {
  try {
    return await getCatalogDataFromDb();
  } catch {
    return catalogData;
  }
}

export async function updateCatalogRecord(type: string, id: string, data: Record<string, unknown>) {
  switch (type) {
    case "model":
      return prisma.aiModel.update({ where: { id }, data: modelToDb(data as unknown as ModelCatalogItem) });
    case "hardware":
      return prisma.hardwareTier.update({ where: { id }, data: hardwareToDb(data as unknown as HardwareTier) });
    case "security":
      return prisma.securityTier.update({ where: { id }, data: securityToDb(data as unknown as SecurityTier) });
    case "addon":
      return prisma.toolAddon.update({ where: { id }, data: addonToDb(data as unknown as ToolAddon) });
    case "pricing":
      return prisma.pricingAssumption.update({ where: { id }, data: pricingToDb(data) });
    default:
      throw new Error("Unknown catalog type");
  }
}

function modelToDb(model: ModelCatalogItem): Prisma.AiModelUncheckedCreateInput {
  return {
    id: model.id,
    name: model.name,
    exactModelId: model.exactModelId,
    provider: model.provider,
    license: model.license,
    commercialUseAllowed: model.commercialUseAllowed,
    releaseDate: model.releaseDate,
    lastReviewedDate: model.lastReviewedDate,
    modelCategory: model.modelCategory,
    modelType: model.modelType,
    totalParameters: model.totalParameters,
    activeParameters: model.activeParameters,
    contextTokens: Number(model.contextTokens),
    estimatedContextWords: Number(model.estimatedContextWords),
    maximumOutputTokens: Number(model.maximumOutputTokens),
    modality: model.modality,
    strengthsJson: stringify(model.strengths ?? []),
    weaknessesJson: stringify(model.weaknesses ?? []),
    bestUseCasesJson: stringify(model.bestUseCases ?? []),
    toolCallingSupport: Boolean(model.toolCallingSupport),
    structuredOutputSupport: Boolean(model.structuredOutputSupport),
    agenticWorkflowSuitability: model.agenticWorkflowSuitability,
    codingAbility: model.codingAbility,
    multimodalSupport: Boolean(model.multimodalSupport),
    minimumVramGb: Number(model.minimumVramGb),
    recommendedVramGb: Number(model.recommendedVramGb),
    minimumSystemRamGb: Number(model.minimumSystemRamGb),
    recommendedSystemRamGb: Number(model.recommendedSystemRamGb),
    storageRequirementGb: Number(model.storageRequirementGb),
    supportedRuntimesJson: stringify(model.supportedRuntimes ?? []),
    offlineCapable: Boolean(model.offlineCapable),
    airGapSuitable: Boolean(model.airGapSuitable),
    hardwareCategory: model.hardwareCategory,
    notes: model.notes ?? "",
    sourceUrl: model.sourceUrl ?? "",
    enabled: model.enabled ?? true
  };
}

function hardwareToDb(tier: HardwareTier): Prisma.HardwareTierUncheckedCreateInput {
  return {
    id: tier.id,
    slug: tier.slug,
    tierName: tier.tierName,
    customerDescription: tier.customerDescription,
    minimumVramGb: Number(tier.minimumVramGb),
    recommendedVramGb: Number(tier.recommendedVramGb),
    minimumRamGb: Number(tier.minimumRamGb),
    recommendedRamGb: Number(tier.recommendedRamGb),
    cpuClass: tier.cpuClass,
    storageRecommendation: tier.storageRecommendation,
    gpuExamplesJson: stringify(tier.gpuExamples ?? []),
    expectedUsers: tier.expectedUsers,
    expectedDocumentWorkload: tier.expectedDocumentWorkload,
    estimatedHardwareCostLow: Number(tier.estimatedHardwareCostLow),
    estimatedHardwareCostHigh: Number(tier.estimatedHardwareCostHigh),
    notes: tier.notes ?? ""
  };
}

function securityToDb(tier: SecurityTier): Prisma.SecurityTierUncheckedCreateInput {
  return {
    id: tier.id,
    slug: tier.slug,
    tierName: tier.tierName,
    description: tier.description,
    internetAccessAllowed: Boolean(tier.internetAccessAllowed),
    localProcessingRequired: Boolean(tier.localProcessingRequired),
    airGapRequired: Boolean(tier.airGapRequired),
    auditLoggingRequired: Boolean(tier.auditLoggingRequired),
    roleBasedAccessRequired: Boolean(tier.roleBasedAccessRequired),
    offlineUpdateProcedureRequired: Boolean(tier.offlineUpdateProcedureRequired),
    complianceDocumentationRequired: Boolean(tier.complianceDocumentationRequired),
    estimatedImplementationComplexity: Number(tier.estimatedImplementationComplexity),
    costMultiplier: Number(tier.costMultiplier),
    notes: tier.notes ?? ""
  };
}

function addonToDb(addon: ToolAddon): Prisma.ToolAddonUncheckedCreateInput {
  return {
    id: addon.id,
    slug: addon.slug,
    name: addon.name,
    description: addon.description,
    complexity: addon.complexity,
    estimatedSetupCostLow: Number(addon.estimatedSetupCostLow),
    estimatedSetupCostHigh: Number(addon.estimatedSetupCostHigh),
    monthlySupportImpact: Number(addon.monthlySupportImpact),
    requiredSecurityConsiderations: addon.requiredSecurityConsiderations,
    notes: addon.notes ?? ""
  };
}

function pricingToDb(data: Record<string, unknown>): Prisma.PricingAssumptionUncheckedUpdateInput {
  return {
    baseInstallationLow: Number(data.baseInstallationLow),
    baseInstallationHigh: Number(data.baseInstallationHigh),
    customDevelopmentHourlyEstimate: Number(data.customDevelopmentHourlyEstimate),
    monthlySupportLow: Number(data.monthlySupportLow),
    monthlySupportHigh: Number(data.monthlySupportHigh),
    assessmentPrice: Number(data.assessmentPrice),
    foundingCustomerDiscountPercent: Number(data.foundingCustomerDiscountPercent),
    notes: String(data.notes ?? "")
  };
}
