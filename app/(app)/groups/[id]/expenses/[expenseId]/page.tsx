import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { ExpenseDetailClient } from "@/components/expenses/expense-detail-client";

interface Props {
  params: Promise<{ id: string; expenseId: string }>;
}

export default async function ExpenseDetailPage({ params }: Props) {
  const { id: groupId, expenseId } = await params;
  const user = await getCurrentUser();

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!member?.isActive) notFound();

  const expense = await prisma.expense.findUnique({
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
  });

  if (!expense || expense.groupId !== groupId) notFound();

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      members: {
        where: { isActive: true },
        include: { user: true },
      },
    },
  });
  if (!group) notFound();

  return <ExpenseDetailClient expense={expense} group={group} currentUser={user} />;
}
