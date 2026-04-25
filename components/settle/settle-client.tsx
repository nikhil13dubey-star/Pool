"use client";

import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { formatAmount } from "@/lib/shared/types";
import { cn } from "@/lib/client/utils";
import type { User } from "@prisma/client";

interface TransferInfo {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

interface GroupSettlement {
  groupId: string;
  groupName: string;
  transfers: TransferInfo[];
}

interface UserInfo {
  id: string;
  displayName: string;
  avatarColor: string | null;
  upiId: string | null;
}

interface Props {
  currentUser: User;
  settlements: GroupSettlement[];
  userMap: Record<string, UserInfo>;
}

export function SettleClient({ currentUser, settlements, userMap }: Props) {
  const [recording, setRecording] = useState<string | null>(null);
  const [recorded, setRecorded] = useState<Set<string>>(new Set());

  // Transfers I need to make (I owe)
  const myOwes = settlements.flatMap((s) =>
    s.transfers
      .filter((t) => t.fromUserId === currentUser.id)
      .map((t) => ({ ...t, groupId: s.groupId, groupName: s.groupName })),
  );

  // Transfers I'll receive (I'm owed)
  const myReceive = settlements.flatMap((s) =>
    s.transfers
      .filter((t) => t.toUserId === currentUser.id)
      .map((t) => ({ ...t, groupId: s.groupId, groupName: s.groupName })),
  );

  async function recordSettlement(
    transfer: TransferInfo & { groupId: string },
    key: string,
  ) {
    setRecording(key);
    await fetch("/api/settlements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        groupId: transfer.groupId,
        fromUserId: transfer.fromUserId,
        toUserId: transfer.toUserId,
        amount: transfer.amount,
        currency: "INR",
        method: "UPI",
      }),
    });
    setRecorded((prev) => new Set([...prev, key]));
    setRecording(null);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-[60px] pb-4">
        <div className="text-[28px] font-bold tracking-[-0.03em] text-white">
          Settle up
        </div>
        <div className="text-[14px] mt-1" style={{ color: "rgba(255,255,255,0.45)" }}>
          Simplified debts across all groups
        </div>
      </div>

      <div className="px-4 flex flex-col gap-4 pb-6">
        {settlements.length === 0 && (
          <div className="text-center py-20 anim-fade">
            <div
              className="w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(48,209,88,0.12)",
                border: "0.5px solid rgba(48,209,88,0.25)",
              }}
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#30d158"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="text-[17px] font-semibold text-white mb-1.5">
              All settled up!
            </div>
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              No pending payments across any group
            </div>
          </div>
        )}

        {/* You owe */}
        {myOwes.length > 0 && (
          <div>
            <div
              className="text-[11px] font-medium uppercase tracking-[0.1em] px-1 mb-3"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              You owe · {myOwes.length}
            </div>
            <div className="flex flex-col gap-2">
              {myOwes.map((t, i) => {
                const key = `${t.groupId}-${t.toUserId}`;
                const isRecorded = recorded.has(key);
                const isBusy = recording === key;
                const payee = userMap[t.toUserId];
                const fmt = formatAmount(t.amount);
                const upiLink = payee?.upiId
                  ? `upi://pay?pa=${encodeURIComponent(payee.upiId)}&pn=${encodeURIComponent(payee?.displayName ?? "")}&am=${t.amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Pool: ${t.groupName}`)}`
                  : null;

                return (
                  <GlassCard
                    key={key}
                    className={cn("anim-slide-up")}
                    style={{ animationDelay: `${i * 40}ms` } as React.CSSProperties}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar name={payee?.displayName ?? "?"} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="text-[15px] font-semibold text-white truncate">
                          {payee?.displayName ?? "Unknown"}
                        </div>
                        <div
                          className="text-[12px]"
                          style={{ color: "rgba(255,255,255,0.45)" }}
                        >
                          {t.groupName}
                        </div>
                      </div>
                      <div
                        className="text-[20px] font-bold"
                        style={{ color: "#ff9f0a", fontFeatureSettings: "'tnum'" }}
                      >
                        −{fmt.symbol}
                        {fmt.whole}
                        {fmt.decimal}
                      </div>
                    </div>

                    {isRecorded ? (
                      <div
                        className="w-full py-3 rounded-[14px] text-center text-[14px] font-semibold"
                        style={{ background: "rgba(48,209,88,0.12)", color: "#30d158" }}
                      >
                        ✓ Recorded
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        {upiLink && (
                          <a
                            href={upiLink}
                            className="flex-1 py-3 rounded-[14px] text-center text-[14px] font-semibold pool-press"
                            style={{
                              background: "rgba(255,255,255,0.92)",
                              color: "#000",
                              boxShadow:
                                "inset 0 1px 0 rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.4)",
                            }}
                          >
                            Pay via UPI
                          </a>
                        )}
                        <button
                          onClick={() => recordSettlement(t, key)}
                          disabled={isBusy}
                          className="flex-1 py-3 rounded-[14px] text-[14px] font-semibold pool-press transition-all"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            color: isBusy
                              ? "rgba(255,255,255,0.4)"
                              : "rgba(255,255,255,0.85)",
                            border: "0.5px solid rgba(255,255,255,0.1)",
                          }}
                        >
                          {isBusy ? "Recording…" : "Mark paid"}
                        </button>
                      </div>
                    )}
                  </GlassCard>
                );
              })}
            </div>
          </div>
        )}

        {/* You're owed */}
        {myReceive.length > 0 && (
          <div>
            <div
              className="text-[11px] font-medium uppercase tracking-[0.1em] px-1 mb-3"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              You&apos;re owed · {myReceive.length}
            </div>
            <GlassCard noPadding>
              {myReceive.map((t, i) => {
                const payer = userMap[t.fromUserId];
                const fmt = formatAmount(t.amount);
                return (
                  <div
                    key={`${t.groupId}-${t.fromUserId}`}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 anim-slide-up",
                      i < myReceive.length - 1 && "border-b border-white/7",
                    )}
                    style={{ animationDelay: `${(myOwes.length + i) * 40}ms` }}
                  >
                    <Avatar name={payer?.displayName ?? "?"} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-medium text-white truncate">
                        {payer?.displayName ?? "Unknown"}
                      </div>
                      <div
                        className="text-[12px]"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {t.groupName}
                      </div>
                    </div>
                    <div
                      className="text-[15px] font-semibold"
                      style={{ color: "#30d158", fontFeatureSettings: "'tnum'" }}
                    >
                      +{fmt.symbol}
                      {fmt.whole}
                      {fmt.decimal}
                    </div>
                  </div>
                );
              })}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
