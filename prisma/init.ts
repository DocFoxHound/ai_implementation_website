import { seedCatalogDatabase } from "../src/lib/catalog-db";
import { prisma } from "../src/lib/prisma";

const statements = [
  `CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "preferredContact" TEXT NOT NULL,
    "notes" TEXT,
    "intent" TEXT NOT NULL,
    "configurationJson" TEXT NOT NULL,
    "recommendedModelJson" TEXT NOT NULL,
    "hardwareTierJson" TEXT NOT NULL,
    "securityTierJson" TEXT NOT NULL,
    "addOnsJson" TEXT NOT NULL,
    "estimateJson" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "AiModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "exactModelId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "license" TEXT NOT NULL,
    "commercialUseAllowed" TEXT NOT NULL,
    "releaseDate" TEXT NOT NULL,
    "lastReviewedDate" TEXT NOT NULL,
    "modelCategory" TEXT NOT NULL,
    "modelType" TEXT NOT NULL,
    "totalParameters" TEXT NOT NULL,
    "activeParameters" TEXT NOT NULL,
    "contextTokens" INTEGER NOT NULL,
    "estimatedContextWords" INTEGER NOT NULL,
    "maximumOutputTokens" INTEGER NOT NULL,
    "modality" TEXT NOT NULL,
    "strengthsJson" TEXT NOT NULL,
    "weaknessesJson" TEXT NOT NULL,
    "bestUseCasesJson" TEXT NOT NULL,
    "toolCallingSupport" BOOLEAN NOT NULL,
    "structuredOutputSupport" BOOLEAN NOT NULL,
    "agenticWorkflowSuitability" TEXT NOT NULL,
    "codingAbility" TEXT NOT NULL,
    "multimodalSupport" BOOLEAN NOT NULL,
    "minimumVramGb" INTEGER NOT NULL,
    "recommendedVramGb" INTEGER NOT NULL,
    "minimumSystemRamGb" INTEGER NOT NULL,
    "recommendedSystemRamGb" INTEGER NOT NULL,
    "storageRequirementGb" INTEGER NOT NULL,
    "supportedRuntimesJson" TEXT NOT NULL,
    "offlineCapable" BOOLEAN NOT NULL,
    "airGapSuitable" BOOLEAN NOT NULL,
    "hardwareCategory" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "HardwareTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "customerDescription" TEXT NOT NULL,
    "minimumVramGb" INTEGER NOT NULL,
    "recommendedVramGb" INTEGER NOT NULL,
    "minimumRamGb" INTEGER NOT NULL,
    "recommendedRamGb" INTEGER NOT NULL,
    "cpuClass" TEXT NOT NULL,
    "storageRecommendation" TEXT NOT NULL,
    "gpuExamplesJson" TEXT NOT NULL,
    "expectedUsers" TEXT NOT NULL,
    "expectedDocumentWorkload" TEXT NOT NULL,
    "estimatedHardwareCostLow" INTEGER NOT NULL,
    "estimatedHardwareCostHigh" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "SecurityTier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "tierName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "internetAccessAllowed" BOOLEAN NOT NULL,
    "localProcessingRequired" BOOLEAN NOT NULL,
    "airGapRequired" BOOLEAN NOT NULL,
    "auditLoggingRequired" BOOLEAN NOT NULL,
    "roleBasedAccessRequired" BOOLEAN NOT NULL,
    "offlineUpdateProcedureRequired" BOOLEAN NOT NULL,
    "complianceDocumentationRequired" BOOLEAN NOT NULL,
    "estimatedImplementationComplexity" INTEGER NOT NULL,
    "costMultiplier" REAL NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "ToolAddon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "complexity" TEXT NOT NULL,
    "estimatedSetupCostLow" INTEGER NOT NULL,
    "estimatedSetupCostHigh" INTEGER NOT NULL,
    "monthlySupportImpact" INTEGER NOT NULL,
    "requiredSecurityConsiderations" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS "PricingAssumption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "baseInstallationLow" INTEGER NOT NULL,
    "baseInstallationHigh" INTEGER NOT NULL,
    "customDevelopmentHourlyEstimate" INTEGER NOT NULL,
    "monthlySupportLow" INTEGER NOT NULL,
    "monthlySupportHigh" INTEGER NOT NULL,
    "assessmentPrice" INTEGER NOT NULL,
    "foundingCustomerDiscountPercent" INTEGER NOT NULL,
    "notes" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "AiModel_exactModelId_key" ON "AiModel"("exactModelId")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "HardwareTier_slug_key" ON "HardwareTier"("slug")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "SecurityTier_slug_key" ON "SecurityTier"("slug")`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "ToolAddon_slug_key" ON "ToolAddon"("slug")`
];

async function main() {
  for (const statement of statements) {
    await prisma.$executeRawUnsafe(statement);
  }

  await seedCatalogDatabase();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
