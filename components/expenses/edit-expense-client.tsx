"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { CheckIcon, ChevronRightIcon } from "@/components/shared/icons";
import { EXPENSE_CATEGORIES } from "@/lib/shared/types";
import { cn } from "@/lib/client/utils";
import type { Group, GroupMember, User, Expense, ExpenseShare } from "@prisma/client";

type SplitMethod = "EQUAL" | "EXACT";

type ExpenseWithShares = Expense & { shares: (ExpenseShare & { user: User })[] };
type GroupFull = Group & { members: (GroupMember & { user: User })[] };

interface Props {
  expense: ExpenseWithShares;
  group: GroupFull;
  currentUser: User;
  onCancel: () => void;
  onSaved: () => void;
}

export function EditExpenseClient({
  expense,
  group,
  currentUser,
  onCancel,
  onSaved,
}: Props) {
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(String(Number(expense.amount)));
  const [paidById, setPaidById] = useState(expense.paidById);
  const [category, setCategory] = useState(expense.category ?? "Other");
  const [splitMethod, setSplitMethod] = useState<SplitMethod>(
    (expense.splitMethod as SplitMethod) ?? "EQUAL",
  );
  const [participants, setParticipants] = useState<string[]>(
    expense.shares.map((s) => s.userId),
  );
  const [exactAmounts, setExactAmounts] = useState<Record<string, string>>(
    Object.fromEntries(
      expense.shares.map((s) => [s.userId, String(Number(s.amountOwed))]),
    ),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const amountNum = parseFloat(amount.replace(/,/g, "")) || 0;
  const perPerson =
    splitMethod === "EQUAL" && participants.length > 0
      ? amountNum / participants.length
      : 0;
  const exactSum = Object.entries(exactAmounts)
    .filter(([uid]) => participants.includes(uid))
    .reduce((s, [, v]) => s + (parseFloat(v) || 0), 0);
  const exactValid = splitMethod === "EXACT" && Math.abs(exactSum - amountNum) < 0.01;

  function toggleParticipant(userId: string) {
    setParticipants((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  }

  async function handleSave() {
    if (!description.trim() || !amount || participants.length === 0) return;
    if (splitMethod === "EXACT" && !exactValid) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/expenses/${expense.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          amount: amountNum,
          paidById,
          category,
          splitMethod,
          participants,
          ...(splitMethod === "EXACT" && {
            exactAmounts: Object.fromEntries(
              participants.map((uid) => [uid, parseFloat(exactAmounts[uid] ?? "0") || 0]),
            ),
          }),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      onSaved();
    } catch {
      setError("Failed to save changes. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button
          onClick={onCancel}
          className="text-[15px] font-medium pool-press"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Cancel
        </button>
        <div className="text-[17px] font-semibold tracking-[-0.01em]">Edit expense</div>
        <button
          onClick={handleSave}
          disabled={!description.trim() || !amount || loading}
          className="text-[15px] font-semibold pool-press disabled:opacity-40"
          style={{ color: "#64d2ff" }}
        >
          {loading ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Amount */}
      <div
        className="text-center px-6 py-6 border-b"
        style={{ borderColor: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="text-[11px] font-medium uppercase tracking-[0.12em] mb-3.5"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Amount
        </div>
        <div
          className="flex justify-center items-baseline leading-none"
          style={{ fontFeatureSettings: "'tnum'" }}
        >
          <span
            className="text-[32px] font-semibold mr-1"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            ₹
          </span>
          <input
            type="number"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-[64px] font-bold tracking-[-0.04em] bg-transparent outline-none text-white w-full max-w-[200px] text-center"
            style={{ fontFeatureSettings: "'tnum'" }}
            inputMode="decimal"
          />
        </div>
      </div>

      <div className="px-6 pb-8">
        <GlassCard noPadding className="mt-4 mb-4 anim-slide-up">
          <FieldRow label="Description">
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What was this for?"
              className="flex-1 bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-white/40"
              maxLength={200}
            />
          </FieldRow>
          <FieldRow label="Paid by">
            <select
              value={paidById}
              onChange={(e) => setPaidById(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white text-[15px] font-medium appearance-none"
            >
              {group.members.map((m) => (
                <option key={m.userId} value={m.userId} className="bg-[#1a1a1a]">
                  {m.user.displayName}
                  {m.userId === currentUser.id ? " (you)" : ""}
                </option>
              ))}
            </select>
            <ChevronRightIcon size={14} className="text-white/40 flex-shrink-0" />
          </FieldRow>
          <FieldRow label="Category">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white text-[15px] font-medium appearance-none"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#1a1a1a]">
                  {c}
                </option>
              ))}
            </select>
            <ChevronRightIcon size={14} className="text-white/40 flex-shrink-0" />
          </FieldRow>
        </GlassCard>

        {/* Split pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
          {(["EQUAL", "EXACT"] as SplitMethod[]).map((m) => (
            <button
              key={m}
              onClick={() => setSplitMethod(m)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[13px] font-medium whitespace-nowrap pool-press transition-all duration-200",
                splitMethod === m
                  ? "bg-white text-black"
                  : "text-white/55 border border-white/12 bg-white/6",
              )}
            >
              {m === "EQUAL" ? "Equal" : "Exact"}
            </button>
          ))}
        </div>

        {/* Participants */}
        <div>
          <div className="text-[12px] mb-2" style={{ color: "rgba(255,255,255,0.4)" }}>
            {splitMethod === "EQUAL"
              ? `Split among ${participants.length} — ₹${perPerson.toFixed(0)} each`
              : `Exact amounts${exactValid ? " ✓" : ` — ₹${exactSum.toFixed(0)} / ₹${amountNum.toFixed(0)}`}`}
          </div>
          <div className="flex flex-col gap-2.5">
            {group.members.map((m) => {
              const included = participants.includes(m.userId);
              return (
                <div key={m.userId} className="flex items-center gap-3">
                  <button
                    onClick={() => toggleParticipant(m.userId)}
                    className={cn(
                      "w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0 pool-press transition-all duration-200",
                      included ? "bg-[#64d2ff]" : "bg-white/10 border border-white/20",
                    )}
                  >
                    {included && <CheckIcon size={12} className="text-black" />}
                  </button>
                  <Avatar name={m.user.displayName} size="sm" />
                  <div className="flex-1 text-[14px] font-medium text-white">
                    {m.user.displayName}
                    {m.userId === currentUser.id && (
                      <span
                        className="ml-1.5 text-[12px] font-normal"
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      >
                        (you)
                      </span>
                    )}
                  </div>
                  {included && splitMethod === "EQUAL" && (
                    <div
                      className="text-[14px]"
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontFeatureSettings: "'tnum'",
                      }}
                    >
                      ₹{perPerson.toFixed(0)}
                    </div>
                  )}
                  {included && splitMethod === "EXACT" && (
                    <GlassCard noPadding className="min-w-[80px]">
                      <div className="px-3 py-1.5 text-right">
                        <input
                          type="number"
                          value={exactAmounts[m.userId] ?? ""}
                          onChange={(e) =>
                            setExactAmounts((prev) => ({
                              ...prev,
                              [m.userId]: e.target.value,
                            }))
                          }
                          placeholder="0"
                          className="bg-transparent outline-none text-white text-[14px] text-right w-full"
                          style={{ fontFeatureSettings: "'tnum'" }}
                          inputMode="decimal"
                        />
                      </div>
                    </GlassCard>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-center" style={{ color: "#ff453a" }}>
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[11px] mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {label}
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
