import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About"
};

const values = [
  "Practical AI",
  "Secure deployments",
  "Local/private processing",
  "Business workflow focus",
  "No hype"
];

export default function AboutPage() {
  return (
    <main className="bg-field">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">About Iron Point</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-ink">Private AI should be understandable, useful, and controlled.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-steel">
            Iron Point helps businesses put AI close to the documents, systems, and policies that matter without asking
            them to move sensitive files into public tools.
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div>
            <h2 className="text-2xl font-semibold text-ink">The mission</h2>
            <p className="mt-4 text-base leading-7 text-steel">
              Make private AI adoption less mysterious. Iron Point starts with documents, users, access rules, and
              day-to-day workflows, then recommends a model and hardware path that can be assessed and supported.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {values.map((value) => (
              <div key={value} className="rounded border border-line bg-white p-5 text-base font-semibold text-ink">
                {value}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
