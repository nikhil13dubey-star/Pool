"use client";

import { formatAmount } from "@/lib/shared/types";

interface BalanceHeroProps {
  netOwed: number;
  netOwe: number;
}

export function BalanceHero({ netOwed, netOwe }: BalanceHeroProps) {
  const net = netOwed - netOwe;
  const isPositive = net >= 0;
  const display = formatAmount(Math.abs(net));

  return (
    <div className="px-6 pt-4 pb-7 anim-slide-up">
      <div
        className="text-xs font-medium mb-1.5"
        style={{ color: "rgba(255,255,255,0.55)" }}
      >
        {isPositive ? "You're owed overall" : "You owe overall"}
      </div>

      {/* Big balance number */}
      <div
        className="flex items-baseline mb-4 leading-none anim-count"
        style={{ fontFeatureSettings: "'tnum'" }}
      >
        <span
          className="text-[28px] font-semibold mr-1"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {display.symbol}
        </span>
        <span className="text-[56px] font-bold tracking-[-0.04em] text-white">
          {display.whole}
        </span>
        {display.decimal && (
          <span
            className="text-[28px] font-semibold"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {display.decimal}
          </span>
        )}
      </div>

      {/* Owed / Owe pills */}
      <div className="flex gap-2">
        {netOwed > 0 && (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(48,209,88,0.13)",
              border: "0.5px solid rgba(48,209,88,0.22)",
              color: "#30d158",
              fontFeatureSettings: "'tnum'",
            }}
          >
            <ArrowUpRight />₹{Math.round(netOwed).toLocaleString("en-IN")}
          </span>
        )}
        {netOwe > 0 && (
          <span
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,159,10,0.13)",
              border: "0.5px solid rgba(255,159,10,0.22)",
              color: "#ff9f0a",
              fontFeatureSettings: "'tnum'",
            }}
          >
            <ArrowDownLeft />₹{Math.round(netOwe).toLocaleString("en-IN")}
          </span>
        )}
        {netOwed === 0 && netOwe === 0 && (
          <span
            className="px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "0.5px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.55)",
            }}
          >
            All settled up ✓
          </span>
        )}
      </div>
    </div>
  );
}

function ArrowUpRight() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M7 17L17 7M17 7H8M17 7V16" />
    </svg>
  );
}

function ArrowDownLeft() {
  return (
    <svg
      width="11"
      height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
    >
      <path d="M17 7L7 17M7 17H16M7 17V8" />
    </svg>
  );
}
