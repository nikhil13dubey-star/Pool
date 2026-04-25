import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";

export async function POST(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const expense = await prisma.expense.findUnique({ where: { id } });
  if (!expense) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: expense.groupId, userId: session.user.id } },
  });
  if (!member?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const restored = await prisma.expense.update({
    where: { id },
    data: { isDeleted: false, deletedAt: null },
  });

  return NextResponse.json(restored);
}
