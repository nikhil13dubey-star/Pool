import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";
import { splitExpense } from "@/lib/server/splits";
import { emitNotification } from "@/lib/server/notifications";

async function requireGroupMember(expenseId: string, userId: string) {
  const expense = await prisma.expense.findUnique({ where: { id: expenseId } });
  if (!expense) return null;
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: expense.groupId, userId } },
  });
  return member?.isActive ? expense : null;
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expense = await requireGroupMember(id, session.user.id);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const full = await prisma.expense.findUnique({
    where: { id },
    include: {
      paidBy: true,
      createdBy: true,
      shares: { include: { user: true } },
      comments: {
        where: { isDeleted: false },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json(full);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expense = await requireGroupMember(id, session.user.id);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();

  const updated = await prisma.$transaction(async (tx) => {
    const updated = await tx.expense.update({
      where: { id },
      data: {
        ...(body.description !== undefined && { description: body.description }),
        ...(body.amount !== undefined && { amount: body.amount }),
        ...(body.paidById !== undefined && { paidById: body.paidById }),
        ...(body.category !== undefined && { category: body.category }),
        ...(body.notes !== undefined && { notes: body.notes }),
        ...(body.expenseDate !== undefined && {
          expenseDate: new Date(body.expenseDate),
        }),
        ...(body.splitMethod !== undefined && { splitMethod: body.splitMethod }),
      },
    });

    // Recompute shares if split data provided
    if (body.participants && body.splitMethod) {
      const splits = splitExpense(
        body.amount ?? Number(expense.amount),
        body.splitMethod,
        body.participants,
        body.exactAmounts,
      );
      await tx.expenseShare.deleteMany({ where: { expenseId: id } });
      await tx.expenseShare.createMany({
        data: splits.map((s) => ({
          expenseId: id,
          userId: s.userId,
          amountOwed: s.amountOwed,
          shareValue: s.shareValue,
        })),
      });
    }

    return updated;
  });

  // Notify
  const members = await prisma.groupMember.findMany({
    where: { groupId: expense.groupId, isActive: true, userId: { not: session.user.id } },
  });
  await emitNotification(
    members.map((m) => m.userId),
    "EXPENSE_EDITED",
    { expenseId: id, groupId: expense.groupId },
  );

  return NextResponse.json(updated);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expense = await requireGroupMember(id, session.user.id);
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.expense.update({
    where: { id },
    data: { isDeleted: true, deletedAt: new Date() },
  });

  const members = await prisma.groupMember.findMany({
    where: { groupId: expense.groupId, isActive: true, userId: { not: session.user.id } },
  });
  await emitNotification(
    members.map((m) => m.userId),
    "EXPENSE_DELETED",
    { expenseId: id, groupId: expense.groupId },
  );

  return NextResponse.json({ ok: true });
}
