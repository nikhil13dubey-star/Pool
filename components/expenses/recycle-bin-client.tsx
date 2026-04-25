"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { ChevronLeftIcon } from "@/components/shared/icons";
import { formatAmount } from "@/lib/shared/types";
import { cn } from "@/lib/client/utils";
import type { User, Expense, ExpenseShare } from "@prisma/client";

type DeletedExpense = Expense & {
  paidBy: { id: string; displayName: string };
  shares: (ExpenseShare & { user: { id: string; displayName: string } })[];
};

interface Props {
  groupId: string;
  expenses: DeletedExpense[];
  currentUser: User;
}

export function RecycleBinClient({ expenses: initial, currentUser }: Props) {
  const router = useRouter();
  const [expenses, setExpenses] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);

  const restore = useCallback(
    async (id: string) => {
      setBusy(id);
      await fetch(`/api/expenses/${id}/restore`, { method: "POST" });
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      setBusy(null);
      router.refresh();
    },
    [router],
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center px-5 pt-6 pb-4 gap-2">
        <button
          onClick={() => router.back()}
          className="w-8 h-8 flex items-center justify-center pool-press -ml-2"
          style={{ color: "#64d2ff" }}
        >
          <ChevronLeftIcon size={20} />
        </button>
        <div className="flex-1 text-center text-[17px] font-semibold tracking-[-0.01em]">
          Recycle bin
        </div>
        <div className="w-8" />
      </div>

      <div className="px-4 pb-10">
        {expenses.length === 0 && (
          <div className="text-center py-20 anim-fade">
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-[20px] flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.07)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </div>
            <div className="text-[17px] font-semibold text-white mb-1.5">
              Nothing deleted
            </div>
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Deleted expenses appear here for 30 days
            </div>
          </div>
        )}

        {expenses.length > 0 && (
          <div className="flex flex-col gap-2">
            <div
              className="text-[12px] mb-1 px-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              {expenses.length} deleted expense{expenses.length !== 1 ? "s" : ""}
            </div>
            {expenses.map((expense, i) => (
              <ExpenseRow
                key={expense.id}
                expense={expense}
                currentUser={currentUser}
                index={i}
                isBusy={busy === expense.id}
                onRestore={() => restore(expense.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExpenseRow({
  expense,
  currentUser,
  index,
  isBusy,
  onRestore,
}: {
  expense: DeletedExpense;
  currentUser: User;
  index: number;
  isBusy: boolean;
  onRestore: () => void;
}) {
  const fmt = formatAmount(Number(expense.amount));
  const deletedDate = expense.deletedAt
    ? new Date(expense.deletedAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Unknown";

  return (
    <GlassCard
      className={cn("anim-slide-up")}
      style={{ animationDelay: `${index * 30}ms` } as React.CSSProperties}
    >
      <div className="flex items-start gap-3">
        {/* Red trash icon */}
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,69,58,0.12)", color: "#ff453a" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-white truncate mb-0.5">
            {expense.description}
          </div>
          <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.45)" }}>
            Paid by{" "}
            {expense.paidById === currentUser.id ? "you" : expense.paidBy.displayName}
            {" · "}
            Deleted {deletedDate}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <div
            className="text-[15px] font-semibold line-through"
            style={{ color: "rgba(255,255,255,0.35)", fontFeatureSettings: "'tnum'" }}
          >
            {fmt.symbol}
            {fmt.whole}
            {fmt.decimal}
          </div>
          <button
            onClick={onRestore}
            disabled={isBusy}
            className="px-3 py-1 rounded-[8px] text-[12px] font-semibold pool-press transition-all"
            style={{
              background: isBusy ? "rgba(255,255,255,0.05)" : "rgba(100,210,255,0.13)",
              color: isBusy ? "rgba(255,255,255,0.35)" : "#64d2ff",
              border: `0.5px solid ${isBusy ? "rgba(255,255,255,0.08)" : "rgba(100,210,255,0.22)"}`,
            }}
          >
            {isBusy ? "…" : "Restore"}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
