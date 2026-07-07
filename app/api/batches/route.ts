import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const batches = await prisma.batch.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ batches });
  } catch (err) {
    console.error("Batches fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch batches" }, { status: 500 });
  }
}