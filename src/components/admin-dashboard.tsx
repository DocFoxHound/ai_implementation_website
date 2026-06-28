"use client";

import Link from "next/link";
import { Download, LogOut, Search } from "lucide-react";

import { useMemo, useState } from "react";

const leadStatuses = [
  "NEW",
  "CONTACTED",
  "ASSESSMENT_SCHEDULED",
  "PROPOSAL_SENT",
  "CLOSED_WON",
  "CLOSED_LOST",
  "NOT_A_FIT"
] as const;

interface AdminLead {
  id: string;
  name: string;
  businessName: string;
  email: string;
  phone: string | null;
  preferredContact: string;
  notes: string | null;
  intent: string;
  status: (typeof leadStatuses)[number];
  createdAt: string;
  configurationJson: string;
  recommendedModelJson: string;
  hardwareTierJson: string;
  securityTierJson: string;
  addOnsJson: string;
  estimateJson: string;
}

export function AdminDashboard({ leads: initialLeads }: { leads: AdminLead[] }) {
  const [leads, setLeads] = useState(initialLeads);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [message, setMessage] = useState("");

  const filteredLeads = useMemo(() => {
    const lower = query.toLowerCase();
    return leads.filter((lead) => {
      const statusMatches = statusFilter === "ALL" || lead.status === statusFilter;
      const textMatches = [lead.name, lead.businessName, lead.email, lead.intent, lead.notes ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(lower);
      return statusMatches && textMatches;
    });
  }, [leads, query, statusFilter]);

  async function updateStatus(id: string, status: AdminLead["status"]) {
    setMessage("");
    const response = await fetch(`/api/admin/leads/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      setMessage("Could not update lead status.");
      return;
    }

    setLeads((current) => current.map((lead) => (lead.id === id ? { ...lead, status } : lead)));
    setMessage("Lead status updated.");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded border border-line bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Estimator submissions</h1>
          <p className="mt-1 text-sm text-steel">{leads.length} total lead records</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/catalog"
            className="focus-ring inline-flex items-center rounded border border-line bg-field px-3 py-2 text-sm font-semibold text-ink hover:bg-white"
          >
            Catalog editor
          </Link>
          <a
            href="/api/admin/export"
            className="focus-ring inline-flex items-center gap-2 rounded border border-line bg-field px-3 py-2 text-sm font-semibold text-ink hover:bg-white"
          >
            <Download aria-hidden="true" size={16} />
            CSV
          </a>
          <button
            onClick={logout}
            className="focus-ring inline-flex items-center gap-2 rounded bg-ink px-3 py-2 text-sm font-semibold text-white hover:bg-moss"
          >
            <LogOut aria-hidden="true" size={16} />
            Sign out
          </button>
        </div>
      </div>

      <div className="grid gap-3 rounded border border-line bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
        <label className="relative block">
          <Search aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 text-steel" size={17} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search leads"
            className="focus-ring w-full rounded border border-line bg-field py-2 pl-10 pr-3 text-sm"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="focus-ring rounded border border-line bg-field px-3 py-2 text-sm"
        >
          <option value="ALL">All statuses</option>
          {leadStatuses.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      {message ? (
        <p className="rounded border border-line bg-white p-3 text-sm text-moss" role="status">
          {message}
        </p>
      ) : null}

      <div className="grid gap-4">
        {filteredLeads.map((lead) => (
          <article key={lead.id} className="rounded border border-line bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-steel">
                  {new Date(lead.createdAt).toLocaleString()} - {lead.intent.replaceAll("-", " ")}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-ink">{lead.businessName}</h2>
                <p className="mt-1 text-sm text-steel">
                  {lead.name} - {lead.email}
                  {lead.phone ? ` - ${lead.phone}` : ""}
                </p>
                {lead.notes ? <p className="mt-3 max-w-3xl text-sm leading-6 text-steel">{lead.notes}</p> : null}
              </div>
              <label className="text-xs font-semibold uppercase tracking-[0.12em] text-steel">
                Status
                <select
                  value={lead.status}
                  onChange={(event) => updateStatus(lead.id, event.target.value as AdminLead["status"])}
                  className="focus-ring mt-2 block w-full min-w-56 rounded border border-line bg-field px-3 py-2 text-sm normal-case tracking-normal text-ink"
                >
                  {leadStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <details className="mt-4 rounded border border-line bg-field p-3">
              <summary className="cursor-pointer text-sm font-semibold text-ink">Full configuration and estimate</summary>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                <JsonBlock title="Configuration" value={lead.configurationJson} />
                <JsonBlock title="Estimate" value={lead.estimateJson} />
                <JsonBlock title="Recommended model" value={lead.recommendedModelJson} />
                <JsonBlock title="Hardware tier" value={lead.hardwareTierJson} />
                <JsonBlock title="Security tier" value={lead.securityTierJson} />
                <JsonBlock title="Add-ons" value={lead.addOnsJson} />
              </div>
            </details>
          </article>
        ))}
      </div>
    </div>
  );
}

function JsonBlock({ title, value }: { title: string; value: string }) {
  let formatted = value;
  try {
    formatted = JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    formatted = value;
  }

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-steel">{title}</p>
      <pre className="max-h-80 overflow-auto rounded bg-white p-3 text-xs leading-5 text-ink">{formatted}</pre>
    </div>
  );
}
