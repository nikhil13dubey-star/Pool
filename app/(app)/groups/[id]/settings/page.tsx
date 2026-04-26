"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getAvatarColor } from "@/lib/shared/types";

interface Member {
  id: string;
  userId: string;
  role: string;
  user: {
    id: string;
    displayName: string;
    email?: string | null;
    isGhost: boolean;
  };
}

interface Group {
  id: string;
  name: string;
  type: string;
  currency: string;
  simplifyDebts: boolean;
  members: Member[];
  createdById: string;
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function GroupSettingsPage({ params }: Props) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const [group, setGroup] = useState<Group | null>(null);
  const [name, setName] = useState("");
  const [simplify, setSimplify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    fetch(`/api/groups/${groupId}`)
      .then((r) => r.json())
      .then((data: Group) => {
        setGroup(data);
        setName(data.name);
        setSimplify(data.simplifyDebts);
      });
    fetch("/api/me/profile")
      .then((r) => r.json())
      .then((u) => setCurrentUserId(u.id));
  }, [groupId]);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    await fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), simplifyDebts: simplify }),
    });
    setSaving(false);
    router.back();
  }

  async function handleLeave() {
    if (!confirm("Leave this group?")) return;
    await fetch(`/api/groups/${groupId}/members`, {
      method: "DELETE",
    });
    router.push("/");
  }

  async function handleDelete() {
    if (!confirm("Delete this group? This cannot be undone.")) return;
    await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
    router.push("/");
  }

  const typeLabel = (type: string) =>
    ({ TRIP: "Trip", HOME: "Home", COUPLE: "Couple", OTHER: "Other" })[type] ?? type;

  const fieldRow = {
    display: "flex",
    alignItems: "center",
    padding: "14px 16px",
    borderBottom: "0.5px solid rgba(255,255,255,0.06)",
    position: "relative" as const,
    zIndex: 2,
  };
  const chevron = (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="rgba(255,255,255,0.3)"
      strokeWidth="2"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );

  if (!group) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.35)",
        }}
      >
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", paddingBottom: 100 }}>
      {/* Header */}
      <div
        style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 8 }}
      >
        <button
          onClick={() => router.back()}
          style={{
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            color: "#64d2ff",
            cursor: "pointer",
            marginLeft: -8,
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <div
          style={{
            flex: 1,
            fontSize: 17,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            textAlign: "center",
            color: "#fff",
          }}
        >
          Group settings
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: "none",
            border: "none",
            fontSize: 15,
            fontWeight: 600,
            color: "#64d2ff",
            cursor: "pointer",
            fontFamily: "inherit",
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

      <div style={{ padding: "8px 24px 32px" }}>
        {/* Group icon + name */}
        <div style={{ textAlign: "center", padding: "12px 0 24px" }}>
          <GroupTypeIcon type={group.type} />
          <div
            style={{
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#fff",
              marginTop: 12,
            }}
          >
            {group.name}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            {typeLabel(group.type)} · {group.members.length} members
          </div>
        </div>

        {/* General */}
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 500,
            padding: "12px 4px 8px",
          }}
        >
          General
        </div>
        <div style={cardStyle}>
          {/* Name */}
          <div
            style={{ ...fieldRow, borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Name</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  background: "none",
                  border: "none",
                  outline: "none",
                  color: "#fff",
                  fontSize: 15,
                  fontWeight: 500,
                  fontFamily: "inherit",
                  width: "100%",
                  marginTop: 2,
                }}
              />
            </div>
            {chevron}
          </div>
          {/* Type */}
          <div
            style={{ ...fieldRow, borderBottom: "0.5px solid rgba(255,255,255,0.06)" }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Type</div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff", marginTop: 2 }}>
                {typeLabel(group.type)}
              </div>
            </div>
            {chevron}
          </div>
          {/* Currency */}
          <div style={{ ...fieldRow, borderBottom: "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                Default currency
              </div>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff", marginTop: 2 }}>
                ₹ INR
              </div>
            </div>
            {chevron}
          </div>
        </div>

        {/* Behavior */}
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 500,
            padding: "0 4px 8px",
          }}
        >
          Behavior
        </div>
        <div style={{ ...cardStyle, marginBottom: 20 }}>
          <div style={{ ...fieldRow, borderBottom: "none" }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                Simplify debts
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                Reduce circular IOUs to fewer payments
              </div>
            </div>
            <button
              onClick={() => setSimplify(!simplify)}
              style={{
                width: 42,
                height: 26,
                borderRadius: 13,
                background: simplify ? "#30d158" : "rgba(255,255,255,0.15)",
                border: "none",
                cursor: "pointer",
                position: "relative",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 2,
                  left: simplify ? undefined : 2,
                  right: simplify ? 2 : undefined,
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                  transition: "left 0.2s, right 0.2s",
                }}
              />
            </button>
          </div>
        </div>

        {/* Members */}
        <div
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.35)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 500,
            padding: "0 4px 8px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span>Members · {group.members.length}</span>
          <button
            onClick={() => router.push(`/groups/${groupId}/members/add`)}
            style={{
              background: "none",
              border: "none",
              color: "#64d2ff",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              padding: 0,
              textTransform: "none",
              letterSpacing: 0,
            }}
          >
            + Add
          </button>
        </div>
        <div style={{ ...cardStyle, marginBottom: 24 }}>
          {group.members.map((m, i) => (
            <div
              key={m.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 16px",
                borderBottom:
                  i < group.members.length - 1
                    ? "0.5px solid rgba(255,255,255,0.06)"
                    : "none",
                position: "relative",
                zIndex: 2,
              }}
            >
              <MemberAvatar name={m.user.displayName} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                  {m.user.displayName}
                  {m.userId === currentUserId && (
                    <span
                      style={{
                        fontWeight: 400,
                        color: "rgba(255,255,255,0.35)",
                        fontSize: 12,
                        marginLeft: 4,
                      }}
                    >
                      (you)
                    </span>
                  )}
                  {m.user.isGhost && (
                    <span
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        padding: "2px 6px",
                        background: "rgba(255,255,255,0.06)",
                        borderRadius: 999,
                        marginLeft: 6,
                      }}
                    >
                      ghost
                    </span>
                  )}
                </div>
              </div>
              {m.user.isGhost && (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              )}
            </div>
          ))}
        </div>

        {/* Danger zone */}
        <button
          onClick={handleLeave}
          style={{
            width: "100%",
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,165,0,0.3)",
            borderRadius: 14,
            padding: "14px 16px",
            fontSize: 15,
            fontWeight: 600,
            color: "#ff9f0a",
            fontFamily: "inherit",
            cursor: "pointer",
            marginBottom: 8,
          }}
        >
          Leave group
        </button>
        {group.createdById === currentUserId && (
          <button
            onClick={handleDelete}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "0.5px solid rgba(255,69,58,0.3)",
              borderRadius: 14,
              padding: "14px 16px",
              fontSize: 15,
              fontWeight: 600,
              color: "#ff453a",
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Delete group
          </button>
        )}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  border: "0.5px solid rgba(255,255,255,0.08)",
  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
  borderRadius: 16,
  overflow: "hidden",
  marginBottom: 20,
  position: "relative",
};

function GroupTypeIcon({ type }: { type: string }) {
  const configs: Record<string, { bg: string; color: string }> = {
    TRIP: { bg: "rgba(100,210,255,0.2)", color: "#64d2ff" },
    HOME: { bg: "rgba(48,209,88,0.2)", color: "#30d158" },
    COUPLE: { bg: "rgba(255,100,130,0.2)", color: "#ff6482" },
    OTHER: { bg: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.7)" },
  };
  const c = configs[type] ?? configs.OTHER;

  return (
    <div
      style={{
        width: 64,
        height: 64,
        borderRadius: 20,
        background: c.bg,
        color: c.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        boxShadow: `inset 0 0 0 0.5px ${c.color}40`,
      }}
    >
      {type === "TRIP" && (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
        </svg>
      )}
      {type === "HOME" && (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )}
      {type === "COUPLE" && (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
      {(type === "OTHER" || !["TRIP", "HOME", "COUPLE"].includes(type)) && (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      )}
    </div>
  );
}

function MemberAvatar({ name }: { name: string }) {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  const bg = getAvatarColor(name);
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 14,
        fontWeight: 600,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  );
}
