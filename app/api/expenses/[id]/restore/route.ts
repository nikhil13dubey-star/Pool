import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const m = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: expense.groupId, userId: user.id } },
  });
  if (!m?.isActive) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.expense.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });
  return NextResponse.json({ ok: true });
}
