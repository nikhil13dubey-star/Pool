"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Avatar } from "@/components/ui/avatar";
import { GlassCard } from "@/components/ui/glass-card";
import type { User } from "@prisma/client";

interface Props {
  user: User;
}

export function ProfileClient({ user }: Props) {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [upiId, setUpiId] = useState(user.upiId ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isDirty = displayName !== user.displayName || upiId !== (user.upiId ?? "");

  async function handleSave() {
    if (!displayName.trim()) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: displayName.trim(),
        upiId: upiId.trim() || null,
      }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="px-5 pt-[60px] pb-4">
        <div className="text-[28px] font-bold tracking-[-0.03em] text-white">Profile</div>
      </div>

      <div className="px-4 flex flex-col gap-4 pb-10">
        {/* Avatar + name hero */}
        <div className="flex flex-col items-center py-6 gap-3 anim-slide-up">
          <Avatar name={displayName || user.displayName} size="xl" />
          <div className="text-[20px] font-semibold text-white tracking-[-0.02em]">
            {displayName || user.displayName}
          </div>
          {user.email && (
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,0.45)" }}>
              {user.email}
            </div>
          )}
        </div>

        {/* Edit fields */}
        <GlassCard
          noPadding
          className="anim-slide-up"
          style={{ animationDelay: "60ms" } as React.CSSProperties}
        >
          <FieldRow label="Display name">
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className="flex-1 bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-white/40"
              maxLength={80}
            />
          </FieldRow>
          <FieldRow label="UPI ID">
            <input
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="yourname@upi"
              className="flex-1 bg-transparent outline-none text-white text-[15px] font-medium placeholder:text-white/40"
              maxLength={100}
              autoCapitalize="none"
              autoCorrect="off"
            />
          </FieldRow>
        </GlassCard>

        {isDirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 rounded-[16px] text-[15px] font-semibold pool-press transition-all anim-scale-pop"
            style={{
              background: saved ? "rgba(48,209,88,0.2)" : "rgba(255,255,255,0.92)",
              color: saved ? "#30d158" : "#000",
              boxShadow: saved
                ? "none"
                : "inset 0 1px 0 rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.4)",
              border: saved ? "0.5px solid rgba(48,209,88,0.3)" : "none",
            }}
          >
            {saving ? "Saving…" : saved ? "✓ Saved" : "Save changes"}
          </button>
        )}

        {/* UPI hint */}
        <div
          className="px-1 text-[12px] leading-relaxed"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Your UPI ID lets friends pay you directly from the settle screen.
        </div>

        {/* Actions */}
        <GlassCard
          noPadding
          className="anim-slide-up mt-2"
          style={{ animationDelay: "100ms" } as React.CSSProperties}
        >
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex items-center gap-3 w-full px-4 py-4 pool-press"
          >
            <div
              className="w-8 h-8 rounded-[10px] flex items-center justify-center"
              style={{ background: "rgba(255,69,58,0.12)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ff453a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </div>
            <div className="text-[15px] font-medium" style={{ color: "#ff453a" }}>
              Sign out
            </div>
          </button>
        </GlassCard>
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 border-b last:border-b-0"
      style={{ borderColor: "rgba(255,255,255,0.06)" }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[11px] mb-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {label}
        </div>
        <div className="flex items-center gap-2">{children}</div>
      </div>
    </div>
  );
}
