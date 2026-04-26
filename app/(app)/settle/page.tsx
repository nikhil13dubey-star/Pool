import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { computeBalancesFromData } from "@/lib/server/balances";
import { simplifyDebts } from "@/lib/server/simplify";
import { SettleClient } from "@/components/settle/settle-client";

export default async function SettlePage() {
  const user = await getCurrentUser();

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, isActive: true, group: { isDeleted: false } },
    select: { groupId: true, group: { select: { id: true, name: true } } },
  });

  const groupIds = memberships.map((m) => m.groupId);

  if (groupIds.length === 0) {
    return <SettleClient currentUser={user} settlements={[]} userMap={{}} />;
  }

  // 2 DB queries total regardless of group count
  const [expenses, settlements] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId: { in: groupIds }, isDeleted: false },
      include: { shares: true },
    }),
    prisma.settlement.findMany({ where: { groupId: { in: groupIds } } }),
  ]);

  const groupNameMap = Object.fromEntries(
    memberships.map((m) => [m.groupId, m.group.name]),
  );

  const settlementsNeeded: {
    groupId: string;
    groupName: string;
    transfers: { fromUserId: string; toUserId: string; amount: number }[];
  }[] = [];

  for (const groupId of groupIds) {
    const groupExpenses = expenses.filter((e) => e.groupId === groupId);
    const groupSettlements = settlements.filter((s) => s.groupId === groupId);
    const balances = computeBalancesFromData(groupExpenses, groupSettlements);

    const rawBalances: Record<string, number> = {};
    for (const b of balances) rawBalances[b.userId] = b.net;

    const transfers = simplifyDebts(rawBalances).filter(
      (t) => t.fromUserId === user.id || t.toUserId === user.id,
    );

    if (transfers.length > 0) {
      settlementsNeeded.push({
        groupId,
        groupName: groupNameMap[groupId] ?? groupId,
        transfers,
      });
    }
  }

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
