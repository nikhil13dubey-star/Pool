import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  if (!member?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const limit = Math.min(
    50,
    Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10)),
  );
  const includeDeleted = searchParams.get("deleted") === "true";

  const [expenses, total] = await prisma.$transaction([
    prisma.expense.findMany({
      where: { groupId, isDeleted: includeDeleted || false },
      include: {
        paidBy: {
          select: { id: true, displayName: true, avatarColor: true, isGhost: true },
        },
        createdBy: { select: { id: true, displayName: true } },
        shares: {
          include: {
            user: { select: { id: true, displayName: true, avatarColor: true } },
          },
        },
      },
      orderBy: { expenseDate: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.expense.count({ where: { groupId, isDeleted: includeDeleted || false } }),
  ]);

  return NextResponse.json({
    expenses,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
    },
  });
}
