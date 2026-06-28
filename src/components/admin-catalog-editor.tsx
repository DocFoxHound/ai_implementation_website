"use client";

import { useMemo, useState } from "react";
import { RefreshCcw, Save } from "lucide-react";
import type { CatalogData } from "@/lib/types";

type Tab = "model" | "hardware" | "security" | "addon" | "pricing";

const tabs: { value: Tab; label: string }[] = [
  { value: "model", label: "Models" },
  { value: "hardware", label: "Hardware" },
  { value: "security", label: "Security" },
  { value: "addon", label: "Add-ons" },
  { value: "pricing", label: "Pricing" }
];

export function AdminCatalogEditor({ initialCatalog }: { initialCatalog: CatalogData }) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [tab, setTab] = useState<Tab>("model");
  const records = useMemo(() => getRecords(catalog, tab), [catalog, tab]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = records[Math.min(selectedIndex, records.length - 1)];
  const [draft, setDraft] = useState(() => JSON.stringify(selected, null, 2));
  const [message, setMessage] = useState("");

  function switchTab(next: Tab) {
    setTab(next);
    setSelectedIndex(0);
    const nextRecord = getRecords(catalog, next)[0];
    setDraft(JSON.stringify(nextRecord, null, 2));
    setMessage("");
  }

  function selectRecord(index: number) {
    setSelectedIndex(index);
    setDraft(JSON.stringify(records[index], null, 2));
    setMessage("");
  }

  async function saveRecord() {
    setMessage("");
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(draft);
    } catch {
      setMessage("JSON is not valid.");
      return;
    }

    const id = String(parsed.id ?? "");
    if (!id) {
      setMessage("Record id is missing.");
      return;
    }

    const response = await fetch("/api/admin/catalog", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: tab, id, data: parsed })
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.message ?? "Could not save catalog record.");
      return;
    }

    const refreshed = await fetch("/api/admin/catalog").then((res) => res.json());
    setCatalog(refreshed);
    setMessage("Catalog record updated.");
  }

  async function syncSeedData() {
    setMessage("");
    const response = await fetch("/api/admin/catalog", { method: "POST" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setMessage(result.message ?? "Could not sync seed data.");
      return;
    }
    setCatalog(result.catalog);
    setDraft(JSON.stringify(getRecords(result.catalog, tab)[0], null, 2));
    setSelectedIndex(0);
    setMessage("Seed data synced.");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded border border-line bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Catalog editor</h1>
          <p className="mt-1 text-sm text-steel">Edit model, hardware, security, add-on, and pricing assumptions.</p>
        </div>
        <button
          onClick={syncSeedData}
          className="focus-ring inline-flex items-center gap-2 rounded border border-line bg-field px-3 py-2 text-sm font-semibold text-ink hover:bg-white"
        >
          <RefreshCcw aria-hidden="true" size={16} />
          Sync seed data
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((item) => (
          <button
            key={item.value}
            onClick={() => switchTab(item.value)}
            className={`focus-ring rounded px-3 py-2 text-sm font-semibold ${
              tab === item.value ? "bg-ink text-white" : "border border-line bg-white text-ink hover:bg-field"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded border border-line bg-white p-3 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-steel">Records</p>
          <div className="max-h-[620px] space-y-2 overflow-auto">
            {records.map((record, index) => (
              <button
                key={String(record.id ?? record.slug ?? record.name)}
                onClick={() => selectRecord(index)}
                className={`focus-ring block w-full rounded px-3 py-2 text-left text-sm ${
                  index === selectedIndex ? "bg-[#eef7f0] font-semibold text-moss" : "bg-field text-ink hover:bg-white"
                }`}
              >
                {String(record.name ?? record.tierName ?? record.id)}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded border border-line bg-white p-4 shadow-sm">
          <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-steel">
            JSON record
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={26}
              className="focus-ring mt-2 w-full rounded border border-line bg-field p-3 font-mono text-xs leading-5 text-ink"
            />
          </label>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={saveRecord}
              className="focus-ring inline-flex items-center gap-2 rounded bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-moss"
            >
              <Save aria-hidden="true" size={17} />
              Save record
            </button>
            {message ? (
              <p className="text-sm text-steel" role="status">
                {message}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function getRecords(catalog: CatalogData, tab: Tab): Array<Record<string, unknown>> {
  if (tab === "model") return catalog.models as unknown as Array<Record<string, unknown>>;
  if (tab === "hardware") return catalog.hardwareTiers as unknown as Array<Record<string, unknown>>;
  if (tab === "security") return catalog.securityTiers as unknown as Array<Record<string, unknown>>;
  if (tab === "addon") return catalog.toolAddons as unknown as Array<Record<string, unknown>>;
  return [catalog.pricing as unknown as Record<string, unknown>];
}
