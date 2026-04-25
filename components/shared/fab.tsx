"use client";

import { PlusIcon } from "./icons";
import { cn } from "@/lib/client/utils";

interface FabProps {
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function Fab({ onClick, className }: FabProps) {
  return (
    <button
      onClick={onClick}
      aria-label="Add expense"
      className={cn(
        "absolute bottom-[84px] right-[22px] z-[49]",
        "w-[52px] h-[52px] rounded-full",
        "flex items-center justify-center",
        "text-black bg-white/92",
        "border border-white/40",
        "shadow-[inset_0_1px_0_rgba(255,255,255,1),0_8px_32px_rgba(0,0,0,0.5)]",
        "pool-press",
        className,
      )}
    >
      <PlusIcon size={22} />
    </button>
  );
}
