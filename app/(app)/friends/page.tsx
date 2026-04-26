import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { computeBalancesFromData } from "@/lib/server/balances";
import { FriendsClient } from "@/components/friends/friends-client";

export default async function FriendsPage() {
  const user = await getCurrentUser();

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, isActive: true, group: { isDeleted: false } },
    select: { groupId: true },
  });

  const groupIds = memberships.map((m) => m.groupId);

  if (groupIds.length === 0) {
    return <FriendsClient currentUser={user} friends={[]} />;
  }

  // 2 DB queries total regardless of group count
  const [expenses, settlements] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId: { in: groupIds }, isDeleted: false },
      include: { shares: true },
    }),
    prisma.settlement.findMany({ where: { groupId: { in: groupIds } } }),
  ]);

  const allBalances = computeBalancesFromData(expenses, settlements);
  const mine = allBalances.find((b) => b.userId === user.id);

  const perFriend: Record<string, { owed: number; owes: number }> = {};
  if (mine) {
    for (const [uid, amt] of Object.entries(mine.isOwed)) {
      if (!perFriend[uid]) perFriend[uid] = { owed: 0, owes: 0 };
      perFriend[uid].owed += amt;
    }
    for (const [uid, amt] of Object.entries(mine.owes)) {
      if (!perFriend[uid]) perFriend[uid] = { owed: 0, owes: 0 };
      perFriend[uid].owes += amt;
    }
  }

  const friendIds = Object.keys(perFriend);
  const friends = friendIds.length
    ? await prisma.user.findMany({
        where: { id: { in: friendIds } },
        select: {
          id: true,
          displayName: true,
          avatarColor: true,
          isGhost: true,
          upiId: true,
        },
      })
    : [];

  const friendsWithBalance = friends.map((f) => ({ ...f, ...perFriend[f.id] }));

  return <FriendsClient currentUser={user} friends={friendsWithBalance} />;
}
