"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [otpValue, setOtpValue] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otpError, setOtpError] = useState("");

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setEmailError("");
    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!res.ok) {
        setEmailError("Something went wrong. Try again.");
      } else {
        setStep("otp");
      }
    } catch {
      setEmailError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otpValue.trim()) return;
    setLoading(true);
    setOtpError("");
    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        otp: otpValue.trim().toLowerCase(),
        redirect: false,
        callbackUrl: "/onboarding/profile",
      });
      if (result?.error || !result?.ok) {
        setOtpError("Wrong code. Try again.");
        return;
      }
      window.location.href = "/onboarding/profile";
    } catch {
      setOtpError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (!email.trim()) return;
    setLoading(true);
    setOtpError("");
    try {
      await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
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
        {step === "otp" ? (
          /* ── Step 2: OTP entry ── */
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
              {/* Back button */}
              <button
                onClick={() => {
                  setStep("email");
                  setOtpValue("");
                  setOtpError("");
                }}
                style={{
                  alignSelf: "flex-start",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "none",
                  border: "none",
                  color: "#64d2ff",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
                Back
              </button>

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
                  Check your email
                </h1>
                <p
                  style={{
                    fontSize: 15,
                    color: "rgba(255,255,255,0.55)",
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  Enter the code we sent to{" "}
                  <span style={{ color: "#fff", fontWeight: 500 }}>{email}</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} style={{ width: "100%" }}>
                <div
                  style={{
                    fontSize: 12,
                    color: "rgba(255,255,255,0.4)",
                    marginBottom: 8,
                    paddingLeft: 4,
                  }}
                >
                  Sign-in code
                </div>
                <input
                  type="text"
                  placeholder="Enter code"
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  autoComplete="one-time-code"
                  autoFocus
                  required
                  style={{
                    width: "100%",
                    background: otpValue
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(255,255,255,0.05)",
                    border: `0.5px solid ${otpValue ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.1)"}`,
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    padding: "14px 16px",
                    color: "#fff",
                    fontSize: 22,
                    fontWeight: 600,
                    letterSpacing: "0.12em",
                    textAlign: "center",
                    fontFamily: "inherit",
                    outline: "none",
                    display: "block",
                    marginBottom: otpError ? 8 : 16,
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
                {otpError && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#ff453a",
                      marginBottom: 12,
                      paddingLeft: 4,
                    }}
                  >
                    {otpError}
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
                    marginBottom: 12,
                  }}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner />
                      Verifying…
                    </>
                  ) : (
                    "Verify"
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    color: loading ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.55)",
                    fontSize: 14,
                    fontWeight: 500,
                    fontFamily: "inherit",
                    cursor: loading ? "not-allowed" : "pointer",
                    padding: "8px 0",
                    textAlign: "center",
                  }}
                >
                  Resend code
                </button>
              </form>
            </div>
          </>
        ) : (
          /* ── Step 1: Email entry ── */
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

              <form onSubmit={handleEmailSubmit} style={{ width: "100%" }}>
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
                    marginBottom: emailError ? 8 : 16,
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
                {emailError && (
                  <div
                    style={{
                      fontSize: 12,
                      color: "#ff453a",
                      marginBottom: 12,
                      paddingLeft: 4,
                    }}
                  >
                    {emailError}
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
                      Sending…
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
              We&apos;ll email you a one-time code — no passwords.
            </p>
          </>
        )}
      </div>
    </div>
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
