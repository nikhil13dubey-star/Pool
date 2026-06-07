import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { RecycleBinClient } from "@/components/expenses/recycle-bin-client";

export default async function RecycleBinPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const member = await prisma.groupMember.findUnique({
    where: { groupId_userId: { groupId: id, userId: user.id } },
  });
  if (!member?.isActive) notFound();

  const deleted = await prisma.expense.findMany({
    where: { groupId: id, isDeleted: true },
    include: { paidBy: { select: { displayName: true } } },
    orderBy: { deletedAt: "desc" },
  });

  const items = deleted.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
    category: e.category,
    paidByName: e.paidBy.displayName,
    deletedAt: e.deletedAt?.toISOString() ?? "",
  }));

  return <RecycleBinClient items={items} />;
}
