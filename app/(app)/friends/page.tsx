import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { computeBalances } from "@/lib/server/balances";
import { FriendsClient } from "@/components/friends/friends-client";

export default async function FriendsPage() {
  const user = await getCurrentUser();

  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, isActive: true, group: { isDeleted: false } },
    select: { groupId: true },
  });

  const allBalances = await Promise.all(
    memberships.map((m: { groupId: string }) => computeBalances(m.groupId)),
  );

  // Aggregate per-friend across all groups
  const perFriend: Record<string, { owed: number; owes: number }> = {};

  for (const groupBalances of allBalances) {
    const mine = groupBalances.find((b) => b.userId === user.id);
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

  const friendsWithBalance = friends.map((f) => ({
    ...f,
    ...perFriend[f.id],
  }));

  return <FriendsClient currentUser={user} friends={friendsWithBalance} />;
}
