import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getCatalogDataFromDb, seedCatalogDatabase, updateCatalogRecord } from "@/lib/catalog-db";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const catalog = await getCatalogDataFromDb();
  return NextResponse.json(catalog);
}

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  await seedCatalogDatabase();
  const catalog = await getCatalogDataFromDb();
  return NextResponse.json({ message: "Seed data synced.", catalog });
}

export async function PUT(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const body = await request.json();
  if (typeof body?.type !== "string" || typeof body?.id !== "string" || typeof body?.data !== "object") {
    return NextResponse.json({ message: "Invalid catalog update." }, { status: 400 });
  }

  const updated = await updateCatalogRecord(body.type, body.id, body.data);
  return NextResponse.json({ message: "Catalog record updated.", updated });
}
