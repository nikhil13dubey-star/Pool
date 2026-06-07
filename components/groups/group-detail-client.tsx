"use client";

import { useState, type ReactNode } from "react";
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
  simplifiedLines,
  expenses,
}: {
  group: Group;
  myNet: number;
  lines: Line[];
  simplifiedLines: Line[];
  expenses: Exp[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "expenses" | "activity">("overview");
  const [balView, setBalView] = useState<"detailed" | "simplified">("detailed");
  const settled = Math.round(myNet) === 0;
  const shownLines = balView === "simplified" ? simplifiedLines : lines;

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
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 17,
                  fontWeight: 600,
                  marginTop: 10,
                  color: "var(--pos)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                All settled up
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
                <div
                  style={{
                    display: "inline-flex",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid var(--stroke)",
                    borderRadius: 999,
                    padding: 3,
                  }}
                >
                  {(["detailed", "simplified"] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setBalView(v)}
                      style={{
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: 12.5,
                        fontWeight: 600,
                        padding: "5px 12px",
                        borderRadius: 999,
                        textTransform: "capitalize",
                        color: balView === v ? "var(--ink)" : "var(--muted)",
                        background: balView === v ? "#34353a" : "transparent",
                        boxShadow:
                          balView === v
                            ? "inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 3px rgba(0,0,0,0.4)"
                            : "none",
                        transition: "color 0.15s, background 0.15s",
                      }}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              {shownLines.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "var(--muted)",
                    padding: "8px 30px 0",
                    fontSize: 14,
                  }}
                >
                  No transfers needed.
                </p>
              ) : (
                <div className="card" style={{ margin: "0 18px" }}>
                  {shownLines.map((l) => (
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
              )}
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
              Add expense
            </Link>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 10,
                marginTop: 10,
              }}
            >
              <ActionTile href={`/groups/${group.id}/members/add`} label="Add people">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="9" cy="8" r="3.2" />
                  <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
                  <path d="M17 8h4M19 6v4" />
                </svg>
              </ActionTile>
              <ActionTile href={`/groups/${group.id}/list`} label="List">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="6" y="4" width="12" height="17" rx="2.5" />
                  <path d="M9 3.5h6a1 1 0 0 1 1 1V6a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1z" />
                  <path d="M9.5 12l1.5 1.5L13.5 11" />
                  <path d="M9.5 16.5h5" />
                </svg>
              </ActionTile>
              <ActionTile href={`/groups/${group.id}/insights`} label="Insights">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 20V10M10 20V4M16 20v-7M4 20h16" />
                </svg>
              </ActionTile>
            </div>
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

function ActionTile({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: "14px 6px",
        borderRadius: 16,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid var(--stroke)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        color: "var(--ink)",
        textDecoration: "none",
        textAlign: "center",
      }}
    >
      <span style={{ display: "flex", color: "var(--accent)" }}>{children}</span>
      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
        {label}
      </span>
    </Link>
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
