import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { computeBalances } from "@/lib/server/balances";
import { HomeHeader } from "@/components/home/home-header";
import { BalanceHero } from "@/components/home/balance-hero";
import { GroupList } from "@/components/home/group-list";
import { Fab } from "@/components/shared/fab";

export default async function HomePage() {
  const user = await getCurrentUser();

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

  // Compute per-group balances in parallel
  const groupsWithBalances = await Promise.all(
    memberships.map(async ({ group }: { group: (typeof memberships)[0]["group"] }) => {
      const balances = await computeBalances(group.id);
      const myBalance = balances.find((b) => b.userId === user.id);
      return { group, netBalance: myBalance?.net ?? 0 };
    }),
  );

  const totalOwed = groupsWithBalances
    .filter((g) => g.netBalance > 0)
    .reduce((sum, g) => sum + g.netBalance, 0);

  const totalOwe = groupsWithBalances
    .filter((g) => g.netBalance < 0)
    .reduce((sum, g) => sum + Math.abs(g.netBalance), 0);

  const unreadCount = await prisma.notification.count({
    where: { userId: user.id, isRead: false },
  });

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
