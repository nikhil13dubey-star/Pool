"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SearchResult {
  id: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  groupId: string;
  groupName: string;
  paidByName: string;
  expenseDate: string;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  if (days < 60) return "last month";
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark
        style={{
          background: "rgba(255,255,255,0.2)",
          color: "#fff",
          padding: "0 2px",
          borderRadius: 2,
        }}
      >
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string>("all");

  const search = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => search(query), 250);
    return () => clearTimeout(timer);
  }, [query, search]);

  const groups = Array.from(new Set(results.map((r) => r.groupName)));
  const filtered =
    activeGroup === "all" ? results : results.filter((r) => r.groupName === activeGroup);

  return (
    <div style={{ minHeight: "100vh" }}>
      {/* Header */}
      <div
        style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 8 }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            fontSize: 15,
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          Cancel
        </button>
        <div
          style={{
            flex: 1,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            textAlign: "center",
            color: "#fff",
          }}
        >
          Search
        </div>
        <div style={{ width: 60 }} />
      </div>

      {/* Search input */}
      <div style={{ padding: "8px 24px 12px" }}>
        <div style={{ position: "relative" }}>
          <svg
            style={{
              position: "absolute",
              left: 14,
              top: "50%",
              transform: "translateY(-50%)",
              color: "rgba(255,255,255,0.35)",
              pointerEvents: "none",
            }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.5-4.5" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search expenses…"
            autoFocus
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.07)",
              border: "0.5px solid rgba(255,255,255,0.18)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              borderRadius: 14,
              padding: "12px 14px 12px 40px",
              color: "#fff",
              fontSize: 15,
              fontFamily: "inherit",
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.3)";
              e.target.style.background = "rgba(255,255,255,0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(255,255,255,0.18)";
              e.target.style.background = "rgba(255,255,255,0.07)";
            }}
          />
        </div>
      </div>

      {/* Filter pills */}
      {results.length > 0 && (
        <div
          style={{ padding: "4px 24px 16px", display: "flex", gap: 6, overflowX: "auto" }}
        >
          {["all", ...groups].map((g) => (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: "inherit",
                cursor: "pointer",
                whiteSpace: "nowrap",
                background:
                  activeGroup === g ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.06)",
                border:
                  activeGroup === g
                    ? "0.5px solid rgba(255,255,255,0.25)"
                    : "0.5px solid rgba(255,255,255,0.1)",
                color: activeGroup === g ? "#fff" : "rgba(255,255,255,0.55)",
              }}
            >
              {g === "all" ? "All" : g}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div style={{ paddingBottom: 100 }}>
        {loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 0",
              fontSize: 14,
              color: "rgba(255,255,255,0.35)",
            }}
          >
            Searching…
          </div>
        )}

        {!loading && query && filtered.length > 0 && (
          <>
            <div
              style={{
                padding: "4px 24px 8px",
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 500,
              }}
            >
              {filtered.length} {filtered.length === 1 ? "match" : "matches"}
            </div>
            <div
              style={{
                padding: "0 14px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {filtered.map((r) => (
                <Link
                  key={r.id}
                  href={`/groups/${r.groupId}/expenses/${r.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      padding: "12px 14px",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      background: "rgba(255,255,255,0.04)",
                      border: "0.5px solid rgba(255,255,255,0.08)",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                      borderRadius: 16,
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: "50%",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
                        pointerEvents: "none",
                      }}
                    />
                    <CategoryIcon category={r.category} />
                    <div
                      style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}
                    >
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: "#fff",
                          marginBottom: 2,
                        }}
                      >
                        {highlight(r.description, query)}
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
                        {r.groupName} · {timeAgo(r.expenseDate)}
                      </div>
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#fff",
                        fontFeatureSettings: "'tnum'",
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      ₹{r.amount.toLocaleString("en-IN")}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {!loading && query && filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <div
              style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 6 }}
            >
              No results
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}
            >
              No expenses matching &ldquo;{query}&rdquo;
            </div>
          </div>
        )}

        {!query && (
          <div style={{ textAlign: "center", padding: "60px 24px" }}>
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1.5"
              style={{ margin: "0 auto 16px", display: "block" }}
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M21 21l-4.5-4.5" />
            </svg>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.35)" }}>
              Type to search expenses
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryIcon({ category }: { category: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Food: { bg: "rgba(255,159,10,0.2)", color: "#ffb340" },
    Travel: { bg: "rgba(100,210,255,0.2)", color: "#64d2ff" },
    Rent: { bg: "rgba(48,209,88,0.2)", color: "#30d158" },
    Entertainment: { bg: "rgba(191,90,242,0.2)", color: "#bf5af2" },
    Groceries: { bg: "rgba(48,209,88,0.2)", color: "#30d158" },
    Utilities: { bg: "rgba(100,210,255,0.2)", color: "#64d2ff" },
    Health: { bg: "rgba(255,69,58,0.2)", color: "#ff453a" },
    Shopping: { bg: "rgba(255,100,130,0.2)", color: "#ff6482" },
    Other: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.55)" },
  };
  const s = map[category] ?? map.Other;
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        background: s.bg,
        color: s.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        position: "relative",
        zIndex: 2,
        boxShadow: `inset 0 0 0 0.5px ${s.color}40`,
      }}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="2" y="3" width="20" height="18" rx="2" />
        <path d="M2 9h20M9 21V9" />
      </svg>
    </div>
  );
}
