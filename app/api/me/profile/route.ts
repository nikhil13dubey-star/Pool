import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const b = await req.json().catch(() => null);
  const data: { displayName?: string; upiId?: string | null } = {};
  if (typeof b?.displayName === "string" && b.displayName.trim())
    data.displayName = b.displayName.trim().slice(0, 40);
  if (typeof b?.upiId === "string") data.upiId = b.upiId.trim() || null;
  const updated = await prisma.user.update({ where: { id: user.id }, data });
  return NextResponse.json({
    id: updated.id,
    displayName: updated.displayName,
    upiId: updated.upiId,
  });
}
