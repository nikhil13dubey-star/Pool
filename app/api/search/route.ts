import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  const memberships = await prisma.groupMember.findMany({
    where: { userId, isActive: true },
    select: { groupId: true, group: { select: { name: true } } },
  });

  const groupIds = memberships.map((m) => m.groupId);
  const groupNameMap = Object.fromEntries(
    memberships.map((m) => [m.groupId, m.group.name]),
  );

  if (!q) return NextResponse.json([]);

  const expenses = await prisma.expense.findMany({
    where: {
      groupId: { in: groupIds },
      isDeleted: false,
      description: { contains: q, mode: "insensitive" },
    },
    include: { paidBy: true },
    orderBy: { expenseDate: "desc" },
    take: 30,
  });

  const results = expenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    currency: e.currency,
    category: e.category,
    groupId: e.groupId,
    groupName: groupNameMap[e.groupId] ?? "",
    paidByName: e.paidBy.displayName,
    expenseDate: e.expenseDate.toISOString(),
  }));

  return NextResponse.json(results);
}
