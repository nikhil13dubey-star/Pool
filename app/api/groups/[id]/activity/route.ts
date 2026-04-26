import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get recent expenses as activity
  const expenses = await prisma.expense.findMany({
    where: { groupId, isDeleted: false },
    include: { createdBy: true, paidBy: true },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const settlements = await prisma.settlement.findMany({
    where: { groupId },
    include: { fromUser: true, toUser: true },
    orderBy: { settledAt: "desc" },
    take: 10,
  });

  type Item = {
    type: string;
    actor: string;
    text: string;
    time: string;
    amount?: number;
  };
  const items: Item[] = [];

  for (const e of expenses) {
    items.push({
      type: "expense_added",
      actor: e.createdBy.displayName,
      text: `added **${e.description}** for **₹${Number(e.amount).toLocaleString("en-IN")}**`,
      time: e.createdAt.toISOString(),
      amount: Number(e.amount),
    });
  }

  for (const s of settlements) {
    items.push({
      type: "settled",
      actor: s.fromUser.displayName,
      text: `settled **₹${Number(s.amount).toLocaleString("en-IN")}** with **${s.toUser.displayName}**`,
      time: s.settledAt.toISOString(),
      amount: Number(s.amount),
    });
  }

  items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  return NextResponse.json(items.slice(0, 20));
}
