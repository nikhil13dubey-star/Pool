"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getAvatarColor } from "@/lib/shared/types";

function emailToDefaultName(email: string): string {
  const local = email.split("@")[0] ?? "";
  return local
    .replace(/[._-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function ProfileSetupClient({ email }: { email: string }) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(emailToDefaultName(email));
  const [upiId, setUpiId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initial = (displayName.trim()[0] ?? "?").toUpperCase();
  const avatarGradient = getAvatarColor(displayName || "?");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!displayName.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          ...(upiId.trim() && { upiId: upiId.trim() }),
        }),
      });
      if (!res.ok) throw new Error("Failed");
      router.push("/");
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.05)",
    border: "0.5px solid rgba(255,255,255,0.1)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: "14px 16px",
    color: "#fff",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    display: "block",
    boxSizing: "border-box",
  };

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
        style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none" }}
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
          padding: "24px 28px 32px",
          flex: 1,
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.3)",
            marginBottom: 4,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}
        >
          Step 1 of 1
        </div>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            marginBottom: 8,
            color: "#fff",
          }}
        >
          Tell us about you.
        </h1>
        <p
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.55)",
            lineHeight: 1.5,
            marginBottom: 32,
            margin: "0 0 32px",
          }}
        >
          This is how you&apos;ll show up in groups.
        </p>

        {/* Avatar preview */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: avatarGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              fontWeight: 600,
              color: "#fff",
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
                background: "linear-gradient(180deg, rgba(255,255,255,0.2), transparent)",
                pointerEvents: "none",
              }}
            />
            <span style={{ position: "relative", zIndex: 2 }}>{initial}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Display name */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Display name
            </div>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              required
              autoFocus
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.25)";
                e.target.style.background = "rgba(255,255,255,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                e.target.style.background = "rgba(255,255,255,0.05)";
              }}
            />
          </div>

          {/* UPI ID */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              UPI ID{" "}
              <span style={{ color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                (optional)
              </span>
            </div>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@okbank"
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.25)";
                e.target.style.background = "rgba(255,255,255,0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.1)";
                e.target.style.background = "rgba(255,255,255,0.05)";
              }}
            />
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.4)",
                marginTop: 6,
                paddingLeft: 4,
              }}
            >
              Friends can settle up by tapping pay — opens GPay or PhonePe.
            </div>
          </div>

          {/* Default currency — INR only for now */}
          <div style={{ marginBottom: 32 }}>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                marginBottom: 8,
                paddingLeft: 4,
              }}
            >
              Default currency
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "0.5px solid rgba(255,255,255,0.1)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                borderRadius: 16,
                padding: "14px 16px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                color: "#fff",
                fontSize: 15,
                position: "relative",
              }}
            >
              <span>₹ Indian Rupee (INR)</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {error && (
            <div
              style={{ fontSize: 12, color: "#ff453a", marginBottom: 12, paddingLeft: 4 }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !displayName.trim()}
            style={{
              width: "100%",
              background:
                loading || !displayName.trim() ? "rgba(255,255,255,0.1)" : "#fff",
              color: loading || !displayName.trim() ? "rgba(255,255,255,0.4)" : "#000",
              fontSize: 16,
              fontWeight: 600,
              border: "none",
              padding: 16,
              borderRadius: 16,
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: loading || !displayName.trim() ? "not-allowed" : "pointer",
              boxSizing: "border-box",
            }}
          >
            {loading ? "Saving…" : "Get started"}
          </button>
        </form>
      </div>
    </div>
  );
}
