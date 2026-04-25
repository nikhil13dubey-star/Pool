import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/server/db";
import { computeBalances } from "@/lib/server/balances";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = session.user.id;

  const memberships = await prisma.groupMember.findMany({
    where: { userId, isActive: true, group: { isDeleted: false } },
    select: { groupId: true },
  });

  const allBalances = await Promise.all(
    memberships.map(({ groupId }: { groupId: string }) => computeBalances(groupId)),
  );

  const perFriend: Record<string, { owed: number; owes: number }> = {};

  for (const groupBalances of allBalances) {
    const mine = groupBalances.find((b) => b.userId === userId);
    if (!mine) continue;

    for (const [uid, amt] of Object.entries(mine.isOwed)) {
      if (!perFriend[uid]) perFriend[uid] = { owed: 0, owes: 0 };
      perFriend[uid].owed += amt;
    }
    for (const [uid, amt] of Object.entries(mine.owes)) {
      if (!perFriend[uid]) perFriend[uid] = { owed: 0, owes: 0 };
      perFriend[uid].owes += amt;
    }
  }

  return NextResponse.json(perFriend);
}
