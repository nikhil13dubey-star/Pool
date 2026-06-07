import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { GamesClient } from "@/components/games/games-client";

export default async function GamesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const group = await prisma.group.findFirst({
    where: { id, isDeleted: false },
    include: {
      members: {
        where: { isActive: true },
        include: { user: { select: { displayName: true } } },
      },
    },
  });
  if (!group || !group.members.some((m) => m.userId === user.id)) notFound();

  const memberNames = group.members.map((m) => m.user.displayName);
  return <GamesClient memberNames={memberNames} />;
}
