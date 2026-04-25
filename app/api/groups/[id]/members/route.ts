import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";
import { getAvatarHex } from "@/lib/shared/types";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: groupId } = await params;
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isMember = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!isMember?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { name } = await req.json();
  if (!name?.trim())
    return NextResponse.json({ error: "Name required" }, { status: 400 });

  const result = await prisma.$transaction(async (tx) => {
    const ghost = await tx.user.create({
      data: {
        displayName: name.trim(),
        avatarColor: getAvatarHex(name.trim()),
        isGhost: true,
      },
    });

    const member = await tx.groupMember.create({
      data: { groupId, userId: ghost.id, role: "MEMBER" },
      include: { user: true },
    });

    return member;
  });

  return NextResponse.json(result, { status: 201 });
}
