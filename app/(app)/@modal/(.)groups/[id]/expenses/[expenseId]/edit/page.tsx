import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { ExpenseForm } from "@/components/expenses/expense-form";

export default async function EditExpense({
  params,
}: {
  params: Promise<{ id: string; expenseId: string }>;
}) {
  const { id, expenseId } = await params;
  const user = (await getCurrentUser())!;
  const e = await prisma.expense.findFirst({
    where: { id: expenseId, groupId: id, isDeleted: false },
    include: { shares: true },
  });
  if (!e) notFound();
  const m = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (!m?.isActive) notFound();
  const isWeighted = e.splitMethod === "SHARES" || e.splitMethod === "PERCENT";
  const initial = {
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    paidById: e.paidById,
    category: e.category,
    participants: e.shares.map((s) => s.userId),
    splitMethod: e.splitMethod,
    exactAmounts:
      e.splitMethod === "EXACT"
        ? Object.fromEntries(e.shares.map((s) => [s.userId, Number(s.amountOwed)]))
        : undefined,
    weights: isWeighted
      ? Object.fromEntries(e.shares.map((s) => [s.userId, Number(s.shareValue)]))
      : undefined,
  };
  return <ExpenseForm groupId={id} initial={initial} />;
}
