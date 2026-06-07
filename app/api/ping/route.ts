import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";

// Keep-alive: ping this every few minutes (external uptime monitor) so Neon's
// free tier doesn't auto-suspend and cold-start on the next real request.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
