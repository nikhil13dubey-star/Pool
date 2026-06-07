import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";

async function activeMember(groupId: string, userId: string) {
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
  if (!(await activeMember(id, user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const items = await prisma.listItem.findMany({
    where: { groupId: id },
    include: { addedBy: { select: { displayName: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(
    items.map((i) => ({
      id: i.id,
      text: i.text,
      addedByName: i.addedById === user.id ? "You" : i.addedBy.displayName,
      addedById: i.addedById,
      createdAt: i.createdAt,
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
  if (!(await activeMember(id, user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const text = (await req.json().catch(() => null))?.text?.trim();
  if (!text || text.length > 200)
    return NextResponse.json({ error: "Empty or too long" }, { status: 400 });

  const item = await prisma.listItem.create({
    data: { groupId: id, addedById: user.id, text },
    include: { addedBy: { select: { displayName: true } } },
  });
  return NextResponse.json(
    {
      id: item.id,
      text: item.text,
      addedByName: item.addedById === user.id ? "You" : item.addedBy.displayName,
      addedById: item.addedById,
      createdAt: item.createdAt,
    },
    { status: 201 },
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await activeMember(id, user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const itemId = (await req.json().catch(() => null))?.itemId;
  if (!itemId) return NextResponse.json({ error: "Missing itemId" }, { status: 400 });

  const item = await prisma.listItem.findUnique({
    where: { id: itemId },
    select: { groupId: true },
  });
  if (!item || item.groupId !== id)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.listItem.delete({ where: { id: itemId } });
  return NextResponse.json({ ok: true });
}
