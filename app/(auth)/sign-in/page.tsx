"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await signIn("resend", {
        email: email.trim().toLowerCase(),
        redirect: false,
        callbackUrl: "/onboarding/profile",
      });
      if (result?.error) {
        setError("Something went wrong. Try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await signIn("resend", {
        email: email.trim().toLowerCase(),
        redirect: false,
        callbackUrl: "/onboarding/profile",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        background:
          "radial-gradient(ellipse 600px 800px at 50% 100%, #1a1a1a 0%, #050505 70%)",
        position: "relative",
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "rgba(120,120,130,0.18)",
            filter: "blur(80px)",
            top: -100,
            left: -120,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "rgba(140,140,145,0.14)",
            filter: "blur(80px)",
            top: 220,
            right: -110,
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "0 28px 32px",
        }}
      >
        {sent ? (
          <MagicLinkSent email={email} onResend={handleResend} loading={loading} />
        ) : (
          <>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 32,
              }}
            >
              {/* Logo mark */}
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 22,
                  background:
                    "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
                  border: "0.5px solid rgba(255,255,255,0.15)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
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
                      "linear-gradient(180deg, rgba(255,255,255,0.15), transparent)",
                  }}
                />
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.95)",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "-8%",
                      width: "116%",
                      height: "45%",
                      background: "rgba(0,0,0,0.08)",
                      borderRadius: "50%",
                    }}
                  />
                </div>
              </div>

              <div>
                <h1
                  style={{
                    fontSize: 36,
                    fontWeight: 700,
                    letterSpacing: "-0.03em",
                    lineHeight: 1.05,
                    marginBottom: 12,
                    color: "#fff",
                  }}
                >
                  Welcome to Pool.
                </h1>
                <p
                  style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Split with friends. Settle in seconds. No ads, no limits.
                </p>
              </div>

              <form onSubmit={handleSubmit} style={{ width: "100%" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 8,
                    paddingLeft: 4,
                  }}
                >
                  Email address
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  autoFocus
                  required
                  style={{
                    width: "100%",
                    background: email
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.05)",
                    border: `0.5px solid ${email ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    color: "#fff",
                    fontSize: 15,
                    fontFamily: "inherit",
                    outline: "none",
                    display: "block",
                    marginBottom: error ? 8 : 16,
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "rgba(255,255,255,0.25)";
                    e.target.style.background = "rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    if (!e.target.value) {
                      e.target.style.borderColor = "rgba(255,255,255,0.1)";
                      e.target.style.background = "rgba(255,255,255,0.05)";
                    }
                  }}
                />
                {error && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#ff453a",
                      marginBottom: 12,
                      paddingLeft: 4,
                    }}
                  >
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%",
                    background: loading ? "rgba(255,255,255,0.1)" : "#fff",
                    color: loading ? "rgba(255,255,255,0.4)" : "#000",
                    fontSize: 16,
                    fontWeight: 600,
                    border: "none",
                    padding: 16,
                    borderRadius: 16,
                    fontFamily: "inherit",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    cursor: loading ? "not-allowed" : "pointer",
                    boxSizing: "border-box",
                  }}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Sending link…
                    </>
                  ) : (
                    <>
                      Continue with email
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M5 12h14M13 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>

            <p
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              By continuing you agree to our Terms.
              <br />
              We&apos;ll email you a magic link — no passwords.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function MagicLinkSent({
  email,
  onResend,
  loading,
}: {
  email: string;
  onResend: () => void;
  loading: boolean;
}) {
  return (
    <>
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          gap: 28,
        }}
      >
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 28,
            background: "rgba(255,255,255,0.05)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
              background: "linear-gradient(180deg, rgba(255,255,255,0.08), transparent)",
            }}
          />
          <svg
            width="36"
            height="36"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 7l9 6 9-6" />
          </svg>
        </div>

        <div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
              marginBottom: 12,
              color: "#fff",
            }}
          >
            Check your inbox
          </h1>
          <p
            style={{
              fontSize: 15,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            We sent a magic link to
            <br />
            <span style={{ color: "#fff", fontWeight: 500 }}>{email}</span>
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            background: "rgba(255,255,255,0.08)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            borderRadius: 999,
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          Link expires in 15 minutes
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <button
          onClick={onResend}
          disabled={loading}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.08)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
            color: "#fff",
            fontSize: 16,
            fontWeight: 600,
            padding: 16,
            borderRadius: 16,
            fontFamily: "inherit",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1,
            boxSizing: "border-box",
          }}
        >
          {loading ? "Sending…" : "Resend link"}
        </button>
        <p
          style={{
            fontSize: 12,
            color: "rgba(255,255,255,0.4)",
            textAlign: "center",
            margin: 0,
          }}
        >
          Didn&apos;t get it? Check your spam folder.
        </p>
      </div>
    </>
  );
}

function LoadingSpinner() {
  return (
    <svg
      style={{ animation: "spin 1s linear infinite" }}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeOpacity="0.3"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </svg>
  );
}
