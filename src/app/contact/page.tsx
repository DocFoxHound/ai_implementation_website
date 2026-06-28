import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = {
  title: "Contact"
};

export default function ContactPage() {
  return (
    <main className="bg-field">
      <section className="border-b border-line bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-moss">Contact</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold text-ink">Talk with Iron Point about private AI.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-steel">
            Share your business contact details and a general description of what you want to explore. Do not upload or
            paste sensitive documents, credentials, regulated data, legal files, source code, or classified information.
          </p>
        </div>
      </section>
      <section>
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
