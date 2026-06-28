import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { containsRestrictedContent, leadSubmissionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = leadSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Please check the contact fields and try again." }, { status: 400 });
  }

  const lead = parsed.data;

  if (containsRestrictedContent(lead.notes)) {
    return NextResponse.json(
      {
        message:
          "Please remove sensitive details from the notes. Do not submit passwords, credentials, classified, regulated, privileged, or confidential data through this website."
      },
      { status: 400 }
    );
  }

  const created = await prisma.lead.create({
    data: {
      name: lead.name,
      businessName: lead.businessName,
      email: lead.email,
      phone: lead.phone || null,
      preferredContact: lead.preferredContact,
      notes: lead.notes || null,
      intent: lead.intent,
      configurationJson: JSON.stringify(lead.configuration),
      recommendedModelJson: JSON.stringify(lead.estimate.topModel ?? null),
      hardwareTierJson: JSON.stringify(lead.estimate.hardwareTier ?? null),
      securityTierJson: JSON.stringify(lead.estimate.securityTier ?? null),
      addOnsJson: JSON.stringify(lead.estimate.toolAddons ?? []),
      estimateJson: JSON.stringify(lead.estimate)
    }
  });

  return NextResponse.json({ id: created.id, message: "Estimate request received." }, { status: 201 });
}
