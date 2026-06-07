import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { computeBalancesFromData } from "@/lib/server/balances";
import { simplifyDebts } from "@/lib/server/simplify";
import { SettleClient } from "@/components/settle/settle-client";
import { ProfileButton } from "@/components/shared/profile-button";

export default async function SettlePage() {
  const user = (await getCurrentUser())!;
  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, isActive: true, group: { isDeleted: false } },
    include: {
      group: {
        include: { members: { where: { isActive: true }, include: { user: true } } },
      },
    },
  });
  const groupIds = memberships.map((m) => m.groupId);

  // Batched: all expenses + settlements + history in parallel (was 2×N sequential).
  const [allExpenses, allSettlements, history] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId: { in: groupIds }, isDeleted: false },
      select: {
        groupId: true,
        paidById: true,
        shares: { select: { userId: true, amountOwed: true } },
      },
    }),
    prisma.settlement.findMany({
      where: { groupId: { in: groupIds } },
      select: { groupId: true, fromUserId: true, toUserId: true, amount: true },
    }),
    prisma.settlement.findMany({
      where: {
        groupId: { in: groupIds },
        OR: [{ fromUserId: user.id }, { toUserId: user.id }],
      },
      include: { fromUser: true, toUser: true, group: true },
      orderBy: { settledAt: "desc" },
      take: 10,
    }),
  ]);

  const suggestions: {
    groupId: string;
    groupName: string;
    otherId: string;
    otherName: string;
    otherHue: string;
    amount: number;
    dir: "receive" | "pay";
  }[] = [];
  let net = 0;

  for (const m of memberships) {
    const g = m.group;
    const userMap = Object.fromEntries(g.members.map((x) => [x.userId, x.user]));
    const exp = allExpenses.filter((e) => e.groupId === g.id);
    const set = allSettlements.filter((s) => s.groupId === g.id);
    const balances = computeBalancesFromData(exp, set);
    const raw: Record<string, number> = {};
    for (const b of balances) raw[b.userId] = b.net;
    net += raw[user.id] ?? 0;
    const transfers = simplifyDebts(raw).filter(
      (t) => t.fromUserId === user.id || t.toUserId === user.id,
    );
    for (const t of transfers) {
      const receive = t.toUserId === user.id;
      const otherId = receive ? t.fromUserId : t.toUserId;
      suggestions.push({
        groupId: g.id,
        groupName: g.name,
        otherId,
        otherName: userMap[otherId]?.displayName ?? "?",
        otherHue: userMap[otherId]?.avatarColor ?? "0",
        amount: t.amount,
        dir: receive ? "receive" : "pay",
      });
    }
  }
  const historyData = history.map((s) => ({
    id: s.id,
    amount: Number(s.amount),
    groupName: s.group.name,
    text:
      s.toUserId === user.id
        ? `${s.fromUser.displayName} paid you`
        : `You paid ${s.toUser.displayName}`,
  }));

  return (
    <SettleClient
      net={net}
      suggestions={suggestions}
      history={historyData}
      profile={<ProfileButton />}
    />
  );
}
