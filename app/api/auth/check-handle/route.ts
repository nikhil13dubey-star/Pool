import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

export async function GET(req: NextRequest) {
  const handle = (req.nextUrl.searchParams.get("handle") ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");
  if (handle.length < 2) return NextResponse.json({ available: false });
  const exists = await prisma.user.findUnique({
    where: { handle },
    select: { id: true },
  });
  return NextResponse.json({ available: !exists });
}
