import { NextResponse } from "next/server";
import { buildEstimate } from "@/lib/estimator";
import { initialEstimatorConfig } from "@/lib/seed-data";
import { prisma } from "@/lib/prisma";
import { contactSubmissionSchema, containsRestrictedContent } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = contactSubmissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Please check the contact fields and try again." }, { status: 400 });
  }

  const contact = parsed.data;
  if (containsRestrictedContent(contact.notes)) {
    return NextResponse.json(
      {
        message:
          "Please remove sensitive details from the notes. Do not submit passwords, credentials, classified, regulated, privileged, or confidential data through this website."
      },
      { status: 400 }
    );
  }

  const estimate = buildEstimate(initialEstimatorConfig);
  const created = await prisma.lead.create({
    data: {
      name: contact.name,
      businessName: contact.businessName,
      email: contact.email,
      phone: contact.phone || null,
      preferredContact: contact.preferredContact,
      notes: contact.notes || null,
      intent: "contact",
      configurationJson: JSON.stringify(initialEstimatorConfig),
      recommendedModelJson: JSON.stringify(estimate.topModel),
      hardwareTierJson: JSON.stringify(estimate.hardwareTier),
      securityTierJson: JSON.stringify(estimate.securityTier),
      addOnsJson: JSON.stringify([]),
      estimateJson: JSON.stringify({ note: "Contact-only lead. Estimator was not completed.", preliminaryNotice: estimate.preliminaryNotice })
    }
  });

  return NextResponse.json({ id: created.id, message: "Contact request received." }, { status: 201 });
}
