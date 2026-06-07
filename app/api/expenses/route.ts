import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";
import { splitExpense } from "@/lib/server/splits";
import { emitNotification } from "@/lib/server/notifications";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json().catch(() => null);
  const groupId = b?.groupId;
  const description = (b?.description ?? "").trim();
  const amount = Number(b?.amount);
  const paidById = b?.paidById;
  const category = b?.category ?? "Other";
  const notes = (b?.notes ?? "").trim() || null;
  const expenseDate = b?.expenseDate ? new Date(b.expenseDate) : new Date();
  const splitMethod = ["EXACT", "SHARES", "PERCENT"].includes(b?.splitMethod)
    ? b.splitMethod
    : "EQUAL";
  const participants: string[] = Array.isArray(b?.participants) ? b.participants : [];
  const exactAmounts: Record<string, number> | undefined = b?.exactAmounts;
  const weights: Record<string, number> | undefined = b?.weights;

  if (!groupId || !description || !(amount > 0) || !paidById || participants.length === 0)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const members = await prisma.groupMember.findMany({
    where: { groupId, isActive: true },
    select: { userId: true },
  });
  const memberIds = new Set(members.map((m) => m.userId));
  if (!memberIds.has(user.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!memberIds.has(paidById) || !participants.every((p) => memberIds.has(p)))
    return NextResponse.json(
      { error: "Payer and participants must be group members" },
      { status: 400 },
    );

  let splits;
  try {
    splits = splitExpense(amount, splitMethod, participants, exactAmounts, weights);
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }

  const expense = await prisma.$transaction(async (tx) => {
    const created = await tx.expense.create({
      data: {
        groupId,
        paidById,
        amount,
        description,
        category,
        notes,
        expenseDate,
        splitMethod,
        createdById: user.id,
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
    await tx.group.update({ where: { id: groupId }, data: { updatedAt: new Date() } });
    return created;
  });

  const others = [...memberIds].filter((id) => id !== user.id);
  await emitNotification(others, "EXPENSE_ADDED", {
    expenseId: expense.id,
    groupId,
    description,
    amount,
    actor: user.displayName,
  });

  return NextResponse.json(expense, { status: 201 });
}
