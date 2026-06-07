import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";

async function allowed(expenseId: string, userId: string) {
  const e = await prisma.expense.findUnique({
    where: { id: expenseId },
    select: { groupId: true },
  });
  if (!e) return null;
  const m = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: e.groupId, userId } },
  });
  return m?.isActive ? e : null;
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await allowed(id, user.id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const comments = await prisma.comment.findMany({
    where: { expenseId: id, isDeleted: false },
    include: { user: { select: { displayName: true, avatarColor: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(
    comments.map((c) => ({
      id: c.id,
      body: c.body,
      userId: c.userId,
      name: c.user.displayName,
      hue: c.user.avatarColor,
      createdAt: c.createdAt,
    })),
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await allowed(id, user.id)))
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = (await req.json().catch(() => null))?.body?.trim();
  if (!body || body.length > 500)
    return NextResponse.json({ error: "Empty or too long" }, { status: 400 });
  const c = await prisma.comment.create({
    data: { expenseId: id, userId: user.id, body },
    include: { user: { select: { displayName: true, avatarColor: true } } },
  });
  return NextResponse.json(
    {
      id: c.id,
      body: c.body,
      userId: c.userId,
      name: c.user.displayName,
      hue: c.user.avatarColor,
      createdAt: c.createdAt,
    },
    { status: 201 },
  );
}
