"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PinPad } from "@/components/ui/pin-pad";

type Step = "name" | "pin" | "confirm";

export default function CreateAccountPage() {
  return (
    <Suspense fallback={null}>
      <CreateAccountInner />
    </Suspense>
  );
}

function CreateAccountInner() {
  const router = useRouter();
  const next = useSearchParams().get("next") || "/";
  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [userIdEdited, setUserIdEdited] = useState(false);
  const [editingId, setEditingId] = useState(false);
  const [idError, setIdError] = useState("");
  const [checking, setChecking] = useState(false);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function deriveId(full: string): string {
    return full
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((p) => p.replace(/[^a-z0-9]/g, ""))
      .filter(Boolean)
      .join(".");
  }

  function onName(v: string) {
    setName(v);
    if (!userIdEdited) setUserId(deriveId(v));
    setIdError("");
  }

  function onUserId(v: string) {
    setUserIdEdited(true);
    setUserId(v.toLowerCase().replace(/[^a-z0-9.]/g, ""));
    setIdError("");
  }

  async function nextFromName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || userId.length < 2) return;
    setChecking(true);
    setIdError("");
    try {
      const res = await fetch(
        `/api/auth/check-handle?handle=${encodeURIComponent(userId)}`,
      );
      const { available } = await res.json();
      if (!available) {
        setIdError("That user ID is taken — try another.");
        setEditingId(true);
        return;
      }
      setStep("pin");
    } finally {
      setChecking(false);
    }
  }

  function onPin(v: string) {
    setPin(v);
    if (v.length === 4) setTimeout(() => setStep("confirm"), 150);
  }

  async function onConfirm(v: string) {
    setConfirm(v);
    if (v.length !== 4) return;
    if (v !== pin) {
      setError("PINs didn't match. Try again.");
      setPin("");
      setConfirm("");
      setTimeout(() => {
        setError("");
        setStep("pin");
      }, 800);
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name.trim(), handle: userId, pin }),
    });
    if (!res.ok) {
      setError("Something went wrong. Try again.");
      setLoading(false);
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
        onClick={() => (step === "name" ? router.back() : setStep("name"))}
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

      {step === "name" && (
        <form
          onSubmit={nextFromName}
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 24,
          }}
        >
          <div>
            <h1 style={h1}>Your full name</h1>
            <p style={sub}>This is how friends will see you in groups.</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <input
              className="input"
              autoFocus
              placeholder="e.g. Nikhil Dubey"
              value={name}
              onChange={(e) => onName(e.target.value)}
              maxLength={40}
            />

            {/* auto-generated, tappable-to-edit User ID */}
            {userId && (
              <div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    margin: "0 0 6px 4px",
                    letterSpacing: ".02em",
                  }}
                >
                  YOUR USER ID
                </div>
                {editingId ? (
                  <input
                    className="input"
                    autoFocus
                    value={userId}
                    onChange={(e) => onUserId(e.target.value)}
                    onBlur={() => setEditingId(false)}
                    style={idError ? { borderColor: "var(--neg)" } : undefined}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditingId(true)}
                    className="card"
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "16px 18px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      border: "1px solid var(--stroke)",
                    }}
                  >
                    <span style={{ fontSize: 17, fontWeight: 600 }}>@{userId}</span>
                    <span style={{ fontSize: 14, color: "var(--accent)" }}>Edit</span>
                  </button>
                )}
                <p
                  style={{
                    fontSize: 13,
                    color: idError ? "var(--neg)" : "var(--muted)",
                    margin: "8px 0 0 4px",
                    lineHeight: 1.4,
                  }}
                >
                  {idError || "Friends can find & add you with this. Tap to change it."}
                </p>
              </div>
            )}
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!name.trim() || userId.length < 2 || checking}
            style={{ marginTop: 8 }}
          >
            {checking ? "Checking…" : "Continue"}
          </button>
        </form>
      )}

      {step === "pin" && (
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
            <h1 style={h1}>Set a 4-digit PIN</h1>
            <p style={sub}>You&apos;ll use it to sign in on a new phone.</p>
          </div>
          <PinPad value={pin} onChange={onPin} />
        </div>
      )}

      {step === "confirm" && (
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
            <h1 style={h1}>Confirm your PIN</h1>
            <p style={{ ...sub, color: error ? "var(--neg)" : "var(--muted)" }}>
              {error || "Enter it once more."}
            </p>
          </div>
          <PinPad value={confirm} onChange={onConfirm} error={!!error} />
          {loading && (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>
              Creating your account…
            </p>
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
