"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { categoryLabel } from "@/lib/shared/categories";

interface Share {
  userId: string;
  amountOwed: number;
  user: { displayName: string; avatarColor: string };
}
interface Expense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  category: string;
  paidBy: { id: string; displayName: string; avatarColor: string };
  shares: Share[];
}

interface Comment {
  id: string;
  body: string;
  userId: string;
  name: string;
  hue: string;
}

export function ExpenseDetailClient({
  expense,
  currentUserId,
  comments,
}: {
  expense: Expense;
  currentUserId: string;
  comments: Comment[];
}) {
  const router = useRouter();
  const [list, setList] = useState<Comment[]>(comments);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function addComment() {
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    const res = await fetch(`/api/expenses/${expense.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    if (res.ok) {
      const c = await res.json();
      setList((l) => [...l, c]);
      setText("");
    }
    setSending(false);
  }

  async function del() {
    if (!confirm("Delete this expense?")) return;
    await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
    router.back();
    router.refresh();
  }

  return (
    <div style={{ minHeight: "100svh", padding: "16px 0 40px" }}>
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
        <Link
          href={`/groups/${expense.groupId}/expenses/${expense.id}/edit`}
          className="btn-text"
          style={{ fontSize: 16 }}
        >
          Edit
        </Link>
      </div>

      <div style={{ textAlign: "center", padding: "12px 0 24px" }}>
        <div className="cap">{categoryLabel(expense.category)}</div>
        <div style={{ fontSize: 24, fontWeight: 700, marginTop: 6 }}>
          {expense.description}
        </div>
        <div
          className="num"
          style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: "-0.04em",
            marginTop: 8,
          }}
        >
          ₹{expense.amount.toLocaleString("en-IN")}
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 12,
            color: "var(--muted)",
          }}
        >
          <Avatar
            name={expense.paidBy.displayName}
            hue={expense.paidBy.avatarColor}
            size={24}
          />
          <span style={{ fontSize: 14 }}>
            {expense.paidBy.id === currentUserId ? "You" : expense.paidBy.displayName}{" "}
            paid
          </span>
        </div>
      </div>

      <div className="cap" style={{ padding: "0 22px 10px" }}>
        Split
      </div>
      <div className="card" style={{ margin: "0 18px" }}>
        {expense.shares.map((s) => (
          <div key={s.userId} className="row">
            <Avatar name={s.user.displayName} hue={s.user.avatarColor} size={34} />
            <span style={{ flex: 1, fontSize: 16, fontWeight: 500 }}>
              {s.userId === currentUserId ? "You" : s.user.displayName}
            </span>
            <span className="num" style={{ color: "var(--muted)" }}>
              ₹{Number(s.amountOwed).toLocaleString("en-IN")}
            </span>
          </div>
        ))}
      </div>

      {/* comments */}
      <div className="cap" style={{ padding: "26px 18px 10px" }}>
        Comments
      </div>
      <div
        style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 12 }}
      >
        {list.length === 0 && (
          <p style={{ color: "var(--muted)", fontSize: 14, padding: "0 0 4px" }}>
            No comments yet. Add a note about this expense.
          </p>
        )}
        {list.map((c) => (
          <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <Avatar name={c.name} hue={c.hue} size={30} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 2 }}>
                {c.userId === currentUserId ? "You" : c.name}
              </div>
              <div style={{ fontSize: 15, lineHeight: 1.4 }}>{c.body}</div>
            </div>
          </div>
        ))}
        <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
          <input
            className="input"
            style={{ flex: 1, padding: "12px 14px", fontSize: 15 }}
            placeholder="Add a comment…"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()}
            maxLength={500}
          />
          <button
            className="btn btn-primary"
            style={{ width: "auto", padding: "0 18px" }}
            onClick={addComment}
            disabled={!text.trim() || sending}
          >
            {sending ? "…" : "Send"}
          </button>
        </div>
      </div>

      <div style={{ padding: "26px 18px 0" }}>
        <button
          className="btn"
          style={{ background: "rgba(255,90,70,0.12)", color: "#ff6b54" }}
          onClick={del}
        >
          Delete expense
        </button>
      </div>
    </div>
  );
}
