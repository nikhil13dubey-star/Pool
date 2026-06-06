import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";

// Create (or reuse) a shareable invite link for a group.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const groupId = body?.groupId;
  if (!groupId) return NextResponse.json({ error: "groupId required" }, { status: 400 });

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!member?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // reuse an existing, unexpired, unused group invite if present
  const existing = await prisma.invite.findFirst({
    where: { groupId, ghostUserId: null, usedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });
  const invite =
    existing ??
    (await prisma.invite.create({
      data: { groupId, expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
    }));

  const origin = req.nextUrl.origin;
  return NextResponse.json({
    token: invite.token,
    url: `${origin}/invite/${invite.token}`,
  });
}
