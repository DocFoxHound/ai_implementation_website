"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

interface ContactState {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  preferredContact: "email" | "phone" | "either";
  notes: string;
}

const initialState: ContactState = {
  name: "",
  businessName: "",
  email: "",
  phone: "",
  preferredContact: "email",
  notes: ""
};

export function ContactForm() {
  const [form, setForm] = useState<ContactState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(result.message ?? "Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    setMessage("Thanks. Iron Point received your request.");
    setForm(initialState);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded border border-line bg-white p-5 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-ink">
          Name
          <input
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="focus-ring mt-2 w-full rounded border border-line bg-field px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Business name
          <input
            required
            value={form.businessName}
            onChange={(event) => setForm({ ...form, businessName: event.target.value })}
            className="focus-ring mt-2 w-full rounded border border-line bg-field px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Email
          <input
            required
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="focus-ring mt-2 w-full rounded border border-line bg-field px-3 py-2 text-sm"
          />
        </label>
        <label className="text-sm font-medium text-ink">
          Phone
          <input
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="focus-ring mt-2 w-full rounded border border-line bg-field px-3 py-2 text-sm"
          />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-ink">
        Preferred contact
        <select
          value={form.preferredContact}
          onChange={(event) => setForm({ ...form, preferredContact: event.target.value as ContactState["preferredContact"] })}
          className="focus-ring mt-2 w-full rounded border border-line bg-field px-3 py-2 text-sm"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="either">Either</option>
        </select>
      </label>
      <label className="mt-4 block text-sm font-medium text-ink">
        Notes
        <textarea
          value={form.notes}
          onChange={(event) => setForm({ ...form, notes: event.target.value })}
          rows={5}
          className="focus-ring mt-2 w-full rounded border border-line bg-field px-3 py-2 text-sm"
        />
      </label>
      <p className="mt-3 rounded border border-copper/30 bg-[#fff8f1] p-3 text-xs leading-5 text-[#74431f]">
        Do not submit confidential, classified, regulated, privileged, or sensitive files through this website.
      </p>
      {message ? (
        <p className={`mt-3 text-sm ${status === "error" ? "text-red-700" : "text-moss"}`} role="status">
          {message}
        </p>
      ) : null}
      <button
        disabled={status === "submitting"}
        className="focus-ring mt-5 inline-flex items-center gap-2 rounded bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-60"
      >
        <Send aria-hidden="true" size={17} />
        {status === "submitting" ? "Sending" : "Send"}
      </button>
    </form>
  );
}
