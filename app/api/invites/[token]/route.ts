import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";

// Preview: group + claimable (ghost) members.
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      group: {
        include: { members: { where: { isActive: true }, include: { user: true } } },
      },
    },
  });
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.expiresAt < new Date())
    return NextResponse.json({ error: "Expired" }, { status: 410 });

  return NextResponse.json({
    groupId: invite.groupId,
    groupName: invite.group.name,
    groupType: invite.group.type,
    members: invite.group.members.map((m) => ({
      userId: m.userId,
      name: m.user.displayName,
      hue: m.user.avatarColor,
      isGhost: m.user.isGhost,
    })),
  });
}

// Join: as a new member, or claim a ghost (inheriting all its history).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const claimGhostId: string | undefined = body?.claimGhostId;

  const invite = await prisma.invite.findUnique({ where: { token } });
  if (!invite) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
  if (invite.expiresAt < new Date())
    return NextResponse.json({ error: "Expired" }, { status: 410 });
  const groupId = invite.groupId;

  await prisma.$transaction(async (tx) => {
    if (claimGhostId) {
      const ghost = await tx.user.findUnique({ where: { id: claimGhostId } });
      if (!ghost || !ghost.isGhost) throw new Error("Not claimable");
      if (ghost.claimedById) throw new Error("Already claimed");
      // ghost must actually belong to THIS invite's group
      const ghostMember = await tx.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: claimGhostId } },
      });
      if (!ghostMember?.isActive) throw new Error("Ghost not in this group");

      // Re-point the ghost's history to the real user — scoped to this group only.
      await tx.expense.updateMany({
        where: { groupId, paidById: claimGhostId },
        data: { paidById: user.id },
      });
      await tx.expense.updateMany({
        where: { groupId, createdById: claimGhostId },
        data: { createdById: user.id },
      });
      await tx.settlement.updateMany({
        where: { groupId, fromUserId: claimGhostId },
        data: { fromUserId: user.id },
      });
      await tx.settlement.updateMany({
        where: { groupId, toUserId: claimGhostId },
        data: { toUserId: user.id },
      });

      // ExpenseShares: move to user, but avoid the unique [expenseId,userId] clash
      // (if the user already has a share in the same expense, drop the ghost's).
      const ghostShares = await tx.expenseShare.findMany({
        where: { userId: claimGhostId, expense: { groupId } },
      });
      for (const s of ghostShares) {
        const clash = await tx.expenseShare.findUnique({
          where: { expenseId_userId: { expenseId: s.expenseId, userId: user.id } },
        });
        if (clash) await tx.expenseShare.delete({ where: { id: s.id } });
        else
          await tx.expenseShare.update({
            where: { id: s.id },
            data: { userId: user.id },
          });
      }

      // Membership: deactivate ghost's, ensure the real user is an active member.
      await tx.groupMember.updateMany({
        where: { groupId, userId: claimGhostId },
        data: { isActive: false },
      });
      const existing = await tx.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: user.id } },
      });
      if (existing)
        await tx.groupMember.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      else
        await tx.groupMember.create({
          data: { groupId, userId: user.id, role: "MEMBER" },
        });

      await tx.user.update({
        where: { id: claimGhostId },
        data: { claimedById: user.id },
      });
    } else {
      const existing = await tx.groupMember.findUnique({
        where: { groupId_userId: { groupId, userId: user.id } },
      });
      if (existing)
        await tx.groupMember.update({
          where: { id: existing.id },
          data: { isActive: true },
        });
      else
        await tx.groupMember.create({
          data: { groupId, userId: user.id, role: "MEMBER" },
        });
    }
  });

  return NextResponse.json({ groupId });
}
