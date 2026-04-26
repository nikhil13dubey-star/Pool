import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { ExpenseDetailClient } from "@/components/expenses/expense-detail-client";

interface Props {
  params: Promise<{ id: string; expenseId: string }>;
}

export default async function ExpenseDetailPage({ params }: Props) {
  const { id: groupId, expenseId } = await params;

  const [user, expense, group] = await Promise.all([
    getCurrentUser(),
    prisma.expense.findUnique({
      where: { id: expenseId },
      include: {
        paidBy: true,
        createdBy: true,
        shares: { include: { user: true }, orderBy: { amountOwed: "desc" } },
        comments: {
          where: { isDeleted: false },
          include: { user: true },
          orderBy: { createdAt: "asc" },
        },
      },
    }),
    prisma.group.findUnique({
      where: { id: groupId },
      include: { members: { where: { isActive: true }, include: { user: true } } },
    }),
  ]);

  if (!expense || expense.groupId !== groupId) notFound();
  if (!group) notFound();

  const isMember = group.members.some((m) => m.userId === user.id && m.isActive);
  if (!isMember) notFound();

  return <ExpenseDetailClient expense={expense} group={group} currentUser={user} />;
}
