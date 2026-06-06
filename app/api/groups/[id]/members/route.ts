import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";
import { hueFromName } from "@/lib/shared/avatar";

async function activeMember(groupId: string, userId: string) {
  const m = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId } },
  });
  return m?.isActive ? m : null;
}

// Add a ghost member by name
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await activeMember(groupId, user.id)))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  if (!name || name.length > 40)
    return NextResponse.json({ error: "Enter a name" }, { status: 400 });

  const member = await prisma.$transaction(async (tx) => {
    const ghost = await tx.user.create({
      data: { displayName: name, avatarColor: String(hueFromName(name)), isGhost: true },
    });
    return tx.groupMember.create({
      data: { groupId, userId: ghost.id, role: "MEMBER" },
      include: { user: true },
    });
  });

  return NextResponse.json(member, { status: 201 });
}

// Remove a member (creator removes a ghost) or leave the group (self)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const targetId = req.nextUrl.searchParams.get("userId") ?? user.id;
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isSelf = targetId === user.id;
  if (!isSelf && group.createdById !== user.id)
    return NextResponse.json(
      { error: "Only the creator can remove members" },
      { status: 403 },
    );

  await prisma.groupMember.updateMany({
    where: { groupId, userId: targetId },
    data: { isActive: false },
  });
  return NextResponse.json({ ok: true });
}
