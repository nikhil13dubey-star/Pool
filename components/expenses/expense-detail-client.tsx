"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { ChevronLeftIcon } from "@/components/shared/icons";
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
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64d2ff",
            background: "none",
            border: "none",
            cursor: "pointer",
            marginLeft: -8,
          }}
        >
          <ChevronLeftIcon size={20} />
        </button>
        <div className="flex-1 text-center text-[17px] font-semibold tracking-[-0.01em]">
          Expense
        </div>
        {!isDeleted && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              onClick={() => setMode("edit")}
              style={{
                background: "none",
                border: "none",
                fontSize: 15,
                fontWeight: 600,
                color: "#64d2ff",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Edit
            </button>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="w-8 h-8 flex items-center justify-center pool-press"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="1.5" />
                  <circle cx="12" cy="12" r="1.5" />
                  <circle cx="12" cy="19" r="1.5" />
                </svg>
              </button>
              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
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
        <div style={{ textAlign: "center", padding: "12px 24px 24px" }}>
          <CategoryHeroIcon category={expense.category} />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              marginBottom: 4,
              color: "#fff",
            }}
          >
            {expense.description}
          </div>
          <div
            style={{
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              fontFeatureSettings: "'tnum'",
              color: "#fff",
            }}
          >
            ₹
            {Number(expense.amount).toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>
            {formatDateLabel(expense.expenseDate)} · {expense.category}
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

        {/* Comments */}
        <CommentsSection
          expenseId={expense.id}
          currentUser={currentUser}
          initialComments={expense.comments}
        />
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

function formatDateLabel(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function CategoryHeroIcon({ category }: { category: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Food: {
      bg: "linear-gradient(135deg, rgba(255,215,10,0.35), rgba(255,215,10,0.18))",
      color: "#ffd60a",
    },
    Travel: {
      bg: "linear-gradient(135deg, rgba(100,210,255,0.3), rgba(100,210,255,0.15))",
      color: "#64d2ff",
    },
    Entertainment: {
      bg: "linear-gradient(135deg, rgba(191,90,242,0.3), rgba(191,90,242,0.15))",
      color: "#bf5af2",
    },
    Rent: {
      bg: "linear-gradient(135deg, rgba(48,209,88,0.35), rgba(48,209,88,0.18))",
      color: "#30d158",
    },
    Groceries: {
      bg: "linear-gradient(135deg, rgba(48,209,88,0.35), rgba(48,209,88,0.18))",
      color: "#30d158",
    },
    Utilities: {
      bg: "linear-gradient(135deg, rgba(100,210,255,0.3), rgba(100,210,255,0.15))",
      color: "#64d2ff",
    },
    Health: {
      bg: "linear-gradient(135deg, rgba(255,69,58,0.35), rgba(255,69,58,0.18))",
      color: "#ff453a",
    },
    Shopping: {
      bg: "linear-gradient(135deg, rgba(255,100,130,0.35), rgba(255,100,130,0.18))",
      color: "#ff6482",
    },
    Other: {
      bg: "linear-gradient(135deg, rgba(100,210,255,0.3), rgba(100,210,255,0.15))",
      color: "#64d2ff",
    },
  };
  const s = map[category] ?? map.Other;
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: 16,
        margin: "0 auto 14px",
        background: s.bg,
        color: s.color,
        boxShadow: `inset 0 0 0 0.5px ${s.color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.25), transparent)",
          pointerEvents: "none",
        }}
      />
      <svg
        width="26"
        height="26"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        style={{ position: "relative", zIndex: 2 }}
      >
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M2 9h20M9 21V9" />
      </svg>
    </div>
  );
}

function CommentsSection({
  expenseId,
  currentUser,
  initialComments,
}: {
  expenseId: string;
  currentUser: User;
  initialComments: (Comment & { user: User })[];
}) {
  const [comments, setComments] = useState(initialComments);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  async function send() {
    if (!text.trim()) return;
    setSending(true);
    const res = await fetch(`/api/expenses/${expenseId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.trim() }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setText("");
    }
    setSending(false);
  }

  function commentTimeAgo(date: Date | string) {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "just now";
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  }

  const gradients = [
    "linear-gradient(135deg, #ff9f0a, #c8740a)",
    "linear-gradient(135deg, #30d158, #1a8a3a)",
    "linear-gradient(135deg, #ff6482, #c84368)",
    "linear-gradient(135deg, #64d2ff, #3590bb)",
    "linear-gradient(135deg, #bf5af2, #8a3eb5)",
  ];

  return (
    <div>
      <div
        style={{
          padding: "8px 4px 4px",
          fontSize: 11,
          color: "rgba(255,255,255,0.4)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.1em",
          fontWeight: 500,
        }}
      >
        Comments · {comments.length}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column" as const,
          gap: 8,
          marginBottom: 8,
        }}
      >
        {comments.map((c) => {
          const initial = (c.user.displayName.trim()[0] ?? "?").toUpperCase();
          const bg = gradients[initial.charCodeAt(0) % gradients.length];
          return (
            <div
              key={c.id}
              style={{
                padding: "12px 14px",
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                borderRadius: 20,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50%",
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 6,
                  position: "relative",
                  zIndex: 2,
                }}
              >
                <div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "#fff",
                    flexShrink: 0,
                  }}
                >
                  {initial}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                  {c.userId === currentUser.id ? "You" : c.user.displayName}
                </div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                  {commentTimeAgo(c.createdAt)}
                </div>
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "rgba(255,255,255,0.85)",
                  position: "relative",
                  zIndex: 2,
                }}
              >
                {c.body}
              </div>
            </div>
          );
        })}
      </div>
      {/* Comment input */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", paddingBottom: 8 }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Add a comment..."
          style={{
            flex: 1,
            background: "rgba(255,255,255,0.05)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            borderRadius: 14,
            padding: "12px 14px",
            color: "#fff",
            fontSize: 14,
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={sending || !text.trim()}
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: text.trim() ? "#64d2ff" : "rgba(100,210,255,0.2)",
            border: "0.5px solid rgba(100,210,255,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: text.trim() ? "pointer" : "default",
            flexShrink: 0,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
