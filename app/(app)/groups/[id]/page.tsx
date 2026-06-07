import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { computeBalancesFromData } from "@/lib/server/balances";
import { simplifyDebts } from "@/lib/server/simplify";
import { GroupDetailClient } from "@/components/groups/group-detail-client";

export default async function GroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getCurrentUser())!;

  const group = await prisma.group.findFirst({
    where: { id, isDeleted: false },
    include: { members: { where: { isActive: true }, include: { user: true } } },
  });
  if (!group) notFound();
  if (!group.members.some((m) => m.userId === user.id)) notFound();

  const [expenses, settlements] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId: id, isDeleted: false },
      include: { paidBy: true, shares: true },
      orderBy: [{ expenseDate: "desc" }, { createdAt: "desc" }],
    }),
    prisma.settlement.findMany({
      where: { groupId: id },
      select: { fromUserId: true, toUserId: true, amount: true },
    }),
  ]);
  const balances = computeBalancesFromData(expenses, settlements);

  const userMap = Object.fromEntries(group.members.map((m) => [m.userId, m.user]));
  const myBal = balances.find((b) => b.userId === user.id);
  const myNet = myBal?.net ?? 0;

  // who owes whom, from my perspective
  const lines: {
    userId: string;
    name: string;
    hue: string;
    amount: number;
    dir: "owed" | "owe";
  }[] = [];
  if (myBal) {
    for (const [uid, amt] of Object.entries(myBal.isOwed))
      lines.push({
        userId: uid,
        name: userMap[uid]?.displayName ?? "?",
        hue: userMap[uid]?.avatarColor ?? "0",
        amount: amt,
        dir: "owed",
      });
    for (const [uid, amt] of Object.entries(myBal.owes))
      lines.push({
        userId: uid,
        name: userMap[uid]?.displayName ?? "?",
        hue: userMap[uid]?.avatarColor ?? "0",
        amount: amt,
        dir: "owe",
      });
  }

  // Simplified "who owes whom" — minimum transfers involving me only.
  const rawNet: Record<string, number> = {};
  for (const b of balances) rawNet[b.userId] = b.net;
  const simplifiedLines: typeof lines = [];
  for (const t of simplifyDebts(rawNet)) {
    if (t.fromUserId === user.id) {
      simplifiedLines.push({
        userId: t.toUserId,
        name: userMap[t.toUserId]?.displayName ?? "?",
        hue: userMap[t.toUserId]?.avatarColor ?? "0",
        amount: t.amount,
        dir: "owe",
      });
    } else if (t.toUserId === user.id) {
      simplifiedLines.push({
        userId: t.fromUserId,
        name: userMap[t.fromUserId]?.displayName ?? "?",
        hue: userMap[t.fromUserId]?.avatarColor ?? "0",
        amount: t.amount,
        dir: "owed",
      });
    }
  }

  const expenseData = expenses.map((e) => {
    const mine = e.shares.find((s) => s.userId === user.id);
    const myShare = mine ? Number(mine.amountOwed) : 0;
    const iPaid = e.paidById === user.id;
    const lentToOthers = iPaid
      ? e.shares
          .filter((s) => s.userId !== user.id)
          .reduce((s, sh) => s + Number(sh.amountOwed), 0)
      : 0;
    return {
      id: e.id,
      description: e.description,
      amount: Number(e.amount),
      category: e.category,
      paidByName: e.paidBy.id === user.id ? "You" : e.paidBy.displayName,
      date: e.expenseDate.toISOString().slice(0, 10),
      impact: iPaid ? lentToOthers : -myShare, // + you lent, - you owe
    };
  });

  const data = {
    id: group.id,
    name: group.name,
    type: group.type,
    members: group.members.map((m) => ({
      id: m.id,
      userId: m.userId,
      user: {
        displayName: m.user.displayName,
        avatarColor: m.user.avatarColor,
        isGhost: m.user.isGhost,
      },
    })),
  };

  return (
    <GroupDetailClient
      group={data}
      myNet={myNet}
      lines={lines}
      simplifiedLines={simplifiedLines}
      expenses={expenseData}
    />
  );
}
