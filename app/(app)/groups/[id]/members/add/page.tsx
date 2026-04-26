"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { getAvatarColor } from "@/lib/shared/types";

interface Member {
  id: string;
  userId: string;
  user: {
    id: string;
    displayName: string;
    email?: string | null;
    isGhost: boolean;
    avatarColor?: string | null;
  };
}

interface Props {
  params: Promise<{ id: string }>;
}

export default function AddMemberPage({ params }: Props) {
  const { id: groupId } = use(params);
  const router = useRouter();
  const [name, setName] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [inviteUrl, setInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/groups/${groupId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.members) setMembers(data.members);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.url) setInviteUrl(data.url);
      })
      .catch(() => {});
  }, [groupId]);

  async function handleAdd() {
    if (!name.trim()) return;
    setAdding(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const newMember = await res.json();
        setMembers((prev) => [...prev, newMember]);
        setName("");
      }
    } finally {
      setAdding(false);
    }
  }

  async function handleRemove(memberId: string) {
    setMembers((prev) => prev.filter((m) => m.id !== memberId));
  }

  async function copyLink() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const shortUrl = inviteUrl.replace(/^https?:\/\//, "");

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 20px",
          gap: 8,
        }}
      >
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            fontSize: 15,
            fontWeight: 500,
            color: "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          Cancel
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
          Add people
        </div>
        <button
          onClick={() => router.back()}
          style={{
            background: "none",
            border: "none",
            fontSize: 15,
            fontWeight: 500,
            color: "#64d2ff",
            cursor: "pointer",
            fontFamily: "inherit",
            padding: 0,
          }}
        >
          Done
        </button>
      </div>

      {/* Content */}
      <div style={{ padding: "16px 24px 100px" }}>
        {/* Description */}
        <div style={{ textAlign: "center", padding: "8px 0 20px" }}>
          <p
            style={{
              fontSize: 14,
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Add anyone by name — no email or phone needed. Send them a link later if you
            want them to claim their account.
          </p>
        </div>

        {/* Name input */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 12,
              color: "rgba(255,255,255,0.4)",
              marginBottom: 8,
              paddingLeft: 4,
            }}
          >
            Name
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rohan"
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              autoFocus
              style={{
                flex: 1,
                background: "rgba(255,255,255,0.07)",
                border: "0.5px solid rgba(255,255,255,0.18)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                borderRadius: 14,
                padding: "12px 14px",
                color: "#fff",
                fontSize: 15,
                fontFamily: "inherit",
                outline: "none",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.3)";
                e.target.style.background = "rgba(255,255,255,0.1)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(255,255,255,0.18)";
                e.target.style.background = "rgba(255,255,255,0.07)";
              }}
            />
            <button
              onClick={handleAdd}
              disabled={adding || !name.trim()}
              style={{
                background: name.trim() ? "#fff" : "rgba(255,255,255,0.1)",
                color: name.trim() ? "#000" : "rgba(255,255,255,0.3)",
                border: "none",
                borderRadius: 14,
                padding: "12px 18px",
                fontSize: 15,
                fontWeight: 600,
                fontFamily: "inherit",
                cursor: name.trim() ? "pointer" : "not-allowed",
              }}
            >
              {adding ? "…" : "Add"}
            </button>
          </div>
        </div>

        {/* Added members */}
        {!loading && members.length > 0 && (
          <>
            <div
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.35)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 500,
                padding: "16px 4px 8px",
              }}
            >
              Added
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "0.5px solid rgba(255,255,255,0.08)",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
                borderRadius: 16,
                overflow: "hidden",
                marginBottom: 24,
                position: "relative",
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
                    "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
                  pointerEvents: "none",
                }}
              />
              {members.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom:
                      i < members.length - 1
                        ? "0.5px solid rgba(255,255,255,0.07)"
                        : "none",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  <MemberAvatar name={m.user.displayName} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                      {m.user.displayName}
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
                    {m.user.email ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.4)",
                          marginTop: 1,
                        }}
                      >
                        {m.user.email}
                      </div>
                    ) : m.user.isGhost ? (
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.4)",
                          marginTop: 1,
                        }}
                      >
                        No email yet
                      </div>
                    ) : null}
                  </div>
                  {m.user.isGhost && (
                    <button
                      onClick={() => handleRemove(m.id)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,255,255,0.35)",
                        cursor: "pointer",
                        padding: 4,
                      }}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Share invite link card */}
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "0.5px solid rgba(255,255,255,0.08)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 16,
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
              background: "linear-gradient(180deg, rgba(255,255,255,0.03), transparent)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "rgba(100,210,255,0.15)",
                color: "#64d2ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}
              >
                Share invite link
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.5,
                  marginBottom: 10,
                }}
              >
                Friends tap this to join the group and claim their ghost identity.
              </div>
              <div
                style={{
                  background: "rgba(0,0,0,0.3)",
                  borderRadius: 8,
                  padding: "8px 10px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  {shortUrl || "Generating…"}
                </span>
                <button
                  onClick={copyLink}
                  style={{
                    background: "none",
                    border: "none",
                    color: copied ? "#30d158" : "#64d2ff",
                    fontSize: 12,
                    fontWeight: 600,
                    fontFamily: "inherit",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
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
