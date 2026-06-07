"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PinPad } from "@/components/ui/pin-pad";

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInInner />
    </Suspense>
  );
}

function SignInInner() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [step, setStep] = useState<"handle" | "pin">("handle");
  const [handle, setHandle] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onPin(v: string) {
    setPin(v);
    if (v.length !== 4) return;
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ handle: handle.trim(), pin: v }),
    });
    if (!res.ok) {
      setError("Wrong handle or PIN.");
      setPin("");
      setLoading(false);
      setTimeout(() => setError(""), 900);
      return;
    }
    router.replace(next);
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        padding: "8px 28px 40px",
      }}
    >
      <button
        onClick={() => (step === "handle" ? router.back() : setStep("handle"))}
        style={backBtn}
      >
        <svg
          width="22"
          height="22"
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

      {step === "handle" ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (handle.trim()) setStep("pin");
          }}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div>
            <h1 style={h1}>Welcome back</h1>
            <p style={sub}>Enter your handle to sign in on this device.</p>
          </div>
          <input
            className="input"
            autoFocus
            placeholder="your-handle"
            value={handle}
            onChange={(e) => setHandle(e.target.value.replace(/^@/, ""))}
            autoCapitalize="none"
          />
          <button type="submit" className="btn btn-primary" disabled={!handle.trim()}>
            Continue
          </button>
        </form>
      ) : (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 36,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h1 style={h1}>Enter your PIN</h1>
            <p style={{ ...sub, color: error ? "var(--neg)" : "var(--muted)" }}>
              {error || `Signing in as @${handle}`}
            </p>
          </div>
          <PinPad value={pin} onChange={onPin} error={!!error} />
          {loading && (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>Signing in…</p>
          )}
        </div>
      )}
    </div>
  );
}

const backBtn: React.CSSProperties = {
  width: 40,
  height: 40,
  display: "flex",
  alignItems: "center",
  background: "none",
  border: "none",
  cursor: "pointer",
  marginLeft: -8,
};
const h1: React.CSSProperties = {
  fontSize: 28,
  fontWeight: 700,
  letterSpacing: "-0.02em",
};
const sub: React.CSSProperties = {
  fontSize: 15,
  color: "var(--muted)",
  marginTop: 10,
  lineHeight: 1.5,
};
