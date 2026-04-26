import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { computeAllGroupBalances } from "@/lib/server/balances";
import { HomeHeader } from "@/components/home/home-header";
import { BalanceHero } from "@/components/home/balance-hero";
import { GroupList } from "@/components/home/group-list";
import { Fab } from "@/components/shared/fab";

export default async function HomePage() {
  const user = await getCurrentUser();

  const [memberships, unreadCount] = await Promise.all([
    prisma.groupMember.findMany({
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
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  const groupIds = memberships.map(({ group }) => group.id);
  // One batched call = 2 DB queries total regardless of how many groups
  const balanceMap = await computeAllGroupBalances(groupIds, user.id);

  const groupsWithBalances = memberships.map(({ group }) => ({
    group,
    netBalance: balanceMap[group.id] ?? 0,
  }));

  const totalOwed = groupsWithBalances
    .filter((g) => g.netBalance > 0)
    .reduce((sum, g) => sum + g.netBalance, 0);

  const totalOwe = groupsWithBalances
    .filter((g) => g.netBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.netBalance), 0);

  const greeting = getGreeting();

  return (
    <>
      <HomeHeader
        userName={user.displayName}
        greeting={greeting}
        unreadCount={unreadCount}
      />
      <BalanceHero netOwed={totalOwed} netOwe={totalOwe} />
      <GroupList groups={groupsWithBalances} currentUserId={user.id} />
      <Fab />
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Hey";
}
