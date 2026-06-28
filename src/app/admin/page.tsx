import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin-dashboard";
import { AdminLoginForm } from "@/components/admin-login-form";
import { adminPasswordIsDefault, isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin"
};

export default async function AdminPage() {
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

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const serializableLeads = leads.map((lead) => ({
    ...lead,
    createdAt: lead.createdAt.toISOString(),
    updatedAt: lead.updatedAt.toISOString()
  }));

  return (
    <main className="bg-field">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AdminDashboard leads={serializableLeads} />
      </div>
    </main>
  );
}
