import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { EstimatorBuilder } from "@/components/estimator-builder";
import { catalogData } from "@/lib/seed-data";

export const metadata: Metadata = {
  title: "Private AI System Estimator"
};

export default function EstimatorPage() {
  return (
    <main className="bg-field">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-moss">
                <ShieldCheck aria-hidden="true" size={18} />
                Build Your Private AI System
              </p>
              <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-ink">Private AI System Estimator</h1>
              <p className="mt-4 max-w-3xl text-base leading-7 text-steel">
                Explore model category, hardware tier, security posture, add-ons, and planning ranges before requesting
                a technical review.
              </p>
            </div>
            <p className="max-w-md rounded border border-copper/30 bg-[#fff8f1] p-3 text-xs leading-5 text-[#74431f]">
              Do not submit confidential, classified, regulated, privileged, or sensitive files through this website.
            </p>
          </div>
        </div>
      </section>
      <EstimatorBuilder initialCatalog={catalogData} />
    </main>
  );
}
