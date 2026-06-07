"use client";

import { useEffect, useState } from "react";

const MESSAGES = [
  "Splitting the bill…",
  "Doing the math…",
  "Tallying it up…",
  "Counting the chai ☕",
  "Balancing the books…",
  "Settling the score…",
  "Crunching receipts…",
  "Who owes who…",
];

export function Loader({ compact }: { compact?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((p) => (p + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="loader-wrap" style={compact ? { minHeight: 160 } : undefined}>
      <div className="loader">
        <i />
        <i />
        <i />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.png" alt="" className="loader-logo" />
      </div>
      <div className="loader-label" key={i}>
        {MESSAGES[i]}
      </div>
    </div>
  );
}
