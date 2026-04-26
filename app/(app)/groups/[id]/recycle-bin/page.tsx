import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { RecycleBinClient } from "@/components/expenses/recycle-bin-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function RecycleBinPage({ params }: Props) {
  const { id: groupId } = await params;

  const [user, deleted] = await Promise.all([
    getCurrentUser(),
    prisma.expense.findMany({
      where: { groupId, isDeleted: true },
      include: {
        paidBy: { select: { id: true, displayName: true } },
        shares: { include: { user: { select: { id: true, displayName: true } } } },
      },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  // Verify membership after parallel fetch
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId, userId: user.id } },
  });
  if (!member?.isActive) notFound();

  return <RecycleBinClient groupId={groupId} expenses={deleted} currentUser={user} />;
}
