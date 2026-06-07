"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { Avatar } from "@/components/ui/avatar";
import { CATEGORIES } from "@/lib/shared/categories";

interface Member {
  userId: string;
  name: string;
  hue: string;
}
type Method = "EQUAL" | "UNEQUAL" | "SHARES" | "PERCENT";

interface Initial {
  id: string;
  description: string;
  amount: number;
  paidById: string;
  category: string;
  participants: string[];
  splitMethod?: string; // EQUAL | EXACT | SHARES | PERCENT
  exactAmounts?: Record<string, number>;
  weights?: Record<string, number>; // share counts or percents (SHARES/PERCENT)
}

function initialMethod(m?: string): Method {
  if (m === "EXACT") return "UNEQUAL";
  if (m === "SHARES") return "SHARES";
  if (m === "PERCENT") return "PERCENT";
  return "EQUAL";
}

export function ExpenseForm({
  groupId,
  initial,
}: {
  groupId: string;
  initial?: Initial;
}) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [meId, setMeId] = useState("");
  const [amount, setAmount] = useState(initial ? String(initial.amount) : "");
  const [desc, setDesc] = useState(initial?.description ?? "");
  const [paidBy, setPaidBy] = useState(initial?.paidById ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Food");
  const [method, setMethod] = useState<Method>(initialMethod(initial?.splitMethod));
  const [selected, setSelected] = useState<Set<string>>(
    new Set(initial?.participants ?? []),
  );
  const [exact, setExact] = useState<Record<string, string>>(
    initial?.splitMethod === "EXACT" && initial?.exactAmounts
      ? Object.fromEntries(
          Object.entries(initial.exactAmounts).map(([k, v]) => [k, String(v)]),
        )
      : {},
  );
  const [shares, setShares] = useState<Record<string, number>>(
    initial?.splitMethod === "SHARES" && initial?.weights ? initial.weights : {},
  );
  const [pct, setPct] = useState<Record<string, string>>(
    initial?.splitMethod === "PERCENT" && initial?.weights
      ? Object.fromEntries(
          Object.entries(initial.weights).map(([k, v]) => [k, String(v)]),
        )
      : {},
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/groups/${groupId}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([g, me]) => {
      const mem: Member[] = (g.members ?? []).map(
        (m: { userId: string; user: { displayName: string; avatarColor: string } }) => ({
          userId: m.userId,
          name: m.user.displayName,
          hue: m.user.avatarColor,
        }),
      );
      setMembers(mem);
      setMeId(me.id);
      if (!initial) {
        setPaidBy(me.id);
        setSelected(new Set(mem.map((x) => x.userId)));
      }
    });
  }, [groupId, initial]);

  const total = parseFloat(amount) || 0;
  const sel = members.filter((m) => selected.has(m.userId));

  // compute per-person owed amounts (in rupees, 2dp, summing exactly to total)
  const computed = useMemo(() => {
    const out: Record<string, number> = {};
    if (sel.length === 0 || total <= 0) return out;
    if (method === "EQUAL") {
      const each = Math.floor((total / sel.length) * 100) / 100;
      sel.forEach(
        (m, i) =>
          (out[m.userId] =
            i === sel.length - 1 ? +(total - each * (sel.length - 1)).toFixed(2) : each),
      );
    } else if (method === "UNEQUAL") {
      sel.forEach((m) => (out[m.userId] = parseFloat(exact[m.userId]) || 0));
    } else if (method === "SHARES") {
      const totalShares = sel.reduce((s, m) => s + (shares[m.userId] ?? 1), 0) || 1;
      let acc = 0;
      sel.forEach((m, i) => {
        if (i === sel.length - 1) out[m.userId] = +(total - acc).toFixed(2);
        else {
          const v =
            Math.floor(((total * (shares[m.userId] ?? 1)) / totalShares) * 100) / 100;
          out[m.userId] = v;
          acc += v;
        }
      });
    } else {
      let acc = 0;
      sel.forEach((m, i) => {
        if (i === sel.length - 1) out[m.userId] = +(total - acc).toFixed(2);
        else {
          const v =
            Math.floor(((total * (parseFloat(pct[m.userId]) || 0)) / 100) * 100) / 100;
          out[m.userId] = v;
          acc += v;
        }
      });
    }
    return out;
  }, [method, sel, total, exact, shares, pct]);

  const sumComputed = Object.values(computed).reduce((s, v) => s + v, 0);
  const balanced = Math.abs(sumComputed - total) < 0.01 && total > 0 && sel.length > 0;

  function toggle(id: string) {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  async function save() {
    if (!desc.trim() || !balanced || !paidBy) {
      setErr("Check amount, who paid & the split.");
      return;
    }
    setSaving(true);
    const participants = sel.map((m) => m.userId);
    const payload: Record<string, unknown> = {
      groupId,
      description: desc.trim(),
      amount: total,
      paidById: paidBy,
      category,
      expenseDate: new Date().toISOString().slice(0, 10),
      participants,
    };
    if (method === "EQUAL") {
      payload.splitMethod = "EQUAL";
    } else if (method === "UNEQUAL") {
      payload.splitMethod = "EXACT";
      payload.exactAmounts = computed;
    } else if (method === "SHARES") {
      payload.splitMethod = "SHARES";
      payload.weights = Object.fromEntries(participants.map((u) => [u, shares[u] ?? 1]));
    } else {
      payload.splitMethod = "PERCENT";
      payload.weights = Object.fromEntries(
        participants.map((u) => [u, parseFloat(pct[u]) || 0]),
      );
    }

    const url = initial ? `/api/expenses/${initial.id}` : "/api/expenses";
    const res = await fetch(url, {
      method: initial ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      router.back();
      router.refresh();
    } else {
      setErr("Couldn't save. Try again.");
      setSaving(false);
    }
  }

  return (
    <ModalSheet
      title={initial ? "Edit expense" : "New expense"}
      doneLabel={saving ? "…" : "Save"}
      onDone={save}
      doneDisabled={saving || !balanced || !desc.trim()}
    >
      <div style={{ padding: "10px 20px 16px" }}>
        {/* amount */}
        <div style={{ textAlign: "center", padding: "10px 0 18px" }}>
          <div className="cap">Amount</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 6,
            }}
          >
            <span
              style={{
                fontSize: 34,
                color: "var(--muted)",
                fontWeight: 600,
                marginRight: 2,
              }}
            >
              ₹
            </span>
            <input
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
              inputMode="decimal"
              placeholder="0"
              autoFocus={!initial}
              style={{
                width: 200,
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--ink)",
                fontSize: 56,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                textAlign: "center",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        <div className="card">
          <div className="row">
            <input
              className="num"
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "var(--ink)",
                fontSize: 17,
                fontWeight: 600,
                fontFamily: "inherit",
              }}
              placeholder="What was this for?"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div className="row">
            <span style={{ flex: 1, color: "var(--muted)" }}>Paid by</span>
            <div style={{ display: "flex", gap: 6 }}>
              {members.map((m) => (
                <button
                  key={m.userId}
                  onClick={() => setPaidBy(m.userId)}
                  style={{
                    border:
                      paidBy === m.userId
                        ? "2px solid var(--accent)"
                        : "2px solid transparent",
                    borderRadius: "50%",
                    padding: 0,
                    background: "none",
                    cursor: "pointer",
                    lineHeight: 0,
                  }}
                  title={m.name}
                >
                  <Avatar name={m.name} hue={m.hue} size={30} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* category */}
        <div className="cap" style={{ margin: "22px 0 10px" }}>
          Category
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              className={`chip${category === c.key ? " chip-on" : ""}`}
              onClick={() => setCategory(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* split */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            margin: "24px 0 12px",
          }}
        >
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-0.02em" }}>
            Split
          </span>
          <span
            className="num"
            style={{ fontSize: 14, color: balanced ? "var(--muted)" : "var(--neg)" }}
          >
            {total > 0
              ? `₹${sumComputed.toFixed(2)} of ₹${total.toFixed(2)}`
              : "enter amount"}
          </span>
        </div>
        <div className="seg">
          {(["EQUAL", "UNEQUAL", "SHARES", "PERCENT"] as Method[]).map((mth) => (
            <button
              key={mth}
              className={method === mth ? "on" : ""}
              onClick={() => setMethod(mth)}
            >
              {mth === "EQUAL"
                ? "Equally"
                : mth === "UNEQUAL"
                  ? "Unequal"
                  : mth === "SHARES"
                    ? "Shares"
                    : "%"}
            </button>
          ))}
        </div>

        <div style={{ color: "var(--muted)", fontSize: 14, padding: "14px 4px 8px" }}>
          Between{" "}
          <b style={{ color: "var(--ink)" }}>
            {sel.length} of {members.length}
          </b>{" "}
          — tap to include
        </div>
        <div className="card">
          {members.map((m) => {
            const on = selected.has(m.userId);
            return (
              <div key={m.userId} className="row" style={{ opacity: on ? 1 : 0.45 }}>
                <button
                  onClick={() => toggle(m.userId)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    lineHeight: 0,
                  }}
                >
                  <Avatar name={m.name} hue={m.hue} size={34} />
                </button>
                <span
                  style={{ flex: 1, fontSize: 16, fontWeight: 500 }}
                  onClick={() => toggle(m.userId)}
                >
                  {m.name}
                  {m.userId === meId && (
                    <span
                      style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}
                    >
                      {" "}
                      (you)
                    </span>
                  )}
                </span>
                {on && method === "UNEQUAL" && (
                  <span style={{ color: "var(--muted)" }}>
                    ₹
                    <input
                      value={exact[m.userId] ?? ""}
                      onChange={(e) =>
                        setExact((p) => ({
                          ...p,
                          [m.userId]: e.target.value.replace(/[^0-9.]/g, ""),
                        }))
                      }
                      inputMode="decimal"
                      placeholder="0"
                      style={{
                        width: 64,
                        background: "rgba(255,255,255,0.06)",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 8px",
                        color: "var(--ink)",
                        fontSize: 15,
                        textAlign: "right",
                        fontFamily: "inherit",
                      }}
                    />
                  </span>
                )}
                {on && method === "SHARES" && (
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      onClick={() =>
                        setShares((p) => ({
                          ...p,
                          [m.userId]: Math.max(1, (p[m.userId] ?? 1) - 1),
                        }))
                      }
                      style={stepBtn}
                    >
                      −
                    </button>
                    <span className="num" style={{ width: 16, textAlign: "center" }}>
                      {shares[m.userId] ?? 1}
                    </span>
                    <button
                      onClick={() =>
                        setShares((p) => ({ ...p, [m.userId]: (p[m.userId] ?? 1) + 1 }))
                      }
                      style={stepBtn}
                    >
                      +
                    </button>
                  </span>
                )}
                {on && method === "PERCENT" && (
                  <span style={{ color: "var(--muted)" }}>
                    <input
                      value={pct[m.userId] ?? ""}
                      onChange={(e) =>
                        setPct((p) => ({
                          ...p,
                          [m.userId]: e.target.value.replace(/[^0-9.]/g, ""),
                        }))
                      }
                      inputMode="decimal"
                      placeholder="0"
                      style={{
                        width: 48,
                        background: "rgba(255,255,255,0.06)",
                        border: "none",
                        borderRadius: 8,
                        padding: "6px 8px",
                        color: "var(--ink)",
                        fontSize: 15,
                        textAlign: "right",
                        fontFamily: "inherit",
                      }}
                    />
                    %
                  </span>
                )}
                {on &&
                  (method === "EQUAL" || method === "SHARES" || method === "PERCENT") && (
                    <span
                      className="num"
                      style={{
                        color: "var(--muted)",
                        fontSize: 14,
                        minWidth: 56,
                        textAlign: "right",
                      }}
                    >
                      ₹{(computed[m.userId] ?? 0).toFixed(0)}
                    </span>
                  )}
              </div>
            );
          })}
        </div>
        {err && (
          <p
            style={{
              color: "var(--neg)",
              fontSize: 13,
              marginTop: 12,
              textAlign: "center",
            }}
          >
            {err}
          </p>
        )}
      </div>
    </ModalSheet>
  );
}

const stepBtn: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.08)",
  border: "none",
  color: "var(--ink)",
  fontSize: 18,
  cursor: "pointer",
  lineHeight: 1,
};
