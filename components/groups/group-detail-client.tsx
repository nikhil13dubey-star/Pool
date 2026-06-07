"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { categoryHue, categoryLabel } from "@/lib/shared/categories";

interface Member {
  id: string;
  userId: string;
  user: { displayName: string; avatarColor: string; isGhost: boolean };
}
interface Line {
  userId: string;
  name: string;
  hue: string;
  amount: number;
  dir: "owed" | "owe";
}
interface Exp {
  id: string;
  description: string;
  amount: number;
  category: string;
  paidByName: string;
  date: string;
  impact: number;
}
interface Group {
  id: string;
  name: string;
  type: string;
  members: Member[];
}

const TYPE_LABEL: Record<string, string> = {
  TRIP: "Trip",
  HOME: "Home",
  COUPLE: "Couple",
  OTHER: "Other",
};
const inr = (n: number) => Math.round(Math.abs(n)).toLocaleString("en-IN");

function dayLabel(d: string) {
  const today = new Date().toISOString().slice(0, 10);
  if (d === today) return "Today";
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function GroupDetailClient({
  group,
  myNet,
  lines,
  expenses,
}: {
  group: Group;
  myNet: number;
  lines: Line[];
  expenses: Exp[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "expenses" | "activity">("overview");
  const settled = Math.round(myNet) === 0;

  const grouped: { day: string; items: Exp[] }[] = [];
  for (const e of expenses) {
    const last = grouped[grouped.length - 1];
    if (last && last.day === e.date) last.items.push(e);
    else grouped.push({ day: e.date, items: [e] });
  }

  return (
    <div style={{ minHeight: "100svh", padding: "16px 0 130px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          minHeight: 44,
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 600 }}>{group.name}</span>
        <Link href={`/groups/${group.id}/settings`} style={{ display: "flex" }}>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="2" />
            <circle cx="19" cy="12" r="2" />
            <circle cx="5" cy="12" r="2" />
          </svg>
        </Link>
      </div>

      <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
        <div className="stack" style={{ justifyContent: "center", marginBottom: 10 }}>
          {group.members.slice(0, 5).map((m) => (
            <Avatar
              key={m.id}
              name={m.user.displayName}
              hue={m.user.avatarColor}
              size={40}
            />
          ))}
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          {TYPE_LABEL[group.type]} · {group.members.length}{" "}
          {group.members.length === 1 ? "person" : "people"}
        </div>
      </div>

      <div className="seg">
        <button
          className={tab === "overview" ? "on" : ""}
          onClick={() => setTab("overview")}
        >
          Overview
        </button>
        <button
          className={tab === "expenses" ? "on" : ""}
          onClick={() => setTab("expenses")}
        >
          Expenses
        </button>
        <button
          className={tab === "activity" ? "on" : ""}
          onClick={() => setTab("activity")}
        >
          Activity
        </button>
      </div>

      {tab === "overview" && (
        <>
          <div className="balance-card" style={{ marginTop: 18, paddingBottom: 20 }}>
            <div className="cap">
              {settled
                ? "In this group"
                : myNet > 0
                  ? "In this group, you're owed"
                  : "In this group, you owe"}
            </div>
            {settled ? (
              <div
                style={{
                  fontSize: 17,
                  fontWeight: 600,
                  marginTop: 10,
                  color: "var(--muted)",
                }}
              >
                ✓ All settled up
              </div>
            ) : (
              <div
                className="balance-amt num"
                style={{ color: myNet > 0 ? "var(--pos)" : "var(--neg)" }}
              >
                <span className="cur">₹</span>
                {inr(myNet)}
              </div>
            )}
          </div>

          {lines.length > 0 && (
            <>
              <div className="section-h">
                <b style={{ fontSize: 16 }}>Balances</b>
              </div>
              <div className="card" style={{ margin: "0 18px" }}>
                {lines.map((l) => (
                  <div key={l.userId + l.dir} className="row">
                    <Avatar name={l.name} hue={l.hue} size={36} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 500 }}>{l.name}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>
                        {l.dir === "owed" ? "owes you" : "you owe"}
                      </div>
                    </div>
                    <span
                      className="num"
                      style={{
                        fontWeight: 700,
                        color: l.dir === "owed" ? "var(--pos)" : "var(--neg)",
                      }}
                    >
                      {l.dir === "owed" ? "+" : "−"}₹{inr(l.amount)}
                    </span>
                  </div>
                ))}
              </div>
              <div style={{ padding: "16px 18px 0" }}>
                <Link href="/settle" className="btn btn-ghost">
                  Settle up
                </Link>
              </div>
            </>
          )}

          <div className="section-h">
            <b style={{ fontSize: 16 }}>Recent</b>
            {expenses.length > 4 && (
              <button
                className="btn-text"
                style={{ border: "none" }}
                onClick={() => setTab("expenses")}
              >
                See all
              </button>
            )}
          </div>
          {expenses.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                padding: "20px 30px 0",
                fontSize: 14,
              }}
            >
              No expenses yet — add your first one below.
            </p>
          ) : (
            <div className="card" style={{ margin: "0 18px" }}>
              {expenses.slice(0, 4).map((e) => (
                <ExpenseRow key={e.id} e={e} groupId={group.id} />
              ))}
            </div>
          )}

          <div style={{ padding: "24px 18px 0" }}>
            <Link href={`/groups/${group.id}/expenses/new`} className="btn btn-primary">
              Add an expense
            </Link>
            <Link
              href={`/groups/${group.id}/members/add`}
              className="btn btn-ghost"
              style={{ marginTop: 10 }}
            >
              Add people
            </Link>
          </div>
        </>
      )}

      {tab === "expenses" && (
        <div style={{ marginTop: 16 }}>
          {grouped.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                padding: "60px 30px",
                fontSize: 14,
              }}
            >
              No expenses yet.
            </p>
          ) : (
            grouped.map((g) => (
              <div key={g.day}>
                <div className="cap" style={{ padding: "16px 18px 8px" }}>
                  {dayLabel(g.day)}
                </div>
                <div className="card" style={{ margin: "0 18px" }}>
                  {g.items.map((e) => (
                    <ExpenseRow key={e.id} e={e} groupId={group.id} />
                  ))}
                </div>
              </div>
            ))
          )}
          <div style={{ padding: "24px 18px 0" }}>
            <Link href={`/groups/${group.id}/expenses/new`} className="btn btn-primary">
              Add an expense
            </Link>
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div style={{ marginTop: 16 }}>
          {expenses.length === 0 ? (
            <p
              style={{
                textAlign: "center",
                color: "var(--muted)",
                padding: "60px 30px",
                fontSize: 14,
              }}
            >
              No activity yet.
            </p>
          ) : (
            <div className="card" style={{ margin: "0 18px" }}>
              {expenses.map((e) => (
                <div key={e.id} className="row">
                  <span
                    className="av"
                    style={{
                      width: 34,
                      height: 34,
                      fontSize: 13,
                      background: `hsl(${categoryHue(e.category)} 70% 45%)`,
                    }}
                  >
                    {e.paidByName[0]}
                  </span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15 }}>
                      <b>{e.paidByName}</b> added <b>{e.description}</b>
                    </div>
                    <div style={{ fontSize: 13, color: "var(--muted)" }}>
                      {dayLabel(e.date)} · ₹{inr(e.amount)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ExpenseRow({ e, groupId }: { e: Exp; groupId: string }) {
  return (
    <Link
      href={`/groups/${groupId}/expenses/${e.id}`}
      className="row"
      style={{ color: "var(--ink)" }}
    >
      <span
        className="av"
        style={{
          width: 38,
          height: 38,
          fontSize: 13,
          background: `hsl(${categoryHue(e.category)} 65% 45%)`,
        }}
      >
        {categoryLabel(e.category)[0]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500 }}>{e.description}</div>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>
          {e.paidByName} paid ₹{inr(e.amount)}
        </div>
      </div>
      {Math.round(e.impact) !== 0 && (
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            {e.impact > 0 ? "you lent" : "you owe"}
          </div>
          <div
            className="num"
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: e.impact > 0 ? "var(--pos)" : "var(--neg)",
            }}
          >
            ₹{inr(e.impact)}
          </div>
        </div>
      )}
    </Link>
  );
}
