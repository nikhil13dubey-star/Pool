"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Re-fetch server data when the tab regains focus/visibility, so a shared
// ledger edited by 4 people doesn't go stale. Throttled to once per 10s.
export function RefreshOnFocus() {
  const router = useRouter();
  const last = useRef(0);
  useEffect(() => {
    function maybe() {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - last.current < 30000) return;
      last.current = now;
      router.refresh();
    }
    document.addEventListener("visibilitychange", maybe);
    window.addEventListener("focus", maybe);
    return () => {
      document.removeEventListener("visibilitychange", maybe);
      window.removeEventListener("focus", maybe);
    };
  }, [router]);
  return null;
}
