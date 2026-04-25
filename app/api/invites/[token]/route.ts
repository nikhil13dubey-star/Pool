import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "Already used" }, { status: 409 });
  if (invite.expiresAt < new Date())
    return NextResponse.json({ error: "Expired" }, { status: 410 });

  await prisma.$transaction(async (tx) => {
    await tx.invite.update({ where: { token }, data: { usedAt: new Date() } });

    if (invite.ghostUserId) {
      await tx.user.update({
        where: { id: invite.ghostUserId },
        data: { claimedById: userId },
      });

      const existing = await tx.groupMember.findUnique({
        where: { groupId_userId: { groupId: invite.groupId, userId } },
      });

      if (!existing) {
        await tx.groupMember.create({
          data: { groupId: invite.groupId, userId, role: "MEMBER" },
        });
      }
      await tx.groupMember.update({
        where: {
          groupId_userId: { groupId: invite.groupId, userId: invite.ghostUserId },
        },
        data: { isActive: false },
      });
    } else {
      const existing = await tx.groupMember.findUnique({
        where: { groupId_userId: { groupId: invite.groupId, userId } },
      });
      if (!existing) {
        await tx.groupMember.create({
          data: { groupId: invite.groupId, userId, role: "MEMBER" },
        });
      }
    }
  });

  return NextResponse.json({ groupId: invite.groupId });
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      group: { select: { id: true, name: true, type: true } },
      ghostUser: { select: { displayName: true } },
    },
  });

  if (!invite) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (invite.usedAt) return NextResponse.json({ error: "Already used" }, { status: 409 });
  if (invite.expiresAt < new Date())
    return NextResponse.json({ error: "Expired" }, { status: 410 });

  return NextResponse.json({
    groupId: invite.groupId,
    groupName: invite.group.name,
    groupType: invite.group.type,
    ghostName: invite.ghostUser?.displayName,
    expiresAt: invite.expiresAt,
  });
}
