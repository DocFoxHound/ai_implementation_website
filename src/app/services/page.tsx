import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services"
};

const services = [
  "Local AI installation",
  "Secure document search",
  "User access controls",
  "Custom workflow tools",
  "Scheduled reports",
  "Database and file-share integration",
  "Developer AI tools",
  "Air-gapped and high-security AI planning"
];

export default function ServicesPage() {
  return (
    <main className="bg-field">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Services</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-ink">Private AI systems built around your documents and workflow.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-steel">
            Iron Point focuses on practical AI deployments: secure document search, private processing, permissions,
            integrations, and workflow tools that fit real business operations.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
          {services.map((service) => (
            <article key={service} className="rounded border border-line bg-white p-5">
              <CheckCircle2 aria-hidden="true" className="text-moss" size={22} />
              <h2 className="mt-4 text-base font-semibold text-ink">{service}</h2>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-ink">No hype. No sensitive uploads. No final quote from a form.</h2>
            <p className="mt-4 text-base leading-7 text-steel">
              The estimator gives a planning range and a recommended starting point. Final recommendations require a
              technical assessment of your documents, network, permissions, hardware, and support expectations.
            </p>
          </div>
          <Link
            href="/estimator"
            className="focus-ring inline-flex h-fit items-center justify-center rounded bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-moss"
          >
            Estimate Your Setup
          </Link>
        </div>
      </section>
    </main>
  );
}
