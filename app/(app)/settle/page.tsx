import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { computeBalances } from "@/lib/server/balances";
import { simplifyDebts } from "@/lib/server/simplify";
import { SettleClient } from "@/components/settle/settle-client";

export default async function SettlePage() {
  const user = await getCurrentUser();

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, isActive: true, group: { isDeleted: false } },
    select: { groupId: true },
  });

  // Gather per-group net balances and simplify each
  const settlementsNeeded: {
    groupId: string;
    groupName: string;
    transfers: { fromUserId: string; toUserId: string; amount: number }[];
  }[] = [];

  await Promise.all(
    memberships.map(async ({ groupId }) => {
      const balances = await computeBalances(groupId);
      const rawBalances: Record<string, number> = {};
      for (const b of balances) rawBalances[b.userId] = b.net;

      const transfers = simplifyDebts(rawBalances).filter(
        (t) => t.fromUserId === user.id || t.toUserId === user.id,
      );

      if (transfers.length > 0) {
        const group = await prisma.group.findUnique({
          where: { id: groupId },
          select: { name: true },
        });
        settlementsNeeded.push({
          groupId,
          groupName: group?.name ?? groupId,
          transfers,
        });
      }
    }),
  );

  // Collect all user IDs involved
  const userIds = new Set<string>();
  for (const s of settlementsNeeded) {
    for (const t of s.transfers) {
      userIds.add(t.fromUserId);
      userIds.add(t.toUserId);
    }
  }

  const users = userIds.size
    ? await prisma.user.findMany({
        where: { id: { in: [...userIds] } },
        select: { id: true, displayName: true, avatarColor: true, upiId: true },
      })
    : [];

  const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

  return (
    <SettleClient currentUser={user} settlements={settlementsNeeded} userMap={userMap} />
  );
}
