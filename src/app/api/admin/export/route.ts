import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function escapeCsv(value: unknown) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const leads = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
  const header = [
    "Created",
    "Status",
    "Intent",
    "Name",
    "Business",
    "Email",
    "Phone",
    "Preferred Contact",
    "Notes",
    "Estimate JSON"
  ];
  const rows = leads.map((lead) =>
    [
      lead.createdAt.toISOString(),
      lead.status,
      lead.intent,
      lead.name,
      lead.businessName,
      lead.email,
      lead.phone,
      lead.preferredContact,
      lead.notes,
      lead.estimateJson
    ].map(escapeCsv)
  );

  const csv = [header.map(escapeCsv), ...rows].map((row) => row.join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="iron-point-leads.csv"`
    }
  });
}
