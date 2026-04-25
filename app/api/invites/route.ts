import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { groupId, ghostUserId } = await req.json();
  if (!groupId) return NextResponse.json({ error: "groupId required" }, { status: 400 });

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
  const invite = await prisma.invite.create({
    data: { groupId, ghostUserId, expiresAt },
  });

  return NextResponse.json(
    {
      token: invite.token,
      url: `${process.env.NEXTAUTH_URL}/invite/${invite.token}`,
      expiresAt: invite.expiresAt,
    },
    { status: 201 },
  );
}
