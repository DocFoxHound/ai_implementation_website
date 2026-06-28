"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardCheck,
  Mail,
  RotateCcw,
  Save,
  Send,
  ShieldCheck
} from "lucide-react";
import { buildEstimate } from "@/lib/estimator";
import { useEstimatorStore } from "@/lib/estimator-store";
import { catalogData } from "@/lib/seed-data";
import type {
  BudgetSensitivity,
  CatalogData,
  DocumentCount,
  ExistingHardware,
  FileSize,
  LeadSubmissionInput,
  PerformancePreference,
  SecurityTierSlug,
  TypicalDocumentSize,
  UsageLevel
} from "@/lib/types";
import { formatRange } from "./format";

const usageOptions: { value: UsageLevel; label: string; text: string }[] = [
  { value: "light", label: "Light", text: "Occasional search and summaries" },
  { value: "standard", label: "Standard", text: "Daily use by a small team" },
  { value: "heavy", label: "Heavy", text: "Frequent use and background jobs" },
  { value: "mission-critical", label: "Mission-critical", text: "Core workflow dependency" }
];

const documentCountOptions: { value: DocumentCount; label: string }[] = [
  { value: "under-1k", label: "Under 1,000" },
  { value: "1k-10k", label: "1,000 to 10,000" },
  { value: "10k-50k", label: "10,000 to 50,000" },
  { value: "50k-250k", label: "50,000 to 250,000" },
  { value: "over-250k", label: "More than 250,000" },
  { value: "not-sure", label: "Not sure" }
];

const fileSizeOptions: { value: FileSize; label: string }[] = [
  { value: "under-10gb", label: "Under 10 GB" },
  { value: "10gb-100gb", label: "10 to 100 GB" },
  { value: "100gb-1tb", label: "100 GB to 1 TB" },
  { value: "1tb-10tb", label: "1 TB to 10 TB" },
  { value: "over-10tb", label: "More than 10 TB" },
  { value: "not-sure", label: "Not sure" }
];

const documentSizeOptions: { value: TypicalDocumentSize; label: string }[] = [
  { value: "short", label: "Short documents under 5 pages" },
  { value: "medium", label: "Medium documents, 5 to 50 pages" },
  { value: "large", label: "Large documents, 50 to 300 pages" },
  { value: "very-large", label: "Very large documents over 300 pages" },
  { value: "libraries", label: "Books, technical libraries, legal records, or codebases" }
];

const fileTypes = [
  "PDF",
  "Scanned PDF",
  "Word documents",
  "Excel spreadsheets",
  "PowerPoint files",
  "Plain text",
  "Emails",
  "Images",
  "CAD or engineering files",
  "Source code",
  "Database records",
  "Other"
];

const workloads = [
  "Search documents",
  "Summarize documents",
  "Analyze contracts",
  "Compare policies",
  "Generate reports",
  "Search technical manuals",
  "Summarize emails or tickets",
  "Database lookup",
  "Developer/code assistant",
  "Scheduled reports",
  "Custom workflow tools"
];

const securityCards: { value: SecurityTierSlug; label: string; text: string }[] = [
  {
    value: "secure-connected",
    label: "Secure Connected AI",
    text: "Approved cloud or remote documents, controlled processing, no public model training."
  },
  {
    value: "private-on-prem",
    label: "Private On-Prem AI",
    text: "Runs on company-owned hardware with documents inside the company network."
  },
  {
    value: "offline-air-gapped",
    label: "Offline / Air-Gapped AI",
    text: "No internet access, with controlled offline update procedures."
  },
  {
    value: "regulated-high-assurance",
    label: "Regulated / CUI / High-Assurance AI",
    text: "For CUI, FCI, legal privilege, export-controlled, or compliance-heavy environments."
  },
  {
    value: "classified-support",
    label: "Classified Environment Support",
    text: "Only under proper sponsorship, facility requirements, and legal/security authority."
  }
];

const performanceOptions: { value: PerformancePreference; label: string; text: string }[] = [
  { value: "cost-focused", label: "Cost-Focused", text: "Lower-cost hardware, best for pilots and smaller offices." },
  { value: "balanced", label: "Balanced", text: "Good daily business performance for most customers." },
  { value: "performance-focused", label: "Performance-Focused", text: "Faster answers, more users, and room for growth." }
];

const existingHardwareOptions: { value: ExistingHardware; label: string }[] = [
  { value: "new-hardware", label: "We need new hardware" },
  { value: "may-have-hardware", label: "We may have usable hardware" },
  { value: "already-server", label: "We already have a server" },
  { value: "already-gpus", label: "We already have GPUs" },
  { value: "not-sure", label: "Not sure" }
];

const budgetOptions: { value: BudgetSensitivity; label: string }[] = [
  { value: "lowest-cost", label: "Keep cost as low as possible" },
  { value: "balance-cost-performance", label: "Balance cost and performance" },
  { value: "prioritize-growth", label: "Prioritize performance and future growth" },
  { value: "not-sure", label: "Not sure" }
];

const steps = ["Business", "Documents", "Workload", "Security", "Performance", "Hardware", "Budget"];

interface EstimatorBuilderProps {
  initialCatalog?: CatalogData;
}

export function EstimatorBuilder({ initialCatalog = catalogData }: EstimatorBuilderProps) {
  const { config, updateConfig, toggleListItem, resetConfig } = useEstimatorStore();
  const [catalog, setCatalog] = useState(initialCatalog);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/catalog")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: CatalogData | null) => {
        if (!cancelled && data?.models?.length) setCatalog(data);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const estimate = useMemo(() => buildEstimate(config, catalog), [catalog, config]);

  const sections = [
    <BusinessSection key="business" />,
    <DocumentsSection key="documents" />,
    <WorkloadSection key="workload" />,
    <SecuritySection key="security" catalog={catalog} />,
    <PerformanceSection key="performance" />,
    <HardwareSection key="hardware" />,
    <BudgetSection key="budget" />
  ];

  return (
    <div className="relative">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        <div>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border border-line bg-white p-3">
            <div className="flex flex-wrap gap-2">
              {steps.map((step, index) => (
                <button
                  key={step}
                  onClick={() => setActiveStep(index)}
                  className={`focus-ring rounded px-3 py-2 text-xs font-semibold transition ${
                    activeStep === index ? "bg-ink text-white" : "bg-field text-steel hover:bg-white hover:text-ink"
                  }`}
                >
                  {step}
                </button>
              ))}
            </div>
            <button
              onClick={resetConfig}
              className="focus-ring inline-flex items-center gap-2 rounded px-3 py-2 text-xs font-semibold text-steel transition hover:bg-field hover:text-ink"
              title="Reset estimator"
            >
              <RotateCcw aria-hidden="true" size={15} />
              Reset
            </button>
          </div>

          <div className="hidden space-y-5 lg:block">{sections}</div>

          <div className="lg:hidden">
            {sections[activeStep]}
            <div className="mt-5 flex items-center justify-between gap-3 pb-24">
              <button
                onClick={() => setActiveStep((step) => Math.max(0, step - 1))}
                disabled={activeStep === 0}
                className="focus-ring inline-flex items-center gap-2 rounded border border-line bg-white px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-40"
              >
                <ArrowLeft aria-hidden="true" size={17} />
                Back
              </button>
              <button
                onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}
                disabled={activeStep === steps.length - 1}
                className="focus-ring inline-flex items-center gap-2 rounded bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
              >
                Continue
                <ArrowRight aria-hidden="true" size={17} />
              </button>
            </div>
          </div>
        </div>

        <aside className="hidden lg:block">
          <EstimatePanel estimate={estimate} />
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white p-3 shadow-[0_-12px_40px_rgba(19,32,28,0.14)] lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">Current range</p>
            <p className="text-sm font-semibold text-ink">
              {formatRange(estimate.estimatedImplementationCost.low, estimate.estimatedImplementationCost.high)}
            </p>
            <p className="text-xs text-steel">{estimate.hardwareTier.tierName}</p>
          </div>
          <button
            onClick={() => setActiveStep((step) => Math.min(steps.length - 1, step + 1))}
            className="focus-ring inline-flex items-center gap-2 rounded bg-ink px-4 py-2.5 text-sm font-semibold text-white"
          >
            {activeStep === steps.length - 1 ? "Review" : "Continue"}
            <ArrowRight aria-hidden="true" size={17} />
          </button>
        </div>
      </div>

      <div className="mx-auto block max-w-7xl px-4 pb-8 sm:px-6 lg:hidden">
        <EstimatePanel estimate={estimate} />
      </div>
    </div>
  );

  function BusinessSection() {
    return (
      <Section title="Business size" eyebrow="Users and concurrency">
        <div className="grid gap-4 md:grid-cols-3">
          <NumberSlider label="Employees" value={config.employees} min={1} max={500} onChange={(value) => updateConfig("employees", value)} />
          <NumberSlider label="Expected AI users" value={config.aiUsers} min={1} max={250} onChange={(value) => updateConfig("aiUsers", value)} />
          <NumberSlider
            label="Simultaneous users"
            value={config.simultaneousUsers}
            min={1}
            max={100}
            onChange={(value) => updateConfig("simultaneousUsers", value)}
          />
        </div>
        <OptionGrid
          className="mt-4"
          options={usageOptions}
          value={config.usageLevel}
          onChange={(value) => updateConfig("usageLevel", value)}
        />
      </Section>
    );
  }

  function DocumentsSection() {
    return (
      <Section title="Document load" eyebrow="Volume and file complexity">
        <div className="grid gap-4 md:grid-cols-2">
          <SelectBlock
            label="Approximate number of documents"
            value={config.documentCount}
            options={documentCountOptions}
            onChange={(value) => updateConfig("documentCount", value)}
          />
          <SelectBlock
            label="Approximate total file size"
            value={config.totalFileSize}
            options={fileSizeOptions}
            onChange={(value) => updateConfig("totalFileSize", value)}
          />
        </div>
        <SelectBlock
          className="mt-4"
          label="Typical document size"
          value={config.typicalDocumentSize}
          options={documentSizeOptions}
          onChange={(value) => updateConfig("typicalDocumentSize", value)}
        />
        <ChipGroup
          className="mt-4"
          label="File types"
          values={fileTypes}
          selected={config.fileTypes}
          onToggle={(value) => toggleListItem("fileTypes", value)}
        />
      </Section>
    );
  }

  function WorkloadSection() {
    return (
      <Section title="AI workload" eyebrow="Use cases">
        <ChipGroup values={workloads} selected={config.workloads} onToggle={(value) => toggleListItem("workloads", value)} />
      </Section>
    );
  }

  function SecuritySection({ catalog: currentCatalog }: { catalog: CatalogData }) {
    return (
      <Section title="Security level" eyebrow="Deployment posture">
        <div className="grid gap-3">
          {securityCards.map((card) => {
            const selected = config.securityTier === card.value;
            const dbTier = currentCatalog.securityTiers.find((tier) => tier.slug === card.value);
            return (
              <button
                key={card.value}
                onClick={() => updateConfig("securityTier", card.value)}
                className={`focus-ring rounded border p-4 text-left transition ${
                  selected ? "border-moss bg-[#eef7f0]" : "border-line bg-white hover:border-moss/50"
                }`}
              >
                <span className="flex items-start justify-between gap-4">
                  <span>
                    <span className="block text-base font-semibold text-ink">{card.label}</span>
                    <span className="mt-1 block text-sm leading-6 text-steel">{dbTier?.description ?? card.text}</span>
                  </span>
                  {selected ? <Check aria-hidden="true" className="mt-1 text-moss" size={20} /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </Section>
    );
  }

  function PerformanceSection() {
    return (
      <Section title="Performance preference" eyebrow="Cost and speed">
        <OptionGrid
          options={performanceOptions}
          value={config.performancePreference}
          onChange={(value) => updateConfig("performancePreference", value)}
        />
      </Section>
    );
  }

  function HardwareSection() {
    return (
      <Section title="Existing hardware" eyebrow="Starting point">
        <OptionGrid
          options={existingHardwareOptions}
          value={config.existingHardware}
          onChange={(value) => updateConfig("existingHardware", value)}
        />
      </Section>
    );
  }

  function BudgetSection() {
    return (
      <Section title="Budget sensitivity" eyebrow="Planning priority">
        <OptionGrid options={budgetOptions} value={config.budgetSensitivity} onChange={(value) => updateConfig("budgetSensitivity", value)} />
      </Section>
    );
  }
}

function Section({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <section className="rounded border border-line bg-white p-5 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">{eyebrow}</p>
        <h2 className="mt-1 text-xl font-semibold text-ink">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function NumberSlider({
  label,
  value,
  min,
  max,
  onChange
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded border border-line bg-field p-4">
      <span className="flex items-center justify-between gap-3 text-sm font-semibold text-ink">
        {label}
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          className="focus-ring w-20 rounded border border-line bg-white px-2 py-1 text-right text-sm"
        />
      </span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-4 w-full accent-moss"
      />
    </label>
  );
}

function OptionGrid<Value extends string>({
  options,
  value,
  onChange,
  className = ""
}: {
  options: { value: Value; label: string; text?: string }[];
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
}) {
  return (
    <div className={`grid gap-3 md:grid-cols-2 ${className}`}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`focus-ring rounded border p-4 text-left transition ${
              selected ? "border-moss bg-[#eef7f0]" : "border-line bg-field hover:border-moss/50 hover:bg-white"
            }`}
          >
            <span className="flex items-start justify-between gap-3">
              <span>
                <span className="block text-sm font-semibold text-ink">{option.label}</span>
                {option.text ? <span className="mt-1 block text-sm leading-5 text-steel">{option.text}</span> : null}
              </span>
              {selected ? <Check aria-hidden="true" className="text-moss" size={18} /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function SelectBlock<Value extends string>({
  label,
  value,
  options,
  onChange,
  className = ""
}: {
  label: string;
  value: Value;
  options: { value: Value; label: string }[];
  onChange: (value: Value) => void;
  className?: string;
}) {
  return (
    <label className={`block text-sm font-semibold text-ink ${className}`}>
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as Value)}
        className="focus-ring mt-2 w-full rounded border border-line bg-field px-3 py-2.5 text-sm text-ink"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ChipGroup({
  label,
  values,
  selected,
  onToggle,
  className = ""
}: {
  label?: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
  className?: string;
}) {
  return (
    <div className={className}>
      {label ? <p className="mb-2 text-sm font-semibold text-ink">{label}</p> : null}
      <div className="flex flex-wrap gap-2">
        {values.map((value) => {
          const active = selected.includes(value);
          return (
            <button
              key={value}
              onClick={() => onToggle(value)}
              className={`focus-ring rounded border px-3 py-2 text-sm font-medium transition ${
                active ? "border-moss bg-moss text-white" : "border-line bg-field text-ink hover:border-moss/50 hover:bg-white"
              }`}
            >
              {value}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EstimatePanel({ estimate }: { estimate: ReturnType<typeof buildEstimate> }) {
  return (
    <div className="sticky top-20 rounded border border-line bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">Live estimate</p>
          <h2 className="mt-1 text-2xl font-semibold text-ink">{estimate.modelCategory}</h2>
        </div>
        <div className="rounded bg-field px-3 py-2 text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">Confidence</p>
          <p className="text-sm font-semibold text-ink">{estimate.estimateConfidence}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <SummaryRow label="Top model" value={estimate.topModel.name} />
        <SummaryRow label="Hardware tier" value={estimate.hardwareTier.tierName} />
        <SummaryRow label="Security tier" value={estimate.securityTier.tierName} />
      </div>

      <div className="mt-5 grid gap-3">
        <CostBand label="Estimated hardware" low={estimate.estimatedHardwareCost.low} high={estimate.estimatedHardwareCost.high} />
        <CostBand label="Implementation" low={estimate.estimatedImplementationCost.low} high={estimate.estimatedImplementationCost.high} />
        <CostBand label="Monthly support" low={estimate.estimatedMonthlySupport.low} high={estimate.estimatedMonthlySupport.high} />
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-ink">Alternative models</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {estimate.alternativeModels.map((model) => (
            <span key={model.exactModelId} className="rounded bg-field px-2.5 py-1.5 text-xs font-medium text-steel">
              {model.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-sm font-semibold text-ink">Recommended add-ons</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {estimate.toolAddons.slice(0, 8).map((addon) => (
            <span key={addon.slug} className="rounded bg-[#eef7f0] px-2.5 py-1.5 text-xs font-medium text-moss">
              {addon.name}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded border border-line bg-field p-4">
        <p className="text-sm font-semibold text-ink">Why this changed</p>
        <ul className="mt-2 space-y-2 text-sm leading-5 text-steel">
          {estimate.explanations.slice(0, 5).map((explanation) => (
            <li key={explanation} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded bg-copper" />
              {explanation}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-4 rounded border border-copper/30 bg-[#fff8f1] p-3 text-xs leading-5 text-[#74431f]">
        {estimate.preliminaryNotice}
      </p>

      <LeadCapture estimate={estimate} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-line bg-field p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}

function CostBand({ label, low, high }: { label: string; low: number; high: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded border border-line p-3">
      <span className="text-sm font-medium text-steel">{label}</span>
      <span className="text-sm font-semibold text-ink">{formatRange(low, high)}</span>
    </div>
  );
}

function LeadCapture({ estimate }: { estimate: ReturnType<typeof buildEstimate> }) {
  const { config } = useEstimatorStore();
  const [intent, setIntent] = useState<LeadSubmissionInput["intent"]>("technical-review");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    businessName: "",
    email: "",
    phone: "",
    preferredContact: "email" as LeadSubmissionInput["preferredContact"],
    notes: ""
  });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const actions = [
    { value: "email-estimate", label: "Email estimate", icon: Mail },
    { value: "technical-review", label: "Technical review", icon: ClipboardCheck },
    { value: "consultation", label: "Consultation", icon: CalendarDays },
    { value: "save-configuration", label: "Save config", icon: Save }
  ] as const;

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        intent,
        configuration: config,
        estimate
      })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(result.message ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    setMessage("Iron Point received this estimate request.");
  }

  return (
    <div className="mt-5 border-t border-line pt-5">
      <div className="grid grid-cols-2 gap-2">
        {actions.map((action) => {
          const Icon = action.icon;
          const selected = intent === action.value;
          return (
            <button
              key={action.value}
              onClick={() => {
                setIntent(action.value);
                setOpen(true);
              }}
              className={`focus-ring inline-flex items-center justify-center gap-2 rounded border px-3 py-2 text-xs font-semibold transition ${
                selected && open ? "border-moss bg-[#eef7f0] text-moss" : "border-line bg-field text-ink hover:bg-white"
              }`}
            >
              <Icon aria-hidden="true" size={15} />
              {action.label}
            </button>
          );
        })}
      </div>

      {open ? (
        <form onSubmit={submitLead} className="mt-4 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <Input label="Name" value={form.name} required onChange={(value) => setForm({ ...form, name: value })} />
            <Input
              label="Business"
              value={form.businessName}
              required
              onChange={(value) => setForm({ ...form, businessName: value })}
            />
            <Input label="Email" type="email" value={form.email} required onChange={(value) => setForm({ ...form, email: value })} />
            <Input label="Phone" value={form.phone} onChange={(value) => setForm({ ...form, phone: value })} />
          </div>
          <label className="block text-xs font-semibold text-ink">
            Preferred contact
            <select
              value={form.preferredContact}
              onChange={(event) =>
                setForm({ ...form, preferredContact: event.target.value as LeadSubmissionInput["preferredContact"] })
              }
              className="focus-ring mt-1 w-full rounded border border-line bg-field px-3 py-2 text-sm"
            >
              <option value="email">Email</option>
              <option value="phone">Phone</option>
              <option value="either">Either</option>
            </select>
          </label>
          <label className="block text-xs font-semibold text-ink">
            Notes
            <textarea
              value={form.notes}
              onChange={(event) => setForm({ ...form, notes: event.target.value })}
              rows={3}
              className="focus-ring mt-1 w-full rounded border border-line bg-field px-3 py-2 text-sm"
            />
          </label>
          <p className="rounded border border-copper/30 bg-[#fff8f1] p-3 text-xs leading-5 text-[#74431f]">
            Do not submit confidential, classified, regulated, privileged, or sensitive files through this website.
          </p>
          {message ? (
            <p className={`text-sm ${status === "error" ? "text-red-700" : "text-moss"}`} role="status">
              {message}
            </p>
          ) : null}
          <button
            disabled={status === "submitting" || status === "success"}
            className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-60"
          >
            <Send aria-hidden="true" size={17} />
            {status === "submitting" ? "Sending" : "Submit"}
          </button>
        </form>
      ) : null}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  required = false
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs font-semibold text-ink">
      {label}
      <input
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="focus-ring mt-1 w-full rounded border border-line bg-field px-3 py-2 text-sm"
      />
    </label>
  );
}
