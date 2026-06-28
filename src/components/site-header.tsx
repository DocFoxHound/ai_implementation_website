import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const navItems = [
  { href: "/services", label: "Services" },
  { href: "/estimator", label: "Estimator" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-field/92 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="focus-ring flex items-center gap-2 rounded-sm text-ink">
          <span className="flex h-9 w-9 items-center justify-center rounded bg-ink text-white">
            <ShieldCheck aria-hidden="true" size={20} />
          </span>
          <span className="text-base font-semibold">Iron Point</span>
        </Link>
        <nav aria-label="Primary navigation" className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="focus-ring rounded px-2.5 py-2 text-sm font-medium text-steel transition hover:bg-white hover:text-ink sm:px-3"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
