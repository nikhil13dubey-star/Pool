"use client";

import type { ReactNode } from "react";

export function Loader({
  compact,
  icon,
  label,
}: {
  compact?: boolean;
  icon?: ReactNode;
  label?: string;
}) {
  const wrapStyle = compact ? { minHeight: 160 } : undefined;

  if (icon) {
    return (
      <div className="loader-wrap" style={wrapStyle}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 38,
            height: 38,
            color: "var(--accent)",
            filter: "drop-shadow(0 0 10px var(--brand-glow))",
            transformOrigin: "center",
            animation: "spin 1.1s linear infinite",
          }}
        >
          {icon}
        </span>
        {label ? <div className="loader-label">{label}</div> : null}
      </div>
    );
  }

  return (
    <div className="loader-wrap" style={wrapStyle}>
      <div className="loader">
        <i />
        <i />
        <i />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" className="loader-logo" />
      </div>
      <div className="loader-label">{label ?? "Loading…"}</div>
    </div>
  );
}
