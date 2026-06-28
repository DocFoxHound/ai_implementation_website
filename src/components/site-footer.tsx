import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 text-sm text-steel sm:px-6 md:grid-cols-[1fr_auto] lg:px-8">
        <div>
          <p className="font-semibold text-ink">Iron Point</p>
          <p className="mt-2 max-w-2xl">
            Private/local AI installation, secure document search, workflow tools, and high-security deployment planning
            for businesses that need practical AI without public document exposure.
          </p>
        </div>
        <div className="flex flex-wrap items-start gap-3 md:justify-end">
          <Link className="focus-ring rounded text-steel hover:text-ink" href="/estimator">
            Estimator
          </Link>
          <Link className="focus-ring rounded text-steel hover:text-ink" href="/contact">
            Contact
          </Link>
          <Link className="focus-ring rounded text-steel hover:text-ink" href="/admin">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
