"use client";

import Link from "next/link";
import { IconButton } from "@/components/ui/button";
import { SearchIcon, BellIcon } from "@/components/shared/icons";

interface HomeHeaderProps {
  userName: string;
  greeting: string;
  unreadCount?: number;
}

export function HomeHeader({ userName, greeting, unreadCount = 0 }: HomeHeaderProps) {
  const firstName = userName.split(" ")[0];

  return (
    <div className="flex justify-between items-center px-6 pt-6 pb-4 anim-fade">
      <div>
        <div
          className="text-xs font-medium mb-0.5"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {greeting}
        </div>
        <div className="text-[26px] font-semibold tracking-[-0.02em] text-white leading-tight">
          {firstName}
        </div>
      </div>
      <div className="flex gap-2">
        <Link href="/search">
          <IconButton aria-label="Search">
            <SearchIcon size={16} />
          </IconButton>
        </Link>
        <Link href="/notifications">
          <IconButton aria-label="Notifications" badge={unreadCount > 0}>
            <BellIcon size={16} />
          </IconButton>
        </Link>
      </div>
    </div>
  );
}
