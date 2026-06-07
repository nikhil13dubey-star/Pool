import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { prisma } from "@/lib/server/db";
import { Avatar } from "@/components/ui/avatar";
import { categoryHue, categoryLabel } from "@/lib/shared/categories";
import { BackButton } from "@/components/shared/back-button";

const inr = (n: number) => Math.round(n).toLocaleString("en-IN");

// Largest-remainder rounding so the displayed percentages add up to 100.
function roundPercents(values: number[], total: number): number[] {
  if (total <= 0) return values.map(() => 0);
  const raw = values.map((v) => (v / total) * 100);
  const floored = raw.map((r) => Math.floor(r));
  let remainder = 100 - floored.reduce((a, b) => a + b, 0);
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac);
  const out = [...floored];
  for (let k = 0; k < order.length && remainder > 0; k++, remainder--) {
    out[order[k].i] += 1;
  }
  return out;
}

type Seg = { cat: string; amt: number; pct: number; hue: number };

// Pure-SVG donut. Continuous ring, each segment colored per category, total in
// the center. A small min-arc keeps tiny slivers visible.
function Donut({ segs }: { segs: Seg[] }) {
  const SIZE = 168;
  const STROKE = 20;
  const r = (SIZE - STROKE) / 2;
  const c = SIZE / 2;
  const circ = 2 * Math.PI * r;
  const GAP = segs.length > 1 ? 1.5 : 0; // degrees of breathing room between arcs

  const grand = segs.reduce((s, x) => s + x.amt, 0) || 1;
  // Fractions with a minimum so slivers stay visible, then renormalize.
  const MIN_FRAC = segs.length > 1 ? 0.012 : 0;
  const rawUnnorm = segs.map((s) => Math.max(s.amt / grand, MIN_FRAC));
  const rawSum = rawUnnorm.reduce((a, b) => a + b, 0);
  const raw = rawUnnorm.map((f) => f / rawSum);

  // cumulative start fraction per segment (prefix sum, no render-time mutation)
  const starts = raw.map((_, i) => raw.slice(0, i).reduce((a, b) => a + b, 0));
  const arcs = segs.map((s, i) => {
    const frac = raw[i];
    const start = starts[i];
    const gapFrac = GAP / 360;
    const len = Math.max(frac - gapFrac, 0.001) * circ;
    const dash = `${len} ${circ - len}`;
    const offset = -(start + gapFrac / 2) * circ;
    return { key: s.cat, hue: s.hue, dash, offset };
  });

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      style={{ flexShrink: 0, display: "block" }}
    >
      {/* track */}
      <circle
        cx={c}
        cy={c}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={STROKE}
      />
      <g transform={`rotate(-90 ${c} ${c})`}>
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx={c}
            cy={c}
            r={r}
            fill="none"
            stroke={`hsl(${a.hue} 65% 52%)`}
            strokeWidth={STROKE}
            strokeLinecap="butt"
            strokeDasharray={a.dash}
            strokeDashoffset={a.offset}
          />
        ))}
      </g>
    </svg>
  );
}

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
  const maxPay = payers[0]?.[1] ?? 1;

  // Derived donut segments with summing-to-100 percentages.
  const catPcts = roundPercents(
    cats.map(([, amt]) => amt),
    total,
  );
  const segs: Seg[] = cats.map(([cat, amt], i) => ({
    cat,
    amt,
    pct: catPcts[i],
    hue: categoryHue(cat),
  }));
  const topCat = cats[0];

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
          <div className="card" style={{ margin: "0 18px", padding: 20 }}>
            <div
              style={{
                position: "relative",
                width: 168,
                height: 168,
                margin: "2px auto 4px",
              }}
            >
              <Donut segs={segs} />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none",
                }}
              >
                <div
                  className="num"
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                  }}
                >
                  ₹{inr(total)}
                </div>
                <div
                  className="cap"
                  style={{ marginTop: 4, fontSize: 10.5, letterSpacing: "0.14em" }}
                >
                  Total
                </div>
              </div>
            </div>

            {topCat && (
              <div
                style={{
                  textAlign: "center",
                  fontSize: 13,
                  color: "var(--muted)",
                  marginTop: 2,
                }}
              >
                Most on{" "}
                <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                  {categoryLabel(topCat[0])}
                </span>{" "}
                · {segs[0].pct}%
              </div>
            )}

            {/* legend */}
            <div
              style={{
                marginTop: 16,
                paddingTop: 4,
                borderTop: "1px solid var(--stroke)",
              }}
            >
              {segs.map((s, i) => (
                <div
                  key={s.cat}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "11px 0",
                    borderBottom:
                      i < segs.length - 1 ? "1px solid var(--stroke)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      flexShrink: 0,
                      background: `hsl(${s.hue} 65% 52%)`,
                      boxShadow: `0 0 8px hsl(${s.hue} 65% 52% / 0.4)`,
                    }}
                  />
                  <span style={{ flex: 1, fontSize: 14, minWidth: 0 }}>
                    {categoryLabel(s.cat)}
                  </span>
                  <span className="num" style={{ fontSize: 14, fontWeight: 600 }}>
                    ₹{inr(s.amt)}
                  </span>
                  <span
                    className="num muted"
                    style={{
                      fontSize: 12,
                      width: 38,
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {s.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="cap" style={{ padding: "28px 18px 12px" }}>
            Paid by
          </div>
          <div className="card" style={{ margin: "0 18px", padding: "8px 18px" }}>
            {payers.map(([uid, amt], i) => (
              <div
                key={uid}
                style={{
                  padding: "14px 0",
                  borderTop: i > 0 ? "1px solid var(--stroke)" : "none",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    marginBottom: 10,
                  }}
                >
                  <Avatar
                    name={userMap[uid]?.displayName ?? "?"}
                    hue={userMap[uid]?.avatarColor ?? "0"}
                    size={28}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 15,
                      fontWeight: 500,
                      minWidth: 0,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {uid === user.id ? "You" : (userMap[uid]?.displayName ?? "?")}
                  </span>
                  <span
                    className="num"
                    style={{ fontSize: 15, fontWeight: 600, flexShrink: 0 }}
                  >
                    ₹{inr(amt)}
                  </span>
                </div>
                <div
                  style={{
                    height: 9,
                    borderRadius: 99,
                    background: "rgba(255,255,255,0.06)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max((amt / maxPay) * 100, 4)}%`,
                      height: "100%",
                      borderRadius: 99,
                      background: "var(--brand-grad)",
                      boxShadow: "0 0 10px -2px var(--brand-glow)",
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
