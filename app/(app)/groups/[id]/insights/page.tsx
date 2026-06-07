import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { Avatar } from "@/components/ui/avatar";
import { categoryHue, categoryLabel } from "@/lib/shared/categories";
import { BackButton } from "@/components/shared/back-button";

const inr = (n: number) => Math.round(n).toLocaleString("en-IN");

export default async function InsightsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = (await getCurrentUser())!;
  const group = await prisma.group.findFirst({
    where: { id, isDeleted: false },
    include: { members: { where: { isActive: true }, include: { user: true } } },
  });
  if (!group || !group.members.some((m) => m.userId === user.id)) notFound();

  const expenses = await prisma.expense.findMany({
    where: { groupId: id, isDeleted: false },
    include: { shares: true },
  });

  const userMap = Object.fromEntries(group.members.map((m) => [m.userId, m.user]));
  let total = 0;
  let myShare = 0;
  const byCat: Record<string, number> = {};
  const byPayer: Record<string, number> = {};
  for (const e of expenses) {
    const amt = Number(e.amount);
    total += amt;
    byCat[e.category] = (byCat[e.category] ?? 0) + amt;
    byPayer[e.paidById] = (byPayer[e.paidById] ?? 0) + amt;
    const mine = e.shares.find((s) => s.userId === user.id);
    if (mine) myShare += Number(mine.amountOwed);
  }

  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  const payers = Object.entries(byPayer).sort((a, b) => b[1] - a[1]);
  const maxCat = cats[0]?.[1] ?? 1;
  const maxPay = payers[0]?.[1] ?? 1;

  return (
    <div style={{ minHeight: "100svh", padding: "16px 0 130px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: "0 14px",
          minHeight: 44,
        }}
      >
        <BackButton />
        <span style={{ fontSize: 17, fontWeight: 600 }}>Insights</span>
      </div>

      {expenses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "70px 30px", color: "var(--muted)" }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>
            No data yet
          </div>
          <div style={{ fontSize: 14, marginTop: 6 }}>
            Add expenses to see the breakdown.
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 12, padding: "16px 18px 0" }}>
            <div className="card" style={{ flex: 1, margin: 0, padding: 16 }}>
              <div className="cap">Total spent</div>
              <div
                className="num"
                style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}
              >
                ₹{inr(total)}
              </div>
            </div>
            <div className="card" style={{ flex: 1, margin: 0, padding: 16 }}>
              <div className="cap">Your share</div>
              <div
                className="num"
                style={{ fontSize: 24, fontWeight: 700, marginTop: 4 }}
              >
                ₹{inr(myShare)}
              </div>
            </div>
          </div>

          <div className="cap" style={{ padding: "28px 18px 12px" }}>
            By category
          </div>
          <div className="card" style={{ margin: "0 18px", padding: "6px 18px" }}>
            {cats.map(([cat, amt]) => (
              <div key={cat} style={{ padding: "12px 0" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 14,
                    marginBottom: 7,
                  }}
                >
                  <span>{categoryLabel(cat)}</span>
                  <span className="num muted">
                    ₹{inr(amt)} · {Math.round((amt / total) * 100)}%
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(amt / maxCat) * 100}%`,
                      height: "100%",
                      borderRadius: 99,
                      background: `hsl(${categoryHue(cat)} 65% 52%)`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="cap" style={{ padding: "28px 18px 12px" }}>
            Paid by
          </div>
          <div className="card" style={{ margin: "0 18px", padding: "6px 18px" }}>
            {payers.map(([uid, amt]) => (
              <div key={uid} style={{ padding: "12px 0" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    marginBottom: 7,
                  }}
                >
                  <Avatar
                    name={userMap[uid]?.displayName ?? "?"}
                    hue={userMap[uid]?.avatarColor ?? "0"}
                    size={26}
                  />
                  <span style={{ flex: 1, fontSize: 14 }}>
                    {uid === user.id ? "You" : (userMap[uid]?.displayName ?? "?")}
                  </span>
                  <span className="num muted" style={{ fontSize: 14 }}>
                    ₹{inr(amt)}
                  </span>
                </div>
                <div
                  style={{
                    height: 8,
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(amt / maxPay) * 100}%`,
                      height: "100%",
                      borderRadius: 99,
                      background: "var(--brand-grad)",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
