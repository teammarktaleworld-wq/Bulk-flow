import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status } = body; // "sent" | "skipped" | "failed"

  if (!["sent", "skipped", "failed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  try {
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        status,
        sentAt: status === "sent" ? new Date() : undefined,
      },
    });

    // Update batch sent count if sent
    if (status === "sent") {
      await prisma.batch.update({
        where: { id: contact.batchId },
        data: { sentCount: { increment: 1 } },
      });
    }

    return NextResponse.json({ success: true, contact });
  } catch (err) {
    console.error("Status update error:", err);
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}