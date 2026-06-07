"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";

interface Sug {
  groupId: string;
  groupName: string;
  otherId: string;
  otherName: string;
  otherHue: string;
  amount: number;
  dir: "receive" | "pay";
}
interface Hist {
  id: string;
  amount: number;
  groupName: string;
  text: string;
}
const inr = (n: number) => Math.round(Math.abs(n)).toLocaleString("en-IN");

export function SettleClient({
  net,
  suggestions,
  history,
  profile,
}: {
  net: number;
  suggestions: Sug[];
  history: Hist[];
  profile?: React.ReactNode;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  async function mark(s: Sug) {
    const key = s.groupId + s.otherId;
    setBusy(key);
    await fetch("/api/settlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: s.groupId,
        otherId: s.otherId,
        dir: s.dir,
        amount: s.amount,
      }),
    });
    router.refresh();
    setBusy(null);
  }

  return (
    <div style={{ minHeight: "100svh", padding: "24px 0 130px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px 4px",
        }}
      >
        <h1 className="lt">Settle up</h1>
        {profile}
      </div>
      <div style={{ padding: "0 18px 18px" }}>
        <div className="cap">
          {net >= 0 ? "Across all groups, you're owed" : "Across all groups, you owe"}
        </div>
        <div
          className="num"
          style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            marginTop: 4,
            color: net > 0 ? "var(--pos)" : net < 0 ? "var(--neg)" : "var(--ink)",
          }}
        >
          ₹{inr(net)}
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div style={{ textAlign: "center", padding: "50px 30px", color: "var(--muted)" }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>
            You&apos;re all settled up ✓
          </div>
          <div style={{ fontSize: 14, marginTop: 6 }}>No payments needed right now.</div>
        </div>
      ) : (
        <>
          <div className="cap" style={{ padding: "0 18px 12px" }}>
            Suggested — {suggestions.length} payment{suggestions.length > 1 ? "s" : ""}
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              padding: "0 18px",
            }}
          >
            {suggestions.map((s) => {
              const key = s.groupId + s.otherId;
              return (
                <div key={key} className="card" style={{ padding: 18 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Avatar name={s.otherName} hue={s.otherHue} size={40} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 16, fontWeight: 600 }}>
                        {s.dir === "receive"
                          ? `${s.otherName} pays you`
                          : `You pay ${s.otherName}`}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>
                        {s.groupName}
                      </div>
                    </div>
                    <div
                      className="num"
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: s.dir === "receive" ? "var(--pos)" : "var(--neg)",
                      }}
                    >
                      ₹{inr(s.amount)}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost"
                    style={{ marginTop: 14 }}
                    onClick={() => mark(s)}
                    disabled={busy === key}
                  >
                    {busy === key
                      ? "…"
                      : s.dir === "receive"
                        ? "Mark as received"
                        : "Mark as paid"}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {history.length > 0 && (
        <>
          <div className="cap" style={{ padding: "30px 18px 12px" }}>
            Recently settled
          </div>
          <div className="card" style={{ margin: "0 18px" }}>
            {history.map((h) => (
              <div key={h.id} className="row">
                <span
                  className="av"
                  style={{
                    width: 30,
                    height: 30,
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500 }}>{h.text}</div>
                  <div style={{ fontSize: 13, color: "var(--muted)" }}>{h.groupName}</div>
                </div>
                <span className="num muted">₹{inr(h.amount)}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
