import { getCurrentUser } from "@/lib/server/auth-helpers";
import { prisma } from "@/lib/server/db";
import { notFound } from "next/navigation";
import { AddExpenseClient } from "@/components/expenses/add-expense-client";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function NewExpensePage({ params }: Props) {
  const { id: groupId } = await params;

  const [user, group] = await Promise.all([
    getCurrentUser(),
    prisma.group.findUnique({
      where: { id: groupId, isDeleted: false },
      include: {
        members: {
          where: { isActive: true },
          include: { user: true },
          orderBy: { joinedAt: "asc" },
        },
      },
    }),
  ]);

  if (!group) notFound();
  const isMember = group.members.some((m) => m.userId === user.id);
  if (!isMember) notFound();

  return <AddExpenseClient group={group} currentUser={user} members={group.members} />;
}
