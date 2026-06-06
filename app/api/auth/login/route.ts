import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { verifyPin } from "@/lib/server/pin";
import { signSession, SESSION_COOKIE, cookieOptions } from "@/lib/server/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const handle = (body?.handle ?? "").trim().toLowerCase().replace(/^@/, "");
  const pin = (body?.pin ?? "").trim();

  if (!handle || !/^\d{4}$/.test(pin))
    return NextResponse.json({ error: "Enter your handle and PIN" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { handle } });
  if (!user || user.isGhost || !user.pinHash || !verifyPin(pin, user.pinHash))
    return NextResponse.json({ error: "Wrong handle or PIN" }, { status: 401 });

  const res = NextResponse.json({
    id: user.id,
    displayName: user.displayName,
    handle: user.handle,
    avatarColor: user.avatarColor,
  });
  res.cookies.set(SESSION_COOKIE, signSession(user.id), cookieOptions);
  return res;
}
