import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { computeBalances } from "@/lib/server/balances";
import { GroupDetailClient } from "@/components/groups/group-detail-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function GroupPage({ params }: Props) {
  const { id } = await params;
  const user = await getCurrentUser();

  const group = await prisma.group.findUnique({
    where: { id, isDeleted: false },
    include: {
      members: {
        where: { isActive: true },
        include: { user: true },
        orderBy: { joinedAt: "asc" },
      },
      expenses: {
        where: { isDeleted: false },
        include: { paidBy: true, shares: { include: { user: true } } },
        orderBy: { expenseDate: "desc" },
        take: 30,
      },
    },
  });

  if (!group) notFound();

  const isMember = group.members.some((m) => m.userId === user.id);
  if (!isMember) notFound();

  const balances = await computeBalances(group.id);

  return <GroupDetailClient group={group} currentUser={user} balances={balances} />;
}
