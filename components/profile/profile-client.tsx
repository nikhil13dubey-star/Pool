"use client";
import { useState } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAvatarColor } from "@/lib/shared/types";
import type { User } from "@prisma/client";

export function ProfileClient({ user }: { user: User }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [upiId, setUpiId] = useState(user.upiId ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const initial = (
    (editing ? displayName : user.displayName).trim()[0] ?? "?"
  ).toUpperCase();
  const avatarBg = getAvatarColor((editing ? displayName : user.displayName) || "?");

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/me/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName: displayName.trim(),
          upiId: upiId.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed");
      setEditing(false);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const fieldRow: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "14px 0",
    borderBottom: "0.5px solid rgba(255,255,255,0.07)",
    position: "relative",
    zIndex: 2,
  };
  const chevron = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.35)"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
  const fieldIcon = (svg: React.ReactNode) => (
    <div
      style={{
        width: 32,
        height: 32,
        borderRadius: 10,
        background: "rgba(255,255,255,0.07)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.55)",
        flexShrink: 0,
      }}
    >
      {svg}
    </div>
  );
  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    border: "0.5px solid rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: "12px 14px",
    color: "#fff",
    fontSize: 15,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
      {/* Header */}
      <div
        style={{
          padding: "24px 24px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#fff",
          }}
        >
          Profile
        </div>
        {editing ? (
          <button
            onClick={() => {
              setEditing(false);
              setDisplayName(user.displayName);
              setUpiId(user.upiId ?? "");
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.55)",
              fontSize: 15,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={() => setEditing(true)}
            style={{
              background: "none",
              border: "none",
              color: "#64d2ff",
              fontSize: 15,
              fontWeight: 500,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Edit
          </button>
        )}
      </div>

      <div style={{ padding: "16px 24px 32px" }}>
        {/* User card */}
        <div
          style={{
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(30px)",
            border: "0.5px solid rgba(255,255,255,0.07)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            borderRadius: 20,
            padding: 20,
            marginBottom: 24,
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
              background: "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: avatarBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 22,
                fontWeight: 600,
                color: "#fff",
                flexShrink: 0,
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
                    "linear-gradient(180deg, rgba(255,255,255,0.2), transparent)",
                  pointerEvents: "none",
                }}
              />
              <span style={{ position: "relative", zIndex: 2 }}>{initial}</span>
            </div>
            <div style={{ flex: 1 }}>
              {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        marginBottom: 4,
                      }}
                    >
                      Display name
                    </div>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                      autoFocus
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        marginBottom: 4,
                      }}
                    >
                      UPI ID{" "}
                      <span style={{ color: "rgba(255,255,255,0.3)" }}>(optional)</span>
                    </div>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@okbank"
                      style={inputStyle}
                    />
                  </div>
                  {error && <div style={{ fontSize: 12, color: "#ff453a" }}>{error}</div>}
                  <button
                    onClick={handleSave}
                    disabled={saving || !displayName.trim()}
                    style={{
                      background:
                        saving || !displayName.trim() ? "rgba(255,255,255,0.1)" : "#fff",
                      color:
                        saving || !displayName.trim() ? "rgba(255,255,255,0.4)" : "#000",
                      border: "none",
                      borderRadius: 12,
                      padding: "10px 16px",
                      fontSize: 15,
                      fontWeight: 600,
                      fontFamily: "inherit",
                      cursor: saving || !displayName.trim() ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                      color: "#fff",
                    }}
                  >
                    {user.displayName}
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                    {user.email}
                  </div>
                  {user.upiId && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.4)",
                        marginTop: 4,
                      }}
                    >
                      UPI: {user.upiId}
                    </div>
                  )}
                </>
              )}
            </div>
            {!editing && chevron}
          </div>
        </div>

        {/* Preferences */}
        <SectionLabel>Preferences</SectionLabel>
        <SettingsCard style={{ marginBottom: 20 }}>
          <div style={{ ...fieldRow }}>
            {fieldIcon(
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>,
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                Appearance
              </div>
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginRight: 6 }}
            >
              Dark
            </div>
            {chevron}
          </div>
          <div style={{ ...fieldRow }}>
            {fieldIcon(
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M2 12h20" />
              </svg>,
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                Default currency
              </div>
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginRight: 6 }}
            >
              ₹ INR
            </div>
            {chevron}
          </div>
          <div style={{ ...fieldRow, borderBottom: "none" }}>
            {fieldIcon(
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              </svg>,
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                Notifications
              </div>
            </div>
            {chevron}
          </div>
        </SettingsCard>

        {/* Data */}
        <SectionLabel>Data</SectionLabel>
        <SettingsCard style={{ marginBottom: 20 }}>
          <div style={{ ...fieldRow }}>
            {fieldIcon(
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
              </svg>,
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                Export my data
              </div>
            </div>
            {chevron}
          </div>
          <div style={{ ...fieldRow, borderBottom: "none" }}>
            {fieldIcon(
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                width="16"
                height="16"
              >
                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
              </svg>,
            )}
            <Link href="/recycle-bin" style={{ flex: 1, textDecoration: "none" }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                Recently deleted
              </div>
            </Link>
            {chevron}
          </div>
        </SettingsCard>

        {/* About */}
        <SettingsCard style={{ marginBottom: 20 }}>
          <div style={{ ...fieldRow, borderBottom: "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                About Pool
              </div>
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginRight: 6 }}>
              v1.0
            </div>
            {chevron}
          </div>
        </SettingsCard>

        {/* Sign out */}
        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(30px)",
            border: "0.5px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
            borderRadius: 16,
            padding: 16,
            fontSize: 16,
            fontWeight: 600,
            color: "#ff453a",
            fontFamily: "inherit",
            cursor: "pointer",
          }}
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: "rgba(255,255,255,0.4)",
        textTransform: "uppercase" as const,
        letterSpacing: "0.1em",
        fontWeight: 500,
        padding: "0 4px 8px",
      }}
    >
      {children}
    </div>
  );
}

function SettingsCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        backdropFilter: "blur(30px)",
        border: "0.5px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
        borderRadius: 16,
        padding: "0 16px",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
          pointerEvents: "none",
        }}
      />
      {children}
    </div>
  );
}
