import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { AdminCatalogEditor } from "@/components/admin-catalog-editor";
import { AdminLoginForm } from "@/components/admin-login-form";
import { adminPasswordIsDefault, isAdminAuthenticated } from "@/lib/admin-auth";
import { getCatalogDataFromDb } from "@/lib/catalog-db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalog Admin"
};

export default async function AdminCatalogPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="bg-field">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <AdminLoginForm passwordIsDefault={adminPasswordIsDefault()} />
        </div>
      </main>
    );
  }

  const catalog = await getCatalogDataFromDb();

  return (
    <main className="bg-field">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/admin"
          className="focus-ring mb-5 inline-flex items-center gap-2 rounded text-sm font-semibold text-steel hover:text-ink"
        >
          <ArrowLeft aria-hidden="true" size={17} />
          Back to leads
        </Link>
        <AdminCatalogEditor initialCatalog={catalog} />
      </div>
    </main>
  );
}
