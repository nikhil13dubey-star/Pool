import Link from "next/link";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { categoryHue } from "@/lib/shared/categories";
import { ProfileButton } from "@/components/shared/profile-button";

const inr = (n: number) => Math.round(Math.abs(n)).toLocaleString("en-IN");

function ago(d: Date) {
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default async function ActivityPage() {
  const user = (await getCurrentUser())!;
  const memberships = await prisma.groupMember.findMany({
    where: { userId: user.id, isActive: true, group: { isDeleted: false } },
    select: { groupId: true, group: { select: { name: true } } },
  });
  const groupIds = memberships.map((m) => m.groupId);
  const groupName = Object.fromEntries(memberships.map((m) => [m.groupId, m.group.name]));

  const [expenses, settlements] = await Promise.all([
    prisma.expense.findMany({
      where: { groupId: { in: groupIds }, isDeleted: false },
      include: { paidBy: true },
      orderBy: { createdAt: "desc" },
      take: 40,
    }),
    prisma.settlement.findMany({
      where: { groupId: { in: groupIds } },
      include: { fromUser: true, toUser: true },
      orderBy: { settledAt: "desc" },
      take: 40,
    }),
  ]);

  type Item = {
    id: string;
    when: Date;
    title: string;
    sub: string;
    amount: number;
    hue: number;
    groupId: string;
  };
  const items: Item[] = [
    ...expenses.map((e) => ({
      id: "e" + e.id,
      when: e.createdAt,
      groupId: e.groupId,
      title: `${e.paidBy.id === user.id ? "You" : e.paidBy.displayName} added ${e.description}`,
      sub: `${groupName[e.groupId]} · ${ago(e.createdAt)}`,
      amount: Number(e.amount),
      hue: categoryHue(e.category),
    })),
    ...settlements.map((s) => ({
      id: "s" + s.id,
      when: s.settledAt,
      groupId: s.groupId,
      title: `${s.fromUser.id === user.id ? "You" : s.fromUser.displayName} paid ${s.toUser.id === user.id ? "you" : s.toUser.displayName}`,
      sub: `${groupName[s.groupId]} · ${ago(s.settledAt)}`,
      amount: Number(s.amount),
      hue: 150,
    })),
  ].sort((a, b) => b.when.getTime() - a.when.getTime());

  return (
    <div style={{ minHeight: "100svh", padding: "24px 0 130px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px 18px",
        }}
      >
        <h1 className="lt">Activity</h1>
        <ProfileButton />
      </div>
      {items.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 30px", color: "var(--muted)" }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>
            Nothing yet
          </div>
          <div style={{ fontSize: 14, marginTop: 6 }}>
            Expenses and settlements show up here.
          </div>
        </div>
      ) : (
        <div className="card" style={{ margin: "0 18px" }}>
          {items.map((it) => (
            <Link
              key={it.id}
              href={`/groups/${it.groupId}`}
              className="row"
              style={{ color: "var(--ink)" }}
            >
              <span
                className="av"
                style={{
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  background: `hsl(${it.hue} 65% 45%)`,
                }}
              >
                {it.title[0]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15 }}>{it.title}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>{it.sub}</div>
              </div>
              <span className="num muted">₹{inr(it.amount)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
