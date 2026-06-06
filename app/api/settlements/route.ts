import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";
import { emitNotification } from "@/lib/server/notifications";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const b = await req.json().catch(() => null);
  const groupId = b?.groupId;
  const otherId = b?.otherId;
  const dir = b?.dir; // "pay" => me -> other ; "receive" => other -> me
  const amount = Number(b?.amount);
  if (!groupId || !otherId || !(amount > 0) || (dir !== "pay" && dir !== "receive"))
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const [member, other] = await Promise.all([
    prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: user.id } },
    }),
    prisma.groupMember.findUnique({
      where: { groupId_userId: { groupId, userId: otherId } },
    }),
  ]);
  if (!member?.isActive)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!other?.isActive)
    return NextResponse.json(
      { error: "Other party isn't in this group" },
      { status: 400 },
    );

  const fromUserId = dir === "pay" ? user.id : otherId;
  const toUserId = dir === "pay" ? otherId : user.id;

  const settlement = await prisma.settlement.create({
    data: {
      groupId,
      fromUserId,
      toUserId,
      amount,
      method: "OTHER",
      settledAt: new Date(),
    },
  });
  await emitNotification([otherId], "SETTLEMENT_RECORDED", {
    groupId,
    amount,
    actor: user.displayName,
  });
  return NextResponse.json(settlement, { status: 201 });
}
