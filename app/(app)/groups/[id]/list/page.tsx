import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { ListClient } from "@/components/groups/list-client";

export default async function GroupListPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = (await getCurrentUser())!;

  const group = await prisma.group.findFirst({
    where: { id, isDeleted: false },
    include: {
      members: { where: { isActive: true }, select: { userId: true } },
      listItems: {
        include: { addedBy: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!group) notFound();
  if (!group.members.some((m) => m.userId === user.id)) notFound();

  const items = group.listItems.map((li) => ({
    id: li.id,
    text: li.text,
    addedById: li.addedById,
    addedByName: li.addedById === user.id ? "You" : li.addedBy.displayName,
    createdAt: li.createdAt.toISOString(),
  }));

  return <ListClient groupId={group.id} groupName={group.name} initialItems={items} />;
}
