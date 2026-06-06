import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { ExpenseDetailClient } from "@/components/expenses/expense-detail-client";

export default async function ExpenseDetailPage({
  params,
}: {
  params: Promise<{ id: string; expenseId: string }>;
}) {
  const { id, expenseId } = await params;
  const user = (await getCurrentUser())!;
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, groupId: id, isDeleted: false },
    include: {
      paidBy: true,
      shares: { include: { user: true }, orderBy: { amountOwed: "desc" } },
    },
  });
  if (!expense) notFound();
  const m = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (!m?.isActive) notFound();

  const data = {
    id: expense.id,
    groupId: expense.groupId,
    description: expense.description,
    amount: Number(expense.amount),
    category: expense.category,
    paidBy: {
      id: expense.paidBy.id,
      displayName: expense.paidBy.displayName,
      avatarColor: expense.paidBy.avatarColor,
    },
    shares: expense.shares.map((s) => ({
      userId: s.userId,
      amountOwed: Number(s.amountOwed),
      user: { displayName: s.user.displayName, avatarColor: s.user.avatarColor },
    })),
  };
  return <ExpenseDetailClient expense={data} currentUserId={user.id} />;
}
