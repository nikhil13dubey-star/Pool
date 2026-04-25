"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Avatar } from "@/components/ui/avatar";
import { formatAmount } from "@/lib/shared/types";
import { cn } from "@/lib/client/utils";
import type { User } from "@prisma/client";

interface Friend {
  id: string;
  displayName: string;
  avatarColor: string | null;
  isGhost: boolean;
  upiId: string | null;
  owed: number;
  owes: number;
}

interface Props {
  currentUser: User;
  friends: Friend[];
}

export function FriendsClient({ friends }: Props) {
  const totalOwed = friends.reduce((s, f) => s + (f.owed ?? 0), 0);
  const totalOwes = friends.reduce((s, f) => s + (f.owes ?? 0), 0);
  const netFmt = formatAmount(Math.abs(totalOwed - totalOwes));
  const net = totalOwed - totalOwes;

  const withBalance = friends.filter((f) => (f.owed ?? 0) > 0 || (f.owes ?? 0) > 0);
  const settled = friends.filter((f) => (f.owed ?? 0) === 0 && (f.owes ?? 0) === 0);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-[60px] pb-4">
        <div className="text-[28px] font-bold tracking-[-0.03em] text-white">Friends</div>
      </div>

      {/* Net summary */}
      {friends.length > 0 && (
        <div className="px-4 mb-4 anim-slide-up">
          <GlassCard>
            <div className="flex items-center justify-between">
              <div>
                <div
                  className="text-[12px] font-medium mb-1"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                >
                  {net >= 0 ? "Overall you're owed" : "Overall you owe"}
                </div>
                <div
                  className="text-[28px] font-bold tracking-[-0.03em] leading-none"
                  style={{
                    color: net >= 0 ? "#30d158" : "#ff9f0a",
                    fontFeatureSettings: "'tnum'",
                  }}
                >
                  {net !== 0 && (net > 0 ? "+" : "−")}
                  {netFmt.symbol}
                  {netFmt.whole}
                  {netFmt.decimal}
                </div>
              </div>
              <div className="flex gap-4">
                <div className="text-right">
                  <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    You&apos;re owed
                  </div>
                  <div
                    className="text-[14px] font-semibold"
                    style={{ color: "#30d158", fontFeatureSettings: "'tnum'" }}
                  >
                    +₹{totalOwed.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                    You owe
                  </div>
                  <div
                    className="text-[14px] font-semibold"
                    style={{ color: "#ff9f0a", fontFeatureSettings: "'tnum'" }}
                  >
                    −₹{totalOwes.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="px-4 flex flex-col gap-4 pb-6">
        {friends.length === 0 && (
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
                stroke="rgba(255,255,255,0.55)"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="9" cy="7" r="4" />
                <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0-3-3.87" />
              </svg>
            </div>
            <div className="text-[17px] font-semibold text-white mb-1.5">
              No friends yet
            </div>
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              Add members to a group to see them here
            </div>
          </div>
        )}

        {withBalance.length > 0 && (
          <div>
            <div
              className="text-[11px] font-medium uppercase tracking-[0.1em] px-1 mb-3"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Pending · {withBalance.length}
            </div>
            <GlassCard noPadding>
              {withBalance.map((friend, i) => (
                <FriendRow
                  key={friend.id}
                  friend={friend}
                  isLast={i === withBalance.length - 1}
                  index={i}
                />
              ))}
            </GlassCard>
          </div>
        )}

        {settled.length > 0 && (
          <div>
            <div
              className="text-[11px] font-medium uppercase tracking-[0.1em] px-1 mb-3"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Settled up · {settled.length}
            </div>
            <GlassCard noPadding>
              {settled.map((friend, i) => (
                <FriendRow
                  key={friend.id}
                  friend={friend}
                  isLast={i === settled.length - 1}
                  index={withBalance.length + i}
                />
              ))}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}

function FriendRow({
  friend,
  isLast,
  index,
}: {
  friend: Friend;
  isLast: boolean;
  index: number;
}) {
  const net = (friend.owed ?? 0) - (friend.owes ?? 0);
  const netFmt = formatAmount(Math.abs(net));
  const isSettled = net === 0;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 anim-slide-up",
        !isLast && "border-b border-white/7",
      )}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <Avatar name={friend.displayName} size="md" />
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-white truncate">
          {friend.displayName}
        </div>
        {friend.isGhost && (
          <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            Invite pending
          </div>
        )}
      </div>
      {isSettled ? (
        <div
          className="text-[12px] font-medium"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Settled
        </div>
      ) : (
        <div className="text-right">
          <div
            className="text-[15px] font-semibold"
            style={{
              color: net > 0 ? "#30d158" : "#ff9f0a",
              fontFeatureSettings: "'tnum'",
            }}
          >
            {net > 0 ? "+" : "−"}
            {netFmt.symbol}
            {netFmt.whole}
            {netFmt.decimal}
          </div>
          <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
            {net > 0 ? "owes you" : "you owe"}
          </div>
        </div>
      )}
    </div>
  );
}
