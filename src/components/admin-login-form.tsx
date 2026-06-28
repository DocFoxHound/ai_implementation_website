"use client";

import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";

export function AdminLoginForm({ passwordIsDefault }: { passwordIsDefault: boolean }) {
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      setStatus("error");
      setMessage(result.message ?? "Invalid admin password.");
      return;
    }

    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-md rounded border border-line bg-white p-5 shadow-sm">
      <h1 className="text-2xl font-semibold text-ink">Admin login</h1>
      <p className="mt-2 text-sm leading-6 text-steel">Access estimator submissions and editable catalog records.</p>
      {passwordIsDefault ? (
        <p className="mt-4 rounded border border-copper/30 bg-[#fff8f1] p-3 text-xs leading-5 text-[#74431f]">
          Development password is active. Set ADMIN_PASSWORD and ADMIN_SECRET before using this admin area outside local
          development.
        </p>
      ) : null}
      <form onSubmit={submit} className="mt-5 space-y-4">
        <label className="block text-sm font-semibold text-ink">
          Password
          <input
            required
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="focus-ring mt-2 w-full rounded border border-line bg-field px-3 py-2"
          />
        </label>
        {message ? (
          <p className="text-sm text-red-700" role="status">
            {message}
          </p>
        ) : null}
        <button
          disabled={status === "submitting"}
          className="focus-ring inline-flex items-center gap-2 rounded bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-moss disabled:opacity-60"
        >
          <LogIn aria-hidden="true" size={17} />
          {status === "submitting" ? "Signing in" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
