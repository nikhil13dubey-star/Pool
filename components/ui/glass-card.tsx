import type React from "react";
import { cn } from "@/lib/client/utils";
import type { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  as?: "div" | "button" | "li";
  noPadding?: boolean;
}

export function GlassCard({
  children,
  className,
  style,
  onClick,
  as: Tag = "div",
  noPadding,
}: GlassCardProps) {
  return (
    <Tag
      onClick={onClick}
      style={{
        border: "0.5px solid rgba(255,255,255,0.07)",
        ...style,
      }}
      className={cn(
        "relative overflow-hidden rounded-[20px]",
        "bg-white/5 backdrop-blur-[30px] saturate-[180%]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_1px_0_rgba(0,0,0,0.2)]",
        !noPadding && "p-4",
        onClick && "pool-press cursor-pointer",
        className,
      )}
    >
      {/* Top gloss */}
      <div
        className="absolute top-0 left-0 right-0 h-1/2 rounded-[20px] pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </Tag>
  );
}
