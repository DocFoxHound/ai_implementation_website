import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { leadStatusSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const status = leadStatusSchema.safeParse(body.status);

  if (!status.success) {
    return NextResponse.json({ message: "Invalid lead status." }, { status: 400 });
  }

  const lead = await prisma.lead.update({
    where: { id },
    data: { status: status.data }
  });

  return NextResponse.json({ lead });
}
