import { NextResponse } from "next/server";
import { getCatalogDataWithFallback } from "@/lib/catalog-db";

export const dynamic = "force-dynamic";

export async function GET() {
  const catalog = await getCatalogDataWithFallback();
  return NextResponse.json(catalog);
}
