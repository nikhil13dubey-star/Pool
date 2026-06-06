import Link from "next/link";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { computeAllGroupBalances } from "@/lib/server/balances";
import { Avatar } from "@/components/ui/avatar";

function fmt(n: number) {
  return Math.round(Math.abs(n)).toLocaleString("en-IN");
}

export default async function AllGroupsPage() {
  const user = (await getCurrentUser())!;
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
  const groups = memberships.map((m) => m.group);
  const balances = await computeAllGroupBalances(
    groups.map((g) => g.id),
    user.id,
  );

  return (
    <div style={{ minHeight: "100svh", padding: "24px 0 130px" }}>
      <h1 className="lt" style={{ padding: "0 22px 18px" }}>
        Groups
      </h1>
      <div className="grid2">
        {groups.map((g) => {
          const bal = balances[g.id] ?? 0;
          const settled = Math.round(bal) === 0;
          return (
            <Link key={g.id} href={`/groups/${g.id}`} className="sqcard">
              <div className="stack">
                {g.members.slice(0, 4).map((m) => (
                  <Avatar
                    key={m.id}
                    name={m.user.displayName}
                    hue={m.user.avatarColor}
                    size={30}
                  />
                ))}
              </div>
              <div className="nm">{g.name}</div>
              <div className="gs">
                {g.members.length} {g.members.length === 1 ? "person" : "people"} ·{" "}
                {g._count.expenses} exp
              </div>
              <div className="lab">
                {settled ? "settled" : bal > 0 ? "you're owed" : "you owe"}
              </div>
              <div
                className="val num"
                style={{
                  color: settled ? "var(--muted)" : bal > 0 ? "var(--pos)" : "var(--neg)",
                }}
              >
                {settled ? "₹0" : `${bal > 0 ? "+" : "−"}₹${fmt(bal)}`}
              </div>
            </Link>
          );
        })}
        <Link href="/groups/new" className="sqcard new">
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              background: "var(--card)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10,
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink)"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 600 }}>New group</span>
        </Link>
      </div>
    </div>
  );
}
