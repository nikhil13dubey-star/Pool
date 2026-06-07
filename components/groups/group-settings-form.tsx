"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";
import { Loader } from "@/components/ui/loader";

export function GroupSettingsForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [createdById, setCreatedById] = useState("");
  const [meId, setMeId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmKind, setConfirmKind] = useState<"delete" | "leave" | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionErr, setActionErr] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/groups/${groupId}`).then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([g, me]) => {
      setName(g.name ?? "");
      setCreatedById(g.createdById ?? "");
      setMeId(me.id ?? "");
      setLoaded(true);
    });
  }, [groupId]);

  async function save() {
    setSaving(true);
    await fetch(`/api/groups/${groupId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    router.back();
    router.refresh();
  }

  async function del() {
    setBusy(true);
    await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
    router.replace("/");
  }

  async function leave() {
    setBusy(true);
    setActionErr(null);
    const res = await fetch(`/api/groups/${groupId}/members`, { method: "DELETE" });
    if (res.ok) {
      router.replace("/");
    } else {
      setActionErr((await res.json().catch(() => ({})))?.error ?? "Couldn't leave.");
      setBusy(false);
      setConfirmKind(null);
    }
  }

  return (
    <ModalSheet
      title="Group settings"
      doneLabel={saving ? "…" : "Save"}
      onDone={save}
      doneDisabled={!name.trim() || saving}
    >
      <div style={{ padding: "18px 20px" }}>
        {!loaded ? (
          <Loader compact />
        ) : (
          <>
            <div className="cap" style={{ marginBottom: 10 }}>
              Name
            </div>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />

            <div className="cap" style={{ margin: "26px 0 10px" }}>
              Manage
            </div>
            <div className="card">
              <Link
                href={`/groups/${groupId}/recycle-bin`}
                className="row"
                style={{ color: "var(--ink)" }}
              >
                <span style={{ flex: 1 }}>Recently deleted</span>
                <svg
                  width="8"
                  height="14"
                  viewBox="0 0 8 14"
                  fill="none"
                  stroke="var(--faint)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                >
                  <path d="M1 1l6 6-6 6" />
                </svg>
              </Link>
              <button
                onClick={() => setConfirmKind("leave")}
                className="row"
                style={{
                  width: "100%",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: "#ff9f6b",
                }}
              >
                <span style={{ flex: 1 }}>Leave group</span>
              </button>
            </div>
            {actionErr && (
              <p style={{ fontSize: 13, color: "var(--neg)", marginTop: 10 }}>
                {actionErr}
              </p>
            )}

            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => setConfirmKind("delete")}
                className="btn"
                style={{ background: "rgba(255,90,70,0.12)", color: "#ff6b54" }}
                disabled={createdById !== meId}
              >
                Delete group
              </button>
              {createdById !== meId && (
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--muted)",
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Only the creator can delete this group.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <ConfirmSheet
        open={confirmKind !== null}
        title={confirmKind === "delete" ? "Delete this group?" : "Leave this group?"}
        message={
          confirmKind === "delete"
            ? "The group and all its expenses will be removed for everyone. This can’t be undone."
            : "You’ll be removed from this group. You can be added back later."
        }
        confirmLabel={confirmKind === "delete" ? "Delete" : "Leave"}
        loading={busy}
        onConfirm={confirmKind === "delete" ? del : leave}
        onCancel={() => setConfirmKind(null)}
      />
    </ModalSheet>
  );
}
