import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";
import { hashPin, verifyPin } from "@/lib/server/pin";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const currentPin = (b?.currentPin ?? "").trim();
  const newPin = (b?.newPin ?? "").trim();
  if (!/^\d{4}$/.test(newPin))
    return NextResponse.json({ error: "New PIN must be 4 digits" }, { status: 400 });
  if (!user.pinHash || !verifyPin(currentPin, user.pinHash))
    return NextResponse.json({ error: "Current PIN is wrong" }, { status: 403 });
  await prisma.user.update({
    where: { id: user.id },
    data: { pinHash: hashPin(newPin) },
  });
  return NextResponse.json({ ok: true });
}
