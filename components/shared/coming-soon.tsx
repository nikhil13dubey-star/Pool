"use client";

import { useRouter } from "next/navigation";

export function ComingSoon({ title, note }: { title: string; note: string }) {
  const router = useRouter();
  return (
    <div style={{ minHeight: "100svh", padding: "16px 0 130px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 18px",
          minHeight: 44,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>
      <div style={{ textAlign: "center", padding: "80px 30px", color: "var(--muted)" }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)" }}>{title}</div>
        <div style={{ fontSize: 14, marginTop: 8, lineHeight: 1.5 }}>{note}</div>
      </div>
    </div>
  );
}
