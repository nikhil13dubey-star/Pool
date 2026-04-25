import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";
import { CreateSettlementSchema } from "@/lib/shared/zod-schemas";
import { emitNotification } from "@/lib/server/notifications";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = CreateSettlementSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { groupId, fromUserId, toUserId, amount, currency, method, note, settledAt } =
    parsed.data;

  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: session.user.id } },
  });
  if (!member?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const settlement = await prisma.settlement.create({
    data: {
      groupId,
      fromUserId,
      toUserId,
      amount,
      currency,
      method,
      note,
      settledAt: settledAt ? new Date(settledAt) : new Date(),
    },
  });

  await emitNotification([toUserId], "SETTLEMENT_RECORDED", {
    settlementId: settlement.id,
    groupId,
    fromUserId,
    amount,
    method,
  });

  return NextResponse.json(settlement, { status: 201 });
}
