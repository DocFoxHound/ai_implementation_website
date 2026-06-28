import Image from "next/image";
import Link from "next/link";
import { ArrowRight, DatabaseZap, FileSearch, LockKeyhole, ServerCog, Workflow } from "lucide-react";

const proofPoints = [
  {
    icon: FileSearch,
    title: "Search company documents",
    text: "Index approved folders, policies, manuals, reports, and knowledge bases for private Q&A with citations."
  },
  {
    icon: ServerCog,
    title: "Run AI locally",
    text: "Plan on-prem hardware, model selection, storage, and operational support around your business needs."
  },
  {
    icon: LockKeyhole,
    title: "Control access",
    text: "Design user groups, permissions, audit logs, offline procedures, and high-security deployment paths."
  }
];

const estimatorSignals = [
  "Recommended model category",
  "Hardware tier and cost range",
  "Security tier and add-ons",
  "Implementation and support range"
];

export default function HomePage() {
  return (
    <main>
      <section className="relative min-h-[78vh] overflow-hidden bg-ink text-white">
        <Image
          src="/iron-point-hero.png"
          alt="Secure private AI hardware and document workflow in a small business IT room"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,32,28,0.90)_0%,rgba(19,32,28,0.76)_40%,rgba(19,32,28,0.28)_78%)]" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.16em] text-[#c8e0d1]">
              Local AI systems for security-conscious businesses
            </p>
            <h1 className="text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
              Private AI for your company documents.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-white/86">
              Iron Point helps businesses use AI without sending sensitive files to public AI tools.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/estimator"
                className="focus-ring inline-flex items-center gap-2 rounded bg-white px-5 py-3 text-sm font-semibold text-ink shadow-soft transition hover:bg-[#eef5ef]"
              >
                Estimate Your Private AI Setup
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
              <Link
                href="/services"
                className="focus-ring inline-flex items-center gap-2 rounded border border-white/45 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                View Services
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-8 sm:px-6 md:grid-cols-4 lg:px-8">
          {estimatorSignals.map((signal) => (
            <div key={signal} className="flex items-center gap-3 text-sm font-medium text-ink">
              <span className="h-2.5 w-2.5 rounded bg-copper" />
              {signal}
            </div>
          ))}
        </div>
      </section>

      <section className="bg-field">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">What Iron Point installs</p>
            <h2 className="mt-3 text-3xl font-semibold text-ink">Private AI that fits the way your business works.</h2>
            <p className="mt-4 text-base leading-7 text-steel">
              The first step is not buying the biggest model. It is matching documents, users, security, hardware,
              workflows, and support into one practical system.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {proofPoints.map((point) => {
              const Icon = point.icon;
              return (
                <article key={point.title} className="rounded border border-line bg-white p-5 shadow-sm">
                  <Icon aria-hidden="true" className="text-moss" size={24} />
                  <h3 className="mt-4 text-base font-semibold text-ink">{point.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-steel">{point.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div className="lg:col-span-2">
            <h2 className="text-3xl font-semibold text-ink">Build the first estimate before the first call.</h2>
            <p className="mt-4 max-w-3xl text-base leading-7 text-steel">
              Adjust company size, document load, security posture, performance goals, and workflow add-ons. The
              estimator updates the model category, hardware tier, security requirements, and preliminary cost range in
              real time.
            </p>
          </div>
          <div className="rounded border border-line bg-field p-5">
            <div className="flex items-center gap-3">
              <DatabaseZap aria-hidden="true" className="text-copper" size={24} />
              <p className="font-semibold text-ink">Catalog-backed recommendations</p>
            </div>
            <p className="mt-3 text-sm leading-6 text-steel">
              Model, hardware, security, tool, and pricing assumptions are stored as editable records for the admin MVP.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-ink text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[#c8e0d1]">
              <Workflow aria-hidden="true" size={20} />
              <span className="text-sm font-semibold uppercase tracking-[0.14em]">Interactive configurator</span>
            </div>
            <h2 className="text-2xl font-semibold">See what kind of private AI system your business may need.</h2>
          </div>
          <Link
            href="/estimator"
            className="focus-ring inline-flex items-center justify-center gap-2 rounded bg-copper px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9d5c33]"
          >
            Open Estimator
            <ArrowRight aria-hidden="true" size={18} />
          </Link>
        </div>
      </section>
    </main>
  );
}
