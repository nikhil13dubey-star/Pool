"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/button";
import { ChevronLeftIcon, DotsVerticalIcon, PlusIcon } from "@/components/shared/icons";
import { cn } from "@/lib/client/utils";
import { formatAmount } from "@/lib/shared/types";
import type { Group, GroupMember, User, Expense, ExpenseShare } from "@prisma/client";
import type { UserBalance } from "@/lib/server/balances";

type Tab = "overview" | "expenses" | "activity";

interface GroupWithFull extends Group {
  members: (GroupMember & { user: User })[];
  expenses: (Expense & { paidBy: User; shares: (ExpenseShare & { user: User })[] })[];
}

interface Props {
  group: GroupWithFull;
  currentUser: User;
  balances: UserBalance[];
}

export function GroupDetailClient({ group, currentUser, balances }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [inviteSheet, setInviteSheet] = useState<{
    ghostUserId: string;
    name: string;
  } | null>(null);

  const myBalance = balances.find((b) => b.userId === currentUser.id);

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
          {group.name}
        </div>
        <Link href={`/groups/${group.id}/settings`}>
          <IconButton>
            <DotsVerticalIcon size={16} />
          </IconButton>
        </Link>
      </div>

      {/* Tab strip — segmented glass style */}
      <div style={{ padding: "0 14px 16px" }}>
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(30px)",
            border: "0.5px solid rgba(255,255,255,0.07)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 4,
            display: "flex",
            gap: 2,
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
              background: "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
              pointerEvents: "none",
            }}
          />
          {(["overview", "expenses", "activity"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1,
                padding: "8px 10px",
                textAlign: "center",
                fontSize: 13,
                fontWeight: tab === t ? 600 : 500,
                color: tab === t ? "#fff" : "rgba(255,255,255,0.55)",
                background: tab === t ? "rgba(255,255,255,0.12)" : "transparent",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontFamily: "inherit",
                position: "relative",
                zIndex: 2,
                textTransform: "capitalize",
                transition: "all 0.2s",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {tab === "overview" && (
          <OverviewTab
            group={group}
            balances={balances}
            currentUser={currentUser}
            myBalance={myBalance}
            onInviteGhost={(ghostUserId, name) => setInviteSheet({ ghostUserId, name })}
          />
        )}
        {tab === "expenses" && <ExpensesTab group={group} currentUser={currentUser} />}
        {tab === "activity" && <ActivityTab groupId={group.id} />}
      </div>

      {/* Invite sheet */}
      {inviteSheet && (
        <InviteSheet
          groupId={group.id}
          ghostUserId={inviteSheet.ghostUserId}
          ghostName={inviteSheet.name}
          onClose={() => setInviteSheet(null)}
        />
      )}

      {/* FAB */}
      <Link href={`/groups/${group.id}/expenses/new`}>
        <div
          className="fixed bottom-[84px] right-[22px] z-[49] w-[52px] h-[52px] rounded-full flex items-center justify-center text-black pool-press"
          style={{
            background: "rgba(255,255,255,0.92)",
            border: "0.5px solid rgba(255,255,255,0.4)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,1), 0 8px 32px rgba(0,0,0,0.5)",
          }}
        >
          <PlusIcon size={22} />
        </div>
      </Link>
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({
  group,
  currentUser,
  myBalance,
  onInviteGhost,
}: {
  group: GroupWithFull;
  balances?: UserBalance[];
  currentUser: User;
  myBalance?: UserBalance;
  onInviteGhost: (ghostUserId: string, name: string) => void;
}) {
  const memberMap = Object.fromEntries(group.members.map((m) => [m.userId, m.user]));

  // People who owe me
  const owedEntries = Object.entries(myBalance?.isOwed ?? {}).filter(
    ([, amt]) => amt > 0,
  );
  // People I owe
  const oweEntries = Object.entries(myBalance?.owes ?? {}).filter(([, amt]) => amt > 0);

  return (
    <div style={{ paddingBottom: 8 }}>
      {/* Avatar stack + balance hero */}
      <div style={{ textAlign: "center", padding: "0 24px 24px" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          {group.members.slice(0, 4).map((m, i) => (
            <div
              key={m.id}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: [
                  "linear-gradient(135deg, #ff9f0a, #c8740a)",
                  "linear-gradient(135deg, #30d158, #1a8a3a)",
                  "linear-gradient(135deg, #ff6482, #c84368)",
                  "linear-gradient(135deg, #64d2ff, #3590bb)",
                ][i % 4],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 600,
                color: "#fff",
                marginRight: i < Math.min(group.members.length, 4) - 1 ? -10 : 0,
                border: "2px solid rgba(0,0,0,0.4)",
                position: "relative",
                flexShrink: 0,
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
                    "linear-gradient(180deg, rgba(255,255,255,0.2), transparent)",
                  pointerEvents: "none",
                }}
              />
              <span style={{ position: "relative", zIndex: 2 }}>
                {(m.user.displayName.trim()[0] ?? "?").toUpperCase()}
              </span>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
          In this group, you&apos;re owed
        </div>
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            lineHeight: 1,
            color:
              myBalance && myBalance.net > 0
                ? "#30d158"
                : myBalance && myBalance.net < 0
                  ? "#ff9f0a"
                  : "rgba(255,255,255,0.55)",
            fontFeatureSettings: "'tnum'",
          }}
        >
          {myBalance && myBalance.net > 0
            ? "+"
            : myBalance && myBalance.net < 0
              ? "−"
              : ""}
          ₹
          {Math.abs(myBalance?.net ?? 0).toLocaleString("en-IN", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </div>
      </div>

      {/* Balances section */}
      <div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "6px 24px 12px",
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color: "#fff",
            }}
          >
            Balances
          </span>
          <span
            style={{
              fontSize: 14,
              color: "#64d2ff",
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M3 12l3 3 5-5M14 9h7M14 15h5" />
            </svg>
            Simplify
          </span>
        </div>

        <div style={{ padding: "0 14px" }}>
          {(owedEntries.length > 0 || oweEntries.length > 0) && (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                backdropFilter: "blur(30px)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                borderRadius: 20,
                overflow: "hidden",
                position: "relative",
                marginBottom: 12,
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
                  padding: "12px 16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {owedEntries.map(([userId, amount]) => (
                  <BalanceRow
                    key={userId}
                    user={memberMap[userId]}
                    amount={amount}
                    direction="owed"
                  />
                ))}
                {oweEntries.map(([userId, amount]) => (
                  <BalanceRow
                    key={userId}
                    user={memberMap[userId]}
                    amount={amount}
                    direction="owe"
                  />
                ))}
              </div>
              <div
                style={{
                  borderTop: "0.5px solid rgba(255,255,255,0.07)",
                  padding: "12px 16px",
                }}
              >
                <Link href={`/groups/${group.id}/settle`}>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px 0",
                      fontSize: 15,
                      fontWeight: 600,
                      borderRadius: 12,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      background: "rgba(100,210,255,0.13)",
                      color: "#64d2ff",
                      border: "0.5px solid rgba(100,210,255,0.22)",
                    }}
                  >
                    Settle up
                  </button>
                </Link>
              </div>
            </div>
          )}

          {owedEntries.length === 0 && oweEntries.length === 0 && (
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
                borderRadius: 20,
                padding: "16px 16px",
                textAlign: "center",
                marginBottom: 12,
              }}
            >
              <div
                style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}
              >
                ✓ All settled up in this group
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Members */}
      <div style={{ padding: "0 14px" }}>
        <div
          className="text-[11px] font-medium uppercase tracking-[0.1em] px-1 mb-3"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          Members · {group.members.length}
        </div>
        <GlassCard noPadding className="anim-slide-up">
          {group.members.map((member, i) => (
            <div
              key={member.id}
              className={cn(
                "flex items-center gap-3 px-4 py-3",
                i < group.members.length - 1 && "border-b border-white/7",
              )}
            >
              <Avatar name={member.user.displayName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-medium text-white truncate">
                  {member.user.displayName}
                  {member.userId === currentUser.id && (
                    <span
                      className="ml-1.5 text-[12px] font-normal"
                      style={{ color: "rgba(255,255,255,0.4)" }}
                    >
                      (you)
                    </span>
                  )}
                </div>
                {member.user.isGhost && (
                  <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Invite pending
                  </div>
                )}
              </div>
              {member.user.isGhost && (
                <button
                  onClick={() => onInviteGhost(member.userId, member.user.displayName)}
                  className="px-3 py-1.5 rounded-[10px] text-[12px] font-semibold pool-press"
                  style={{
                    background: "rgba(100,210,255,0.13)",
                    color: "#64d2ff",
                    border: "0.5px solid rgba(100,210,255,0.22)",
                  }}
                >
                  Invite
                </button>
              )}
            </div>
          ))}
          {/* Add member */}
          <Link href={`/groups/${group.id}/members/add`}>
            <div className="flex items-center gap-3 px-4 py-3 pool-press border-t border-white/7">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "0.5px dashed rgba(255,255,255,0.2)",
                }}
              >
                <PlusIcon size={16} className="opacity-60" />
              </div>
              <div
                className="text-[14px] font-medium"
                style={{ color: "rgba(255,255,255,0.55)" }}
              >
                Add member by name
              </div>
            </div>
          </Link>
        </GlassCard>
      </div>
    </div>
  );
}

function BalanceRow({
  user,
  amount,
  direction,
}: {
  user: User | undefined;
  amount: number;
  direction: "owed" | "owe";
}) {
  if (!user) return null;
  const fmt = formatAmount(amount);

  return (
    <div className="flex items-center gap-3">
      <Avatar name={user.displayName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-white truncate">
          {user.displayName}
        </div>
        <div
          className="text-[12px]"
          style={{
            color: direction === "owed" ? "#30d158" : "#ff9f0a",
          }}
        >
          {direction === "owed" ? "owes you" : "you owe"}
        </div>
      </div>
      <div
        className="text-[15px] font-semibold"
        style={{
          color: direction === "owed" ? "#30d158" : "#ff9f0a",
          fontFeatureSettings: "'tnum'",
        }}
      >
        {direction === "owed" ? "+" : "−"}
        {fmt.symbol}
        {fmt.whole}
        {fmt.decimal}
      </div>
    </div>
  );
}

// ─── Expenses Tab ─────────────────────────────────────────────────────────────

function ExpensesTab({
  group,
  currentUser,
}: {
  group: GroupWithFull;
  currentUser: User;
}) {
  if (group.expenses.length === 0) {
    return (
      <div className="text-center py-16 anim-fade">
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
            stroke="rgba(255,255,255,0.55)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <rect x="2" y="3" width="20" height="18" rx="2" />
            <path d="M2 9h20M9 21V9" />
          </svg>
        </div>
        <div className="text-[17px] font-semibold text-white mb-1.5">No expenses yet</div>
        <div
          className="text-[13px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Tap + to add the first expense
        </div>
      </div>
    );
  }

  // Group by date
  const grouped: {
    dateLabel: string;
    dateTotal: number;
    expenses: typeof group.expenses;
  }[] = [];
  const seen = new Map<string, number>();

  for (const expense of group.expenses) {
    const d = new Date(expense.expenseDate);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
    let label: string;
    if (diffDays === 0) label = "Today";
    else if (diffDays === 1) label = "Yesterday";
    else label = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

    const idx = seen.get(label);
    if (idx !== undefined) {
      grouped[idx].dateTotal += Number(expense.amount);
      grouped[idx].expenses.push(expense);
    } else {
      seen.set(label, grouped.length);
      grouped.push({
        dateLabel: label,
        dateTotal: Number(expense.amount),
        expenses: [expense],
      });
    }
  }

  return (
    <div style={{ paddingBottom: 8 }}>
      {grouped.map(({ dateLabel, dateTotal, expenses: dayExpenses }) => (
        <div key={dateLabel}>
          <div
            style={{
              padding: "4px 24px 8px",
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.1em",
              fontWeight: 500,
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{dateLabel}</span>
            <span style={{ fontFeatureSettings: "'tnum'" }}>
              ₹{dateTotal.toLocaleString("en-IN")}
            </span>
          </div>
          <div
            style={{
              padding: "0 14px",
              display: "flex",
              flexDirection: "column" as const,
              gap: 6,
              marginBottom: 16,
            }}
          >
            {dayExpenses.map((expense) => {
              const myShare = expense.shares.find((s) => s.userId === currentUser.id);
              const myShareAmt = myShare ? Number(myShare.amountOwed) : 0;
              const iPaid = expense.paidById === currentUser.id;
              const myNet = iPaid ? Number(expense.amount) - myShareAmt : -myShareAmt;
              return (
                <Link
                  key={expense.id}
                  href={`/groups/${group.id}/expenses/${expense.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
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
                    <ExpenseCategoryIcon category={expense.category} />
                    <div
                      style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#fff",
                          marginBottom: 1,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {expense.description}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
                        {expense.paidById === currentUser.id
                          ? "You paid"
                          : `${expense.paidBy.displayName} paid`}{" "}
                        · {expense.splitMethod === "EQUAL" ? "split equally" : "split"}
                      </div>
                    </div>
                    <div style={{ position: "relative", zIndex: 2, textAlign: "right" }}>
                      <div
                        style={{
                          fontSize: 15,
                          fontWeight: 600,
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
                      {myNet !== 0 && (
                        <div
                          style={{
                            fontSize: 11,
                            color: myNet > 0 ? "#30d158" : "#ff9f0a",
                            fontFeatureSettings: "'tnum'",
                          }}
                        >
                          {myNet > 0 ? "+" : "−"}₹
                          {Math.abs(myNet).toLocaleString("en-IN", {
                            maximumFractionDigits: 0,
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function ExpenseCategoryIcon({ category }: { category: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Food: {
      bg: "linear-gradient(135deg, rgba(255,215,10,0.35), rgba(255,215,10,0.18))",
      color: "#ffd60a",
    },
    Travel: {
      bg: "linear-gradient(135deg, rgba(255,159,10,0.4), rgba(255,159,10,0.2))",
      color: "#ffb340",
    },
    Rent: {
      bg: "linear-gradient(135deg, rgba(48,209,88,0.35), rgba(48,209,88,0.18))",
      color: "#30d158",
    },
    Entertainment: {
      bg: "linear-gradient(135deg, rgba(100,210,255,0.3), rgba(100,210,255,0.15))",
      color: "#64d2ff",
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
        width: 36,
        height: 36,
        borderRadius: 10,
        background: s.bg,
        color: s.color,
        boxShadow: `inset 0 0 0 0.5px ${s.color}40`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 2,
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
        width="18"
        height="18"
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

// ─── Activity Tab ─────────────────────────────────────────────────────────────

interface ActivityItem {
  type: string;
  actor: string;
  text: string;
  time: string;
  amount?: number;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function ActivityRow({ item }: { item: ActivityItem }) {
  const initial = (item.actor.trim()[0] ?? "?").toUpperCase();
  const gradients = [
    "linear-gradient(135deg, #ff9f0a, #c8740a)",
    "linear-gradient(135deg, #30d158, #1a8a3a)",
    "linear-gradient(135deg, #ff6482, #c84368)",
    "linear-gradient(135deg, #64d2ff, #3590bb)",
    "linear-gradient(135deg, #bf5af2, #8a3eb5)",
  ];
  const bg = gradients[initial.charCodeAt(0) % gradients.length];

  // Parse bold markers
  const parts = item.text.split(/\*\*(.*?)\*\*/g);

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "8px 0",
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 15,
          fontWeight: 600,
          color: "#fff",
          flexShrink: 0,
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
            background: "linear-gradient(180deg, rgba(255,255,255,0.2), transparent)",
            pointerEvents: "none",
          }}
        />
        <span style={{ position: "relative", zIndex: 2 }}>{initial}</span>
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div style={{ fontSize: 14, lineHeight: 1.4, color: "#fff" }}>
          <strong style={{ fontWeight: 600 }}>{item.actor}</strong>{" "}
          {parts.map((part, i) =>
            i % 2 === 1 ? (
              <strong key={i} style={{ fontWeight: 600 }}>
                {part}
              </strong>
            ) : (
              <span key={i}>{part}</span>
            ),
          )}
        </div>
        {item.type === "settled" && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            {timeAgo(item.time)} · via UPI
          </div>
        )}
        {item.type !== "settled" && (
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
            {timeAgo(item.time)}
          </div>
        )}
      </div>
    </div>
  );
}

function ActivityTab({ groupId }: { groupId: string }) {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/groups/${groupId}/activity`)
      .then((r) => r.json())
      .then((data) => {
        setItems(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [groupId]);

  if (loading)
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 0",
          color: "rgba(255,255,255,0.35)",
          fontSize: 14,
        }}
      >
        Loading…
      </div>
    );

  if (items.length === 0) {
    return (
      <div style={{ padding: "0 24px", position: "relative" }}>
        <div
          style={{
            position: "absolute",
            left: 39,
            top: 12,
            bottom: 12,
            width: 1,
            background: "rgba(255,255,255,0.08)",
          }}
        />
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
            No activity yet
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          left: 39,
          top: 12,
          bottom: 12,
          width: 1,
          background: "rgba(255,255,255,0.08)",
        }}
      />
      {items.map((item, i) => (
        <ActivityRow key={i} item={item} />
      ))}
    </div>
  );
}

// ─── Invite Sheet ─────────────────────────────────────────────────────────────

function InviteSheet({
  groupId,
  ghostUserId,
  ghostName,
  onClose,
}: {
  groupId: string;
  ghostUserId: string;
  ghostName: string;
  onClose: () => void;
}) {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(async () => {
    setState("loading");
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId, ghostUserId }),
      });
      const data = await res.json();
      setInviteUrl(data.url ?? "");
      setState("done");
    } catch {
      setState("idle");
    }
  }, [groupId, ghostUserId]);

  const copyLink = useCallback(async () => {
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [inviteUrl]);

  const shareLink = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join me on Pool",
        text: `${ghostName}, join my group on Pool to track shared expenses.`,
        url: inviteUrl,
      });
    } else {
      copyLink();
    }
  }, [inviteUrl, ghostName, copyLink]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[59]"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[60] anim-sheet"
        style={{
          background: "rgba(18,18,20,0.96)",
          backdropFilter: "blur(40px) saturate(180%)",
          borderRadius: "24px 24px 0 0",
          border: "0.5px solid rgba(255,255,255,0.1)",
          borderBottom: "none",
          paddingBottom: "env(safe-area-inset-bottom, 24px)",
        }}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: "rgba(255,255,255,0.2)" }}
          />
        </div>

        <div className="px-6 pt-4 pb-8">
          <div className="text-[17px] font-semibold text-white mb-1">
            Invite {ghostName}
          </div>
          <div className="text-[13px] mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
            Generate a link so {ghostName} can join and claim their account.
          </div>

          {state === "idle" && (
            <button
              onClick={generate}
              className="w-full py-3.5 rounded-[16px] text-[15px] font-semibold pool-press transition-all"
              style={{
                background: "rgba(255,255,255,0.92)",
                color: "#000",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.4)",
              }}
            >
              Generate invite link
            </button>
          )}

          {state === "loading" && (
            <div className="w-full py-3.5 rounded-[16px] flex items-center justify-center skeleton">
              <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                Generating…
              </div>
            </div>
          )}

          {state === "done" && (
            <div className="flex flex-col gap-3">
              {/* Link pill */}
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-[14px]"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "0.5px solid rgba(255,255,255,0.1)",
                }}
              >
                <div
                  className="flex-1 text-[12px] font-mono truncate"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {inviteUrl}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={copyLink}
                  className="flex-1 py-3.5 rounded-[16px] text-[15px] font-semibold pool-press transition-all"
                  style={{
                    background: copied ? "rgba(48,209,88,0.2)" : "rgba(255,255,255,0.1)",
                    color: copied ? "#30d158" : "rgba(255,255,255,0.9)",
                    border: `0.5px solid ${copied ? "rgba(48,209,88,0.3)" : "rgba(255,255,255,0.1)"}`,
                  }}
                >
                  {copied ? "Copied!" : "Copy link"}
                </button>
                <button
                  onClick={shareLink}
                  className="flex-1 py-3.5 rounded-[16px] text-[15px] font-semibold pool-press transition-all"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    color: "#000",
                    boxShadow:
                      "inset 0 1px 0 rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.4)",
                  }}
                >
                  Share
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
