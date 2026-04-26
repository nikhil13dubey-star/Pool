"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GroupIcon } from "@/components/shared/group-icon";
import type { Group, GroupMember, User } from "@prisma/client";

interface GroupWithMembers extends Group {
  members: (GroupMember & { user: User })[];
  _count?: { expenses: number };
}

interface GroupListProps {
  groups: { group: GroupWithMembers; netBalance: number }[];
  currentUserId: string;
}

export function GroupList({ groups }: GroupListProps) {
  return (
    <div>
      <div className="flex justify-between items-center px-6 pb-3">
        <span className="text-[20px] font-semibold tracking-[-0.02em] text-white">
          Groups
        </span>
        <Link
          href="/groups"
          className="text-[14px] font-medium transition-opacity hover:opacity-70"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          See all
        </Link>
      </div>

      <div className="px-3.5 flex flex-col gap-2">
        {groups.length === 0 ? (
          <EmptyGroups />
        ) : (
          groups.map(({ group, netBalance }, i) => (
            <GroupCard
              key={group.id}
              group={group}
              netBalance={netBalance}
              animIndex={i}
            />
          ))
        )}
      </div>
    </div>
  );
}

function GroupCard({
  group,
  netBalance,
  animIndex,
}: {
  group: GroupWithMembers;
  netBalance: number;
  animIndex: number;
  expenseCount?: number;
}) {
  const isOwed = netBalance > 0;
  const isOwe = netBalance < 0;
  const settled = netBalance === 0;
  const expenseCount = group._count?.expenses ?? 0;

  return (
    <Link href={`/groups/${group.id}`}>
      <GlassCard
        className="anim-slide-up"
        style={{ animationDelay: `${animIndex * 40}ms` } as React.CSSProperties}
      >
        <div className="flex items-center gap-3">
          <GroupIcon type={group.type as "TRIP" | "HOME" | "COUPLE" | "OTHER"} />
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold tracking-[-0.01em] text-white mb-0.5 truncate">
              {group.name}
            </div>
            <div className="text-xs" style={{ color: "rgba(255,255,255,0.55)" }}>
              {group.members.length} {group.members.length === 1 ? "person" : "people"} ·{" "}
              {expenseCount} {expenseCount === 1 ? "expense" : "expenses"}
            </div>
          </div>
          {!settled && (
            <div
              className="text-[15px] font-semibold tabular-nums"
              style={{
                color: isOwed ? "#30d158" : isOwe ? "#ff9f0a" : undefined,
                fontFeatureSettings: "'tnum'",
              }}
            >
              {isOwed ? "+" : "−"}₹
              {Math.abs(netBalance).toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </div>
          )}
          {settled && (
            <div
              className="text-xs font-medium"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              Settled
            </div>
          )}
        </div>
      </GlassCard>
    </Link>
  );
}

function EmptyGroups() {
  return (
    <div className="anim-fade">
      {/* Main empty card */}
      <div
        className="text-center mb-4 rounded-[20px]"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "0.5px solid rgba(255,255,255,0.08)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          padding: "40px 24px",
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
            background: "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 2 }}>
          <div
            className="mx-auto mb-4 flex items-center justify-center"
            style={{
              width: 56,
              height: 56,
              borderRadius: 18,
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="text-[16px] font-semibold text-white mb-1">No groups yet</div>
          <div
            className="text-[13px] leading-relaxed mb-5 mx-auto"
            style={{ color: "rgba(255,255,255,0.55)", maxWidth: 220 }}
          >
            Start a group with your friends, family, or roommates.
          </div>
          <Link href="/groups/new">
            <button
              className="pool-press rounded-[14px] text-[14px] font-semibold text-black mx-auto block"
              style={{
                background: "rgba(255,255,255,0.92)",
                padding: "10px 24px",
                border: "none",
                fontFamily: "inherit",
                cursor: "pointer",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,1), 0 4px 12px rgba(0,0,0,0.3)",
              }}
            >
              + Start a group
            </button>
          </Link>
        </div>
      </div>

      {/* Quick type grid */}
      <div className="grid grid-cols-2 gap-2">
        {quickTypes.map(({ type, label, href, icon }) => (
          <Link key={type} href={href}>
            <div
              className="text-center pool-press rounded-[16px]"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.07)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
                padding: 14,
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
                    "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 2 }}>
                <div
                  className="mx-auto mb-2.5 flex items-center justify-center"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    background: icon.bg,
                    color: icon.color,
                    boxShadow: `inset 0 0 0 0.5px ${icon.color}40`,
                  }}
                >
                  {icon.svg}
                </div>
                <div className="text-[13px] font-semibold text-white">{label}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

const quickTypes = [
  {
    type: "TRIP",
    label: "Trip",
    href: "/groups/new?type=TRIP",
    icon: {
      bg: "rgba(100,210,255,0.2)",
      color: "#64d2ff",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      ),
    },
  },
  {
    type: "HOME",
    label: "Home",
    href: "/groups/new?type=HOME",
    icon: {
      bg: "rgba(48,209,88,0.2)",
      color: "#30d158",
      svg: (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
  },
];
