"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { ChevronLeftIcon, DotsVerticalIcon } from "@/components/shared/icons";
import { EditExpenseClient } from "./edit-expense-client";
import { formatAmount } from "@/lib/shared/types";
import { cn } from "@/lib/client/utils";
import type {
  Group,
  GroupMember,
  User,
  Expense,
  ExpenseShare,
  Comment,
} from "@prisma/client";

type ExpenseFull = Expense & {
  paidBy: User;
  createdBy: User;
  shares: (ExpenseShare & { user: User })[];
  comments: (Comment & { user: User })[];
};

type GroupFull = Group & {
  members: (GroupMember & { user: User })[];
};

interface Props {
  expense: ExpenseFull;
  group: GroupFull;
  currentUser: User;
}

export function ExpenseDetailClient({ expense, group, currentUser }: Props) {
  const router = useRouter();
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fmt = formatAmount(Number(expense.amount));
  const isDeleted = expense.isDeleted;

  async function handleDelete() {
    if (!confirm("Delete this expense? It can be restored from the recycle bin.")) return;
    setDeleting(true);
    setMenuOpen(false);
    await fetch(`/api/expenses/${expense.id}`, { method: "DELETE" });
    router.push(`/groups/${expense.groupId}`);
    router.refresh();
  }

  if (mode === "edit") {
    return (
      <EditExpenseClient
        expense={expense}
        group={group}
        currentUser={currentUser}
        onCancel={() => setMode("view")}
        onSaved={() => {
          setMode("view");
          router.refresh();
        }}
      />
    );
  }

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
        <div className="flex-1 text-center text-[17px] font-semibold tracking-[-0.01em] truncate">
          {expense.description}
        </div>
        {!isDeleted && (
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="w-8 h-8 flex items-center justify-center pool-press"
            >
              <DotsVerticalIcon size={16} />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div
                  className="absolute right-0 top-10 z-50 rounded-[14px] overflow-hidden min-w-[160px]"
                  style={{
                    background: "rgba(28,28,30,0.96)",
                    backdropFilter: "blur(40px)",
                    border: "0.5px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                  }}
                >
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setMode("edit");
                    }}
                    className="flex items-center gap-2 w-full px-4 py-3 text-[14px] font-medium text-white text-left pool-press border-b border-white/8"
                  >
                    Edit expense
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center gap-2 w-full px-4 py-3 text-[14px] font-medium text-left pool-press"
                    style={{ color: "#ff453a" }}
                  >
                    {deleting ? "Deleting…" : "Delete expense"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isDeleted && (
        <div
          className="mx-5 mb-3 px-4 py-3 rounded-[12px] text-[13px] font-medium"
          style={{
            background: "rgba(255,69,58,0.12)",
            color: "#ff453a",
            border: "0.5px solid rgba(255,69,58,0.25)",
          }}
        >
          This expense has been deleted
        </div>
      )}

      <div className="px-4 flex flex-col gap-4 pb-10">
        {/* Amount hero */}
        <div className="text-center py-6 anim-slide-up">
          <div
            className="text-[13px] font-medium uppercase tracking-[0.1em] mb-3"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {expense.category}
          </div>
          <div
            className="text-[56px] font-bold tracking-[-0.04em] leading-none"
            style={{ fontFeatureSettings: "'tnum'" }}
          >
            <span
              className="text-[28px] font-semibold mr-1 align-top mt-3 inline-block"
              style={{ color: "rgba(255,255,255,0.55)" }}
            >
              {fmt.symbol}
            </span>
            <span className="text-white">{fmt.whole}</span>
            {fmt.decimal && (
              <span
                className="text-[28px] font-semibold"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                {fmt.decimal}
              </span>
            )}
          </div>
          <div className="mt-3 text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
            Paid by{" "}
            <strong className="text-white">
              {expense.paidById === currentUser.id ? "you" : expense.paidBy.displayName}
            </strong>
            {" · "}
            {new Date(expense.expenseDate).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Split breakdown */}
        <div className="anim-slide-up" style={{ animationDelay: "60ms" }}>
          <div
            className="text-[11px] font-medium uppercase tracking-[0.1em] px-1 mb-3"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Split — {expense.splitMethod === "EQUAL" ? "Equal" : "Exact"}
          </div>
          <GlassCard noPadding>
            {expense.shares.map((share, i) => {
              const shareFmt = formatAmount(Number(share.amountOwed));
              const isPayer = expense.paidById === share.userId;
              return (
                <div
                  key={share.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3",
                    i < expense.shares.length - 1 && "border-b border-white/7",
                  )}
                >
                  <Avatar name={share.user.displayName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-medium text-white truncate">
                      {share.userId === currentUser.id ? "You" : share.user.displayName}
                    </div>
                    {isPayer && (
                      <div className="text-[11px]" style={{ color: "#30d158" }}>
                        paid
                      </div>
                    )}
                  </div>
                  <div
                    className="text-[14px] font-semibold"
                    style={{
                      color: isPayer ? "#30d158" : "rgba(255,255,255,0.85)",
                      fontFeatureSettings: "'tnum'",
                    }}
                  >
                    {shareFmt.symbol}
                    {shareFmt.whole}
                    {shareFmt.decimal}
                  </div>
                </div>
              );
            })}
          </GlassCard>
        </div>

        {/* Notes */}
        {expense.notes && (
          <GlassCard
            className="anim-slide-up"
            style={{ animationDelay: "80ms" } as React.CSSProperties}
          >
            <div
              className="text-[11px] font-medium uppercase tracking-[0.1em] mb-2"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Notes
            </div>
            <div className="text-[14px] text-white leading-relaxed">{expense.notes}</div>
          </GlassCard>
        )}

        {/* Meta */}
        <GlassCard
          className="anim-slide-up"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <div className="flex flex-col gap-3">
            <MetaRow
              label="Added by"
              value={
                expense.createdById === currentUser.id
                  ? "You"
                  : expense.createdBy.displayName
              }
            />
            <MetaRow
              label="Added on"
              value={new Date(expense.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            />
            {expense.updatedAt.getTime() !== expense.createdAt.getTime() && (
              <MetaRow
                label="Last edited"
                value={new Date(expense.updatedAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            )}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
        {label}
      </div>
      <div className="text-[13px] font-medium text-white">{value}</div>
    </div>
  );
}
