"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { Avatar } from "@/components/ui/avatar";

interface Member {
  id: string;
  userId: string;
  user: { displayName: string; avatarColor: string; isGhost: boolean };
}

export function AddPeopleForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [meId, setMeId] = useState("");
  const [createdById, setCreatedById] = useState("");
  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [link, setLink] = useState("");
  const [qr, setQr] = useState("");
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const [g, me] = await Promise.all([
      fetch(`/api/groups/${groupId}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]);
    setMembers(g.members ?? []);
    setCreatedById(g.createdById ?? "");
    setMeId(me.id ?? "");
  }, [groupId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  useEffect(() => {
    // generate the invite link + QR once
    (async () => {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (res.ok) {
        const { url } = await res.json();
        setLink(url);
        setQr(
          await QRCode.toDataURL(url, {
            margin: 1,
            width: 320,
            color: { dark: "#0a0a0b", light: "#ffffff" },
          }),
        );
      }
    })();
  }, [groupId]);

  async function add() {
    if (!name.trim() || adding) return;
    setAdding(true);
    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      const m = await res.json();
      setMembers((prev) => [...prev, m]);
      setName("");
    }
    setAdding(false);
  }

  async function remove(userId: string) {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
    await fetch(`/api/groups/${groupId}/members?userId=${userId}`, { method: "DELETE" });
  }

  function copy() {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <ModalSheet
      title="Add people"
      doneLabel="Done"
      onDone={() => {
        router.back();
        router.refresh();
      }}
    >
      <div style={{ padding: "16px 20px" }}>
        <p
          style={{
            color: "var(--muted)",
            fontSize: 14,
            lineHeight: 1.5,
            marginBottom: 14,
          }}
        >
          Add anyone by name now — send them the link later to claim their spot.
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            className="input"
            placeholder="Name — e.g. Rohan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && add()}
            maxLength={40}
            style={{ flex: 1 }}
          />
          <button
            className="btn btn-primary"
            style={{ width: "auto", padding: "0 22px" }}
            onClick={add}
            disabled={!name.trim() || adding}
          >
            Add
          </button>
        </div>

        <div className="cap" style={{ margin: "24px 0 10px" }}>
          In this group · {members.length}
        </div>
        <div className="card">
          {members.map((m) => (
            <div key={m.id} className="row">
              <Avatar name={m.user.displayName} hue={m.user.avatarColor} size={36} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>
                  {m.user.displayName}
                  {m.userId === meId && (
                    <span
                      style={{ color: "var(--muted)", fontWeight: 400, fontSize: 13 }}
                    >
                      {" "}
                      (you)
                    </span>
                  )}
                </div>
                {m.user.isGhost && (
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    Invite pending
                  </div>
                )}
              </div>
              {m.user.isGhost && createdById === meId && (
                <button
                  onClick={() => remove(m.userId)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "var(--muted)",
                    display: "flex",
                  }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>

        {/* invite link + QR */}
        <div className="cap" style={{ margin: "28px 0 10px" }}>
          Share invite link
        </div>
        <div className="card" style={{ padding: 20, textAlign: "center" }}>
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={qr}
              alt="Invite QR"
              width={180}
              height={180}
              style={{ borderRadius: 14, margin: "0 auto 16px" }}
            />
          ) : (
            <div
              style={{
                height: 180,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted)",
              }}
            >
              Generating…
            </div>
          )}
          <p
            style={{
              fontSize: 13,
              color: "var(--muted)",
              lineHeight: 1.5,
              marginBottom: 16,
            }}
          >
            Friends scan this or tap your link to join — and claim their name.
          </p>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-ghost" onClick={copy} disabled={!link}>
              {copied ? "Copied ✓" : "Copy link"}
            </button>
            <a
              className="btn btn-primary"
              href={`https://wa.me/?text=${encodeURIComponent(`Join our Pool group: ${link}`)}`}
              target="_blank"
              rel="noreferrer"
              style={{ pointerEvents: link ? "auto" : "none" }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </div>
    </ModalSheet>
  );
}
