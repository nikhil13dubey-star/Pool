"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightIcon } from "@/components/shared/icons";

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

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background:
          "radial-gradient(ellipse 600px 800px at 50% 100%, #1a1a1a 0%, #050505 70%)",
      }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: "rgba(120,120,130,0.18)",
            filter: "blur(80px)",
            top: -100,
            left: -120,
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{
            background: "rgba(140,140,145,0.14)",
            filter: "blur(80px)",
            top: 220,
            right: -110,
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-1 px-7 pb-8">
        <div className="flex-1 flex flex-col justify-center gap-8">
          {/* Logo mark */}
          <div
            className="w-16 h-16 rounded-[22px] flex items-center justify-center relative overflow-hidden anim-scale-pop"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05))",
              border: "0.5px solid rgba(255,255,255,0.15)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.25)",
            }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-1/2 rounded-[22px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.15), transparent)",
              }}
            />
            <div
              className="w-9 h-9 rounded-full bg-white/95 relative z-10"
              style={{
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            />
          </div>

          {sent ? (
            <VerifyState email={email} />
          ) : (
            <>
              <div className="anim-slide-up">
                <h1
                  className="text-[36px] font-bold tracking-[-0.03em] leading-[1.05] mb-3"
                  style={{ letterSpacing: "-0.03em" }}
                >
                  Welcome to Pool.
                </h1>
                <p
                  className="text-[16px] leading-relaxed"
                  style={{ color: "rgba(255,255,255,0.55)" }}
                >
                  Split with friends. Settle in seconds.
                  <br />
                  No ads, no limits.
                </p>
              </div>

              <form
                onSubmit={handleSubmit}
                className="w-full anim-slide-up flex flex-col gap-4"
              >
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  label="Email address"
                  autoComplete="email"
                  autoFocus
                  required
                  focused={!!email}
                  error={error}
                />
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!email.trim()}
                  icon={!loading ? <ArrowRightIcon size={18} /> : undefined}
                >
                  {loading ? "Sending link…" : "Continue with email"}
                </Button>
              </form>
            </>
          )}
        </div>

        <p
          className="text-center text-[11px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          By continuing you agree to our Terms.
          <br />
          We&apos;ll email you a magic link — no passwords.
        </p>
      </div>
    </div>
  );
}

function VerifyState({ email }: { email: string }) {
  return (
    <div className="anim-scale-pop flex flex-col gap-4">
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, rgba(100,210,255,0.25), rgba(100,210,255,0.1))",
          border: "0.5px solid rgba(100,210,255,0.3)",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.15), 0 0 60px rgba(100,210,255,0.2)",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#64d2ff"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      </div>
      <div>
        <h2 className="text-[26px] font-bold tracking-tight leading-snug mb-2">
          Check your email
        </h2>
        <p
          className="text-[15px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          We sent a magic link to <span className="text-white font-medium">{email}</span>.
          <br />
          Click it to sign in — no password needed.
        </p>
      </div>
      <p className="text-[12px]" style={{ color: "rgba(255,255,255,0.4)" }}>
        Link expires in 10 minutes. Check spam if you don&apos;t see it.
      </p>
    </div>
  );
}
