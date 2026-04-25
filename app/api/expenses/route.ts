import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";
import { CreateExpenseSchema } from "@/lib/shared/zod-schemas";
import { splitExpense } from "@/lib/server/splits";
import { emitNotification } from "@/lib/server/notifications";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const parsed = CreateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const {
    groupId,
    description,
    amount,
    currency,
    paidById,
    category,
    notes,
    expenseDate,
    splitMethod,
    participants,
    exactAmounts,
  } = parsed.data;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!member?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const splits = splitExpense(amount, splitMethod, participants, exactAmounts);

  const expense = await prisma.$transaction(async (tx) => {
    const created = await tx.expense.create({
      data: {
        groupId,
        paidById,
        amount,
        currency,
        description,
        category,
        notes,
        expenseDate: new Date(expenseDate),
        splitMethod,
        createdById: userId,
      },
    });

    await tx.expenseShare.createMany({
      data: splits.map((s) => ({
        expenseId: created.id,
        userId: s.userId,
        amountOwed: s.amountOwed,
        shareValue: s.shareValue,
      })),
    });

    return created;
  });

  const otherMembers = await prisma.groupMember.findMany({
    where: { groupId, isActive: true, userId: { not: userId } },
  });
  await emitNotification(
    otherMembers.map((m) => m.userId),
    "EXPENSE_ADDED",
    { expenseId: expense.id, groupId, description, amount },
  );

  return NextResponse.json(expense, { status: 201 });
}
