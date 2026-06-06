"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";

interface Preview {
  token: string;
  groupId: string;
  groupName: string;
  groupType: string;
  members: { userId: string; name: string; hue: string; isGhost: boolean }[];
}

export function InviteClient({
  preview,
  me,
}: {
  preview: Preview;
  me: { id: string; displayName: string; alreadyMember: boolean } | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const ghosts = preview.members.filter((m) => m.isGhost);
  const next = `/invite/${preview.token}`;

  async function join(claimGhostId?: string) {
    if (!me) {
      router.push(`/welcome?next=${encodeURIComponent(next)}`);
      return;
    }
    setBusy(true);
    const res = await fetch(`/api/invites/${preview.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimGhostId }),
    });
    if (res.ok) {
      const { groupId } = await res.json();
      router.replace(`/groups/${groupId}`);
    } else setBusy(false);
  }

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        padding: "0 24px 40px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
        }}
      >
        <div style={{ textAlign: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-mark.png"
            alt="Pool"
            height={48}
            style={{ height: 48, margin: "0 auto 18px" }}
          />
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            You&apos;re invited to join
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              marginTop: 4,
            }}
          >
            {preview.groupName}
          </div>
          <div className="stack" style={{ justifyContent: "center", marginTop: 14 }}>
            {preview.members.slice(0, 5).map((m) => (
              <Avatar key={m.userId} name={m.name} hue={m.hue} size={34} />
            ))}
          </div>
          <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
            {preview.members.length} {preview.members.length === 1 ? "person" : "people"}{" "}
            in this group
          </div>
        </div>

        {me?.alreadyMember ? (
          <button
            className="btn btn-primary"
            onClick={() => router.replace(`/groups/${preview.groupId}`)}
          >
            Open group
          </button>
        ) : (
          <>
            {ghosts.length > 0 && (
              <div>
                <div className="cap" style={{ marginBottom: 10 }}>
                  Claim your name
                </div>
                <div className="card">
                  {ghosts.map((g) => (
                    <button
                      key={g.userId}
                      className="row"
                      style={{
                        width: "100%",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                      onClick={() => join(g.userId)}
                      disabled={busy}
                    >
                      <Avatar name={g.name} hue={g.hue} size={36} />
                      <div style={{ flex: 1, fontSize: 16, fontWeight: 500 }}>
                        {g.name}
                      </div>
                      <span
                        style={{ color: "var(--accent)", fontSize: 14, fontWeight: 600 }}
                      >
                        That&apos;s me
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button className="btn btn-primary" onClick={() => join()} disabled={busy}>
              {busy
                ? "Joining…"
                : ghosts.length > 0
                  ? "I'm someone new — join"
                  : "Join group"}
            </button>
            {!me && (
              <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
                You&apos;ll set up a quick account first.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
