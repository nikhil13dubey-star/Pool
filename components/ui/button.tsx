"use client";

import { cn } from "@/lib/client/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "lg",
  loading,
  icon,
  children,
  className,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      style={
        variant === "secondary"
          ? { border: "0.5px solid rgba(255,255,255,0.1)", ...style }
          : style
      }
      className={cn(
        "relative flex items-center justify-center gap-2 font-semibold rounded-[16px] transition-all duration-150",
        "pool-press select-none",

        // Size
        size === "lg" && "w-full py-4 text-base",
        size === "md" && "px-5 py-2.5 text-sm",
        size === "sm" && "px-4 py-1.5 text-xs",

        // Variant
        variant === "primary" && [
          "bg-white text-black",
          "shadow-[inset_0_1px_0_rgba(255,255,255,1),0_2px_8px_rgba(0,0,0,0.3)]",
          isDisabled && "bg-white/10 text-white/40 shadow-none",
          !isDisabled && "hover:bg-white/95",
        ],
        variant === "secondary" && [
          "bg-white/8 text-white",
          "backdrop-blur-[30px]",
          "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
          isDisabled && "opacity-50",
        ],
        variant === "ghost" && [
          "text-white/55 hover:text-white",
          isDisabled && "opacity-40",
        ],
        variant === "danger" && ["text-[#ff453a]", isDisabled && "opacity-40"],

        className,
      )}
    >
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {icon}
          {children}
        </>
      )}
    </button>
  );
}

function LoadingSpinner() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

// Icon-only glass pill button (header actions, notification bell)
interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  badge?: boolean;
  children: ReactNode;
  className?: string;
}

export function IconButton({
  badge,
  children,
  className,
  style,
  ...props
}: IconButtonProps) {
  return (
    <button
      {...props}
      style={{ border: "0.5px solid rgba(255,255,255,0.1)", ...style }}
      className={cn(
        "relative w-[38px] h-[38px] rounded-full flex items-center justify-center",
        "bg-white/8 backdrop-blur-[30px]",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
        "pool-press text-white",
        className,
      )}
    >
      {children}
      {badge && (
        <span className="absolute top-[7px] right-[7px] w-2 h-2 rounded-full bg-[#ff453a] ring-2 ring-black/30 anim-pulse-dot" />
      )}
    </button>
  );
}
