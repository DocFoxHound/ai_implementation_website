import { z } from "zod";

const estimatorConfigSchema = z.object({
  employees: z.number().min(1).max(10000),
  aiUsers: z.number().min(1).max(10000),
  simultaneousUsers: z.number().min(1).max(10000),
  usageLevel: z.enum(["light", "standard", "heavy", "mission-critical"]),
  documentCount: z.enum(["under-1k", "1k-10k", "10k-50k", "50k-250k", "over-250k", "not-sure"]),
  totalFileSize: z.enum(["under-10gb", "10gb-100gb", "100gb-1tb", "1tb-10tb", "over-10tb", "not-sure"]),
  typicalDocumentSize: z.enum(["short", "medium", "large", "very-large", "libraries"]),
  fileTypes: z.array(z.string()).max(16),
  workloads: z.array(z.string()).max(16),
  securityTier: z.enum([
    "secure-connected",
    "private-on-prem",
    "offline-air-gapped",
    "regulated-high-assurance",
    "classified-support"
  ]),
  performancePreference: z.enum(["cost-focused", "balanced", "performance-focused"]),
  existingHardware: z.enum(["new-hardware", "may-have-hardware", "already-server", "already-gpus", "not-sure"]),
  budgetSensitivity: z.enum(["lowest-cost", "balance-cost-performance", "prioritize-growth", "not-sure"])
});

const estimateSchema = z.object({}).passthrough();

export const leadSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  businessName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  preferredContact: z.enum(["email", "phone", "either"]),
  notes: z.string().trim().max(1200).optional().or(z.literal("")),
  intent: z.enum(["email-estimate", "technical-review", "consultation", "save-configuration", "contact"]),
  configuration: estimatorConfigSchema,
  estimate: estimateSchema
});

export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2).max(100),
  businessName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  preferredContact: z.enum(["email", "phone", "either"]),
  notes: z.string().trim().max(1200).optional().or(z.literal(""))
});

export const leadStatusSchema = z.enum([
  "NEW",
  "CONTACTED",
  "ASSESSMENT_SCHEDULED",
  "PROPOSAL_SENT",
  "CLOSED_WON",
  "CLOSED_LOST",
  "NOT_A_FIT"
]);

const restrictedContentPatterns = [
  /password/i,
  /credential/i,
  /secret key/i,
  /api key/i,
  /classified/i,
  /cui sample/i,
  /medical record/i,
  /patient/i,
  /ssn/i,
  /social security/i,
  /private key/i,
  /database login/i
];

export function containsRestrictedContent(value: string | undefined) {
  if (!value) return false;
  return restrictedContentPatterns.some((pattern) => pattern.test(value));
}
