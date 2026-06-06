import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";

const TYPES = ["TRIP", "HOME", "COUPLE", "OTHER"] as const;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, isActive: true, group: { isDeleted: false } },
    include: {
      group: {
        include: {
          members: { where: { isActive: true }, include: { user: true } },
          _count: { select: { expenses: { where: { isDeleted: false } } } },
        },
      },
    },
    orderBy: { group: { updatedAt: "desc" } },
  });

  return NextResponse.json(memberships.map((m) => m.group));
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name ?? "").trim();
  const type = body?.type;
  if (!name || name.length > 40)
    return NextResponse.json({ error: "Enter a group name" }, { status: 400 });
  if (!TYPES.includes(type))
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });

  const group = await prisma.$transaction(async (tx) => {
    const g = await tx.group.create({ data: { name, type, createdById: user.id } });
    await tx.groupMember.create({
      data: { groupId: g.id, userId: user.id, role: "MEMBER" },
    });
    return g;
  });

  return NextResponse.json(group, { status: 201 });
}
