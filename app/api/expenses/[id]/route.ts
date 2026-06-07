import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";
import { splitExpense } from "@/lib/server/splits";
import { emitNotification } from "@/lib/server/notifications";

async function loadAllowed(expenseId: string, userId: string) {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) return null;
  const m = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: expense.groupId, userId } },
  });
  return m?.isActive ? expense : null;
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await loadAllowed(id, user.id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  const full = await prisma.expense.findUnique({
    where: { id },
    include: { paidBy: true, createdBy: true, shares: { include: { user: true } } },
  });
  return NextResponse.json(full);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await loadAllowed(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const b = await req.json().catch(() => null);
  const description = (b?.description ?? "").trim();
  const amount = Number(b?.amount);
  const paidById = b?.paidById;
  const splitMethod = ["EXACT", "SHARES", "PERCENT"].includes(b?.splitMethod)
    ? b.splitMethod
    : "EQUAL";
  const participants: string[] = Array.isArray(b?.participants) ? b.participants : [];
  const exactAmounts = b?.exactAmounts;
  const weights = b?.weights;
  if (!description || !(amount > 0) || !paidById || participants.length === 0)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const members = await prisma.groupMember.findMany({
    where: { groupId: existing.groupId, isActive: true },
    select: { userId: true },
  });
  const memberIds = new Set(members.map((m) => m.userId));
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

  await prisma.$transaction(async (tx) => {
    await tx.expense.update({
      where: { id },
      data: {
        description,
        amount,
        paidById,
        splitMethod,
        category: b?.category ?? existing.category,
        notes: (b?.notes ?? "").trim() || null,
        expenseDate: b?.expenseDate ? new Date(b.expenseDate) : existing.expenseDate,
      },
    });
    await tx.expenseShare.deleteMany({ where: { expenseId: id } });
    await tx.expenseShare.createMany({
      data: splits.map((s) => ({
        expenseId: id,
        userId: s.userId,
        amountOwed: s.amountOwed,
        shareValue: s.shareValue,
      })),
    });
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const existing = await loadAllowed(id, user.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.expense.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });
  const others = await prisma.groupMember.findMany({
    where: { groupId: existing.groupId, isActive: true, userId: { not: user.id } },
  });
  await emitNotification(
    others.map((m) => m.userId),
    "EXPENSE_DELETED",
    {
      groupId: existing.groupId,
      description: existing.description,
      actor: user.displayName,
    },
  );
  return NextResponse.json({ ok: true });
}
