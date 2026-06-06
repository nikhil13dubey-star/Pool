import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";

async function isMember(groupId: string, userId: string) {
  const m = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return m?.isActive ?? false;
}

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isMember(id, user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const group = await prisma.group.findFirst({
    where: { id, isDeleted: false },
    include: { members: { where: { isActive: true }, include: { user: true } } },
  });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(group);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await isMember(id, user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const data: { name?: string; simplifyDebts?: boolean } = {};
  if (typeof body?.name === "string" && body.name.trim())
    data.name = body.name.trim().slice(0, 40);
  if (typeof body?.simplifyDebts === "boolean") data.simplifyDebts = body.simplifyDebts;

  const group = await prisma.group.update({ where: { id }, data });
  return NextResponse.json(group);
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const group = await prisma.group.findUnique({ where: { id } });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (group.createdById !== user.id)
    return NextResponse.json({ error: "Only the creator can delete" }, { status: 403 });

  await prisma.group.update({ where: { id }, data: { isDeleted: true } });
  return NextResponse.json({ ok: true });
}
