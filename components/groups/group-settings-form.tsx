"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalSheet } from "@/components/ui/modal-sheet";

export function GroupSettingsForm({ groupId }: { groupId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [createdById, setCreatedById] = useState("");
  const [meId, setMeId] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

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
    if (!confirm("Delete this group? This can't be undone.")) return;
    await fetch(`/api/groups/${groupId}`, { method: "DELETE" });
    router.replace("/");
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
          <div style={{ color: "var(--muted)", textAlign: "center", padding: 30 }}>
            Loading…
          </div>
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

            <div style={{ marginTop: 28 }}>
              <button
                onClick={del}
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
    </ModalSheet>
  );
}
