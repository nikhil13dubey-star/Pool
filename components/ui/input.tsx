"use client";

import { cn } from "@/lib/client/utils";
import { forwardRef, type InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  focused?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, focused, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <div className="text-xs text-white/40 mb-2 pl-1">{label}</div>}
        <input
          ref={ref}
          {...props}
          className={cn(
            "w-full rounded-[16px] px-4 py-3.5 text-[15px] text-white",
            "bg-white/5 backdrop-blur-[30px]",
            "border border-white/10",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
            "outline-none placeholder:text-white/40",
            "transition-all duration-200",
            focused && "border-white/25 bg-white/8",
            "focus:border-white/25 focus:bg-white/8",
            error && "border-[#ff453a]/50",
            className,
          )}
        />
        {error && <div className="text-xs text-[#ff453a] mt-1.5 pl-1">{error}</div>}
      </div>
    );
  },
);
Input.displayName = "Input";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <div className="text-xs text-white/40 mb-2 pl-1">{label}</div>}
        <textarea
          ref={ref}
          {...props}
          className={cn(
            "w-full rounded-[16px] px-4 py-3.5 text-[15px] text-white resize-none",
            "bg-white/5 backdrop-blur-[30px]",
            "border border-white/10",
            "shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
            "outline-none placeholder:text-white/40",
            "transition-all duration-200",
            "focus:border-white/25 focus:bg-white/8",
            error && "border-[#ff453a]/50",
            className,
          )}
        />
        {error && <div className="text-xs text-[#ff453a] mt-1.5 pl-1">{error}</div>}
      </div>
    );
  },
);
Textarea.displayName = "Textarea";
