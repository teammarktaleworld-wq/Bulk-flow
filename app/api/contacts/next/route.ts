import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const batchId = searchParams.get("batchId");

  try {
    const where = {
      status: "pending",
      ...(batchId ? { batchId } : {}),
    };

    const contact = await prisma.contact.findFirst({
      where,
      orderBy: { createdAt: "asc" },
    });

    if (!contact) {
      return NextResponse.json({ contact: null, done: true });
    }

    // Count remaining
    const remaining = await prisma.contact.count({ where });

    return NextResponse.json({ contact, remaining, done: false });
  } catch (err) {
    console.error("Next contact error:", err);
    return NextResponse.json({ error: "Failed to fetch contact" }, { status: 500 });
  }
}