"use client";

import Link from "next/link";
import { GlassCard } from "@/components/ui/glass-card";
import { GroupIcon } from "@/components/shared/group-icon";
import type { Group, GroupMember, User } from "@prisma/client";

interface GroupWithMembers extends Group {
  members: (GroupMember & { user: User })[];
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
}) {
  const isOwed = netBalance > 0;
  const isOwe = netBalance < 0;
  const settled = netBalance === 0;

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
              {group.members.length} people · {group.members.length} members
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
    <div className="text-center py-16 px-8 anim-fade">
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
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      </div>
      <div className="text-[17px] font-semibold text-white mb-1.5">No groups yet</div>
      <div
        className="text-[13px] leading-relaxed max-w-[240px] mx-auto"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        Create a group to start splitting expenses with friends.
      </div>
    </div>
  );
}
