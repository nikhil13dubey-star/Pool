"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAvatarColor } from "@/lib/shared/types";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
  actorName?: string;
}

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "just now" : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function isNew(date: string): boolean {
  return Date.now() - new Date(date).getTime() < 24 * 60 * 60 * 1000;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        setNotifications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.isRead);
    await Promise.all(
      unread.map((n) => fetch(`/api/notifications/${n.id}`, { method: "PATCH" })),
    );
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }

  const newNotifs = notifications.filter((n) => isNew(n.createdAt));
  const earlierNotifs = notifications.filter((n) => !isNew(n.createdAt));
  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "24px 20px 16px",
          gap: 8,
        }}
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
          Notifications
        </div>
        <button
          onClick={markAllRead}
          style={{
            background: "none",
            border: "none",
            fontSize: 14,
            fontWeight: 500,
            color: hasUnread ? "#64d2ff" : "rgba(255,255,255,0.3)",
            cursor: hasUnread ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          Mark read
        </button>
      </div>

      {/* Content */}
      <div style={{ paddingBottom: 100 }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 0",
              color: "rgba(255,255,255,0.35)",
              fontSize: 14,
            }}
          >
            Loading…
          </div>
        ) : notifications.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔔</div>
            <div
              style={{ fontSize: 17, fontWeight: 600, color: "#fff", marginBottom: 6 }}
            >
              No notifications
            </div>
            <div
              style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", lineHeight: 1.5 }}
            >
              You&apos;re all caught up.
            </div>
          </div>
        ) : (
          <>
            {newNotifs.length > 0 && (
              <>
                <div
                  style={{
                    padding: "8px 24px 4px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                  }}
                >
                  New
                </div>
                <div
                  style={{
                    padding: "0 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    marginBottom: 20,
                  }}
                >
                  {newNotifs.map((n) => (
                    <NotifCard key={n.id} notif={n} />
                  ))}
                </div>
              </>
            )}
            {earlierNotifs.length > 0 && (
              <>
                <div
                  style={{
                    padding: "8px 24px 4px",
                    fontSize: 11,
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontWeight: 500,
                  }}
                >
                  Earlier
                </div>
                <div
                  style={{
                    padding: "0 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  {earlierNotifs.map((n) => (
                    <NotifCard key={n.id} notif={n} older />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function NotifCard({ notif, older }: { notif: Notification; older?: boolean }) {
  const actorName = notif.actorName ?? notif.title ?? "?";
  const initial = (actorName.trim()[0] ?? "?").toUpperCase();
  const avatarGradient = getAvatarColor(actorName);

  return (
    <div
      style={{
        padding: 14,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        background: "rgba(255,255,255,0.04)",
        border: "0.5px solid rgba(255,255,255,0.12)",
        borderRadius: 16,
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
        position: "relative",
        overflow: "hidden",
        opacity: older ? 0.7 : 1,
      }}
    >
      {/* Glass shimmer */}
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

      {/* Avatar */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "50%",
          background: avatarGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 14,
          fontWeight: 600,
          color: "#fff",
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      >
        {initial}
      </div>

      {/* Body */}
      <div style={{ flex: 1, minWidth: 0, position: "relative", zIndex: 2 }}>
        <div style={{ fontSize: 14, lineHeight: 1.4, color: "#fff", marginBottom: 4 }}>
          <strong style={{ fontWeight: 600 }}>{notif.title}</strong>{" "}
          <span style={{ fontWeight: 400 }}>{notif.body}</span>
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
          {timeAgo(notif.createdAt)}
        </div>
      </div>

      {/* Unread dot */}
      {!notif.isRead && !older && (
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "#0a84ff",
            flexShrink: 0,
            marginTop: 6,
            position: "relative",
            zIndex: 2,
          }}
        />
      )}
    </div>
  );
}
