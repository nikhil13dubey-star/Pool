"use client";

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

export function ExpenseDetailClient({
  expense,
  currentUserId,
}: {
  expense: Expense;
  currentUserId: string;
}) {
  const router = useRouter();

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
