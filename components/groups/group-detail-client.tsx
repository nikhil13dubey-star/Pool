"use client";

import { useState, useCallback } from "react";
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
        <Link href={`/groups/${group.id}/recycle-bin`}>
          <IconButton>
            <DotsVerticalIcon size={16} />
          </IconButton>
        </Link>
      </div>

      {/* Tab strip */}
      <div className="flex gap-0 px-6 pb-4">
        {(["overview", "expenses", "activity"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 py-2 text-[13px] font-medium capitalize pool-press transition-all duration-200 border-b-[1.5px]",
              tab === t ? "text-white border-white" : "border-transparent",
            )}
            style={tab !== t ? { color: "rgba(255,255,255,0.4)" } : undefined}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="px-3.5">
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
    <div className="flex flex-col gap-4">
      {/* Balance card */}
      {(owedEntries.length > 0 || oweEntries.length > 0) && (
        <GlassCard className="anim-slide-up">
          <div className="flex flex-col gap-3">
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
          <div className="mt-4 pt-3 border-t border-white/7">
            <Link href={`/groups/${group.id}/settle`}>
              <button
                className="w-full text-[15px] font-semibold py-2 rounded-[12px] pool-press transition-colors"
                style={{
                  background: "rgba(100,210,255,0.13)",
                  color: "#64d2ff",
                  border: "0.5px solid rgba(100,210,255,0.22)",
                }}
              >
                Settle up
              </button>
            </Link>
          </div>
        </GlassCard>
      )}

      {owedEntries.length === 0 && oweEntries.length === 0 && (
        <GlassCard className="anim-slide-up">
          <div
            className="text-center py-2 text-[14px] font-medium"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            ✓ All settled up in this group
          </div>
        </GlassCard>
      )}

      {/* Members */}
      <div>
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

  return (
    <div className="flex flex-col gap-2">
      {group.expenses.map((expense, i) => (
        <Link key={expense.id} href={`/groups/${group.id}/expenses/${expense.id}`}>
          <GlassCard
            className={cn("anim-slide-up")}
            style={{ animationDelay: `${i * 30}ms` } as React.CSSProperties}
          >
            <div className="flex items-center gap-3">
              <CategoryIcon category={expense.category} />
              <div className="flex-1 min-w-0">
                <div className="text-[15px] font-semibold text-white truncate mb-0.5">
                  {expense.description}
                </div>
                <div className="text-[12px]" style={{ color: "rgba(255,255,255,0.55)" }}>
                  Paid by{" "}
                  {expense.paidById === currentUser.id
                    ? "you"
                    : expense.paidBy.displayName}
                </div>
              </div>
              <div className="text-right">
                <div
                  className="text-[15px] font-semibold"
                  style={{ fontFeatureSettings: "'tnum'" }}
                >
                  ₹
                  {Number(expense.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </div>
                <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {expense.category}
                </div>
              </div>
            </div>
          </GlassCard>
        </Link>
      ))}
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const colorMap: Record<string, { bg: string; color: string }> = {
    Food: { bg: "rgba(255,159,10,0.2)", color: "#ffb340" },
    Travel: { bg: "rgba(100,210,255,0.2)", color: "#64d2ff" },
    Rent: { bg: "rgba(48,209,88,0.2)", color: "#30d158" },
    Entertainment: { bg: "rgba(191,90,242,0.2)", color: "#bf5af2" },
    Groceries: { bg: "rgba(48,209,88,0.2)", color: "#30d158" },
    Utilities: { bg: "rgba(100,210,255,0.2)", color: "#64d2ff" },
    Health: { bg: "rgba(255,69,58,0.2)", color: "#ff453a" },
    Shopping: { bg: "rgba(255,100,130,0.2)", color: "#ff6482" },
    Other: { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" },
  };
  const style = colorMap[category] ?? colorMap["Other"];

  return (
    <div
      className="w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 text-[17px]"
      style={{ background: style.bg, color: style.color }}
    >
      {categoryEmoji(category)}
    </div>
  );
}

function categoryEmoji(cat: string): string {
  const m: Record<string, string> = {
    Food: "🍽",
    Groceries: "🛒",
    Rent: "🏠",
    Utilities: "⚡️",
    Travel: "✈️",
    Entertainment: "🎬",
    Health: "💊",
    Shopping: "🛍",
    Other: "•",
  };
  return m[cat] ?? "•";
}

// ─── Activity Tab ─────────────────────────────────────────────────────────────

function ActivityTab({ groupId: _groupId }: { groupId: string }) {
  return (
    <div className="text-center py-16 anim-fade">
      <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.4)" }}>
        Activity will appear here
      </div>
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
