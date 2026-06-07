import Link from "next/link";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { computeAllGroupBalances } from "@/lib/server/balances";
import { Avatar } from "@/components/ui/avatar";
import { ProfileButton } from "@/components/shared/profile-button";

function fmt(n: number) {
  return Math.round(Math.abs(n)).toLocaleString("en-IN");
}

export default async function HomePage() {
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
  const owed = groups.reduce((s, g) => s + Math.max(0, balances[g.id] ?? 0), 0);
  const owe = groups.reduce((s, g) => s + Math.max(0, -(balances[g.id] ?? 0)), 0);
  const net = owed - owe;

  return (
    <div style={{ minHeight: "100svh", padding: "20px 0 130px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 22px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.png"
          alt="Pool"
          height={30}
          style={{ height: 30, width: "auto" }}
        />
        <ProfileButton />
      </div>

      <h1 className="lt" style={{ padding: "16px 22px 14px" }}>
        Hey, {user.displayName.split(" ")[0]}
      </h1>

      <div className="balance-card">
        <div className="cap">{net >= 0 ? "You're owed overall" : "You owe overall"}</div>
        <div className="balance-amt num">
          <span className="cur">₹</span>
          {fmt(net)}
        </div>
        <div className="bstats">
          <div className="s">
            <div style={{ fontSize: 13, color: "var(--muted)" }}>Owed to you</div>
            <div
              className="num pos"
              style={{ fontSize: 19, fontWeight: 700, marginTop: 3 }}
            >
              ₹{fmt(owed)}
            </div>
          </div>
          <div className="s">
            <div style={{ fontSize: 13, color: "var(--muted)" }}>You owe</div>
            <div
              className="num"
              style={{
                fontSize: 19,
                fontWeight: 700,
                marginTop: 3,
                color: owe > 0 ? "var(--neg)" : "var(--muted)",
              }}
            >
              ₹{fmt(owe)}
            </div>
          </div>
        </div>
      </div>

      <div className="section-h">
        <b>Groups</b>
        {groups.length > 3 && <Link href="/groups">See all</Link>}
      </div>

      <div className="grid2">
        {groups.slice(0, 3).map((g) => {
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
                {g._count.expenses} {g._count.expenses === 1 ? "expense" : "expenses"}
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
