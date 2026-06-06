import { prisma } from "@/lib/server/db";
import { getCurrentUser } from "@/lib/server/current-user";
import { InviteClient } from "@/components/invite/invite-client";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({
    where: { token },
    include: {
      group: {
        include: { members: { where: { isActive: true }, include: { user: true } } },
      },
    },
  });

  const user = await getCurrentUser();
  const expired = !invite || invite.expiresAt < new Date();

  if (!invite || expired) {
    return (
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 30,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700 }}>
          {!invite ? "Invalid invite" : "Invite expired"}
        </div>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          Ask the group owner for a fresh link.
        </p>
      </div>
    );
  }

  const preview = {
    token,
    groupId: invite.groupId,
    groupName: invite.group.name,
    groupType: invite.group.type,
    members: invite.group.members.map((m) => ({
      userId: m.userId,
      name: m.user.displayName,
      hue: m.user.avatarColor,
      isGhost: m.user.isGhost,
    })),
  };

  const me = user
    ? {
        id: user.id,
        displayName: user.displayName,
        alreadyMember: invite.group.members.some((m) => m.userId === user.id),
      }
    : null;

  return <InviteClient preview={preview} me={me} />;
}
