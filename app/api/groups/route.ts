import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";
import { CreateGroupSchema } from "@/lib/shared/zod-schemas";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const memberships = await prisma.groupMember.findMany({
    where: { userId, isActive: true, group: { isDeleted: false } },
    include: {
      group: {
        include: {
          members: { where: { isActive: true }, include: { user: true } },
        },
      },
    },
    orderBy: { group: { updatedAt: "desc" } },
  });

  return NextResponse.json(memberships.map((m) => m.group));
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const body = await req.json();
  const parsed = CreateGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, type, defaultCurrency } = parsed.data;

  const group = await prisma.$transaction(async (tx) => {
    const created = await tx.group.create({
      data: { name, type, defaultCurrency, createdById: userId },
    });

    await tx.groupMember.create({
      data: { groupId: created.id, userId, role: "MEMBER" },
    });

    return created;
  });

  return NextResponse.json(group, { status: 201 });
}
