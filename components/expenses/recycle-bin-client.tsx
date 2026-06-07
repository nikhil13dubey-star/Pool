"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { categoryHue, categoryLabel } from "@/lib/shared/categories";

interface Item {
  id: string;
  description: string;
  amount: number;
  category: string;
  paidByName: string;
  deletedAt: string;
}
const inr = (n: number) => Math.round(Math.abs(n)).toLocaleString("en-IN");

export function RecycleBinClient({ groupId, items }: { groupId: string; items: Item[] }) {
  const router = useRouter();
  const [list, setList] = useState(items);
  const [busy, setBusy] = useState<string | null>(null);

  async function restore(id: string) {
    setBusy(id);
    const res = await fetch(`/api/expenses/${id}/restore`, { method: "POST" });
    if (res.ok) {
      setList((l) => l.filter((x) => x.id !== id));
      router.refresh();
    }
    setBusy(null);
  }

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
        <button
          onClick={() => router.back()}
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
        <span style={{ fontSize: 17, fontWeight: 600 }}>Recently deleted</span>
      </div>

      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: "70px 30px", color: "var(--muted)" }}>
          <div style={{ fontSize: 17, fontWeight: 600, color: "var(--ink)" }}>
            Nothing here
          </div>
          <div style={{ fontSize: 14, marginTop: 6 }}>
            Deleted expenses show up here so you can restore them.
          </div>
        </div>
      ) : (
        <div className="card" style={{ margin: "18px 18px 0" }}>
          {list.map((e) => (
            <div key={e.id} className="row">
              <span
                className="av"
                style={{
                  width: 36,
                  height: 36,
                  fontSize: 13,
                  color: "#fff",
                  background: `hsl(${categoryHue(e.category)} 60% 42%)`,
                }}
              >
                {categoryLabel(e.category)[0]}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{e.description}</div>
                <div style={{ fontSize: 13, color: "var(--muted)" }}>
                  {e.paidByName} · ₹{inr(e.amount)}
                </div>
              </div>
              <button
                className="chip"
                onClick={() => restore(e.id)}
                disabled={busy === e.id}
                style={{ color: "var(--accent)", borderColor: "rgba(63,182,201,0.4)" }}
              >
                {busy === e.id ? "…" : "Restore"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
