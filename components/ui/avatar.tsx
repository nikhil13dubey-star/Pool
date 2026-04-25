"use client";

import { getAvatarColor, getInitials } from "@/lib/shared/types";
import { cn } from "@/lib/client/utils";

const sizeMap = {
  sm: "w-8 h-8 text-[13px]",
  md: "w-10 h-10 text-[15px]",
  lg: "w-14 h-14 text-[22px]",
  xl: "w-20 h-20 text-[30px]",
};

interface AvatarProps {
  name: string;
  size?: keyof typeof sizeMap;
  className?: string;
  border?: boolean;
}

export function Avatar({ name, size = "sm", className, border }: AvatarProps) {
  const gradient = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={cn(
        "relative flex items-center justify-center rounded-full flex-shrink-0 font-semibold text-white overflow-hidden pool-press",
        sizeMap[size],
        border && "ring-2 ring-black/40",
        className,
      )}
      style={{ background: gradient }}
    >
      {/* Top shine */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-full"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.2), transparent)",
        }}
      />
      <span className="relative z-10 leading-none">{initials}</span>
    </div>
  );
}
