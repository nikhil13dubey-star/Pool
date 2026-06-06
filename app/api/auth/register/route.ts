import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { hashPin } from "@/lib/server/pin";
import { signSession, SESSION_COOKIE, cookieOptions } from "@/lib/server/session";
import { hueFromName } from "@/lib/shared/avatar";

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 16);
  return base || "user";
}

async function uniqueHandle(name: string): Promise<string> {
  const base = slugify(name);
  for (let i = 0; i < 12; i++) {
    const candidate = `${base}${Math.floor(1000 + Math.random() * 9000)}`;
    const exists = await prisma.user.findUnique({ where: { handle: candidate } });
    if (!exists) return candidate;
  }
  return `${base}${Date.now().toString().slice(-6)}`;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const displayName = (body?.displayName ?? "").trim();
  const pin = (body?.pin ?? "").trim();
  let handle = (body?.handle ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9.]/g, "");

  if (displayName.length < 1 || displayName.length > 40)
    return NextResponse.json({ error: "Enter your name" }, { status: 400 });
  if (!/^\d{4}$/.test(pin))
    return NextResponse.json({ error: "PIN must be 4 digits" }, { status: 400 });

  // fall back to an auto-generated handle if none provided
  if (handle.length < 2) handle = await uniqueHandle(displayName);
  else if (await prisma.user.findUnique({ where: { handle } }))
    return NextResponse.json({ error: "That user ID is taken" }, { status: 409 });

  const user = await prisma.user.create({
    data: {
      handle,
      pinHash: hashPin(pin),
      displayName,
      avatarColor: String(hueFromName(displayName)),
    },
    select: { id: true, displayName: true, handle: true, avatarColor: true },
  });

  const res = NextResponse.json(user, { status: 201 });
  res.cookies.set(SESSION_COOKIE, signSession(user.id), cookieOptions);
  return res;
}
