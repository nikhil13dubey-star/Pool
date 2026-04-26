"use client";

import { use, useEffect } from "react";

export default function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string; email?: string; callbackUrl?: string }>;
}) {
  const { token, email, callbackUrl = "/" } = use(searchParams);
  const isValid = Boolean(token && email);

  useEffect(() => {
    if (!isValid) return;
    // Client-side redirect — email scanners don't execute JS so they can't
    // consume the one-time token before the user taps it.
    window.location.replace(
      `/api/auth/callback/resend` +
        `?token=${encodeURIComponent(token!)}` +
        `&email=${encodeURIComponent(email!)}` +
        `&callbackUrl=${encodeURIComponent(callbackUrl)}`,
    );
  }, [isValid, token, email, callbackUrl]);

  if (!isValid) {
    return (
      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          padding: "0 24px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 8 }}>
          Invalid link
        </div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 24 }}>
          This sign-in link is missing required parameters.
        </div>
        <a
          href="/sign-in"
          style={{
            fontSize: 15,
            fontWeight: 600,
            color: "#64d2ff",
            textDecoration: "none",
          }}
        >
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#0a0a0a",
        gap: 16,
      }}
    >
      <svg
        style={{ animation: "spin 0.9s linear infinite" }}
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth="2.5"
        />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke="rgba(255,255,255,0.8)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </svg>
      <div style={{ fontSize: 15, color: "rgba(255,255,255,0.55)" }}>Signing you in…</div>
    </div>
  );
}
