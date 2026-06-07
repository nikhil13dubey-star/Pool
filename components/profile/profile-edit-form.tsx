"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { Loader } from "@/components/ui/loader";

export function ProfileEditForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [upi, setUpi] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((u) => {
        setName(u.displayName ?? "");
        setUpi(u.upiId ?? "");
        setLoaded(true);
      });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/me/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName: name.trim(), upiId: upi.trim() }),
    });
    router.back();
    router.refresh();
  }

  return (
    <ModalSheet
      title="Edit profile"
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
              Full name
            </div>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
            />
            <div className="cap" style={{ margin: "22px 0 10px" }}>
              UPI ID{" "}
              <span style={{ textTransform: "none", color: "var(--faint)" }}>
                (optional)
              </span>
            </div>
            <input
              className="input"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              placeholder="yourname@okbank"
              autoCapitalize="none"
            />
            <p
              style={{
                fontSize: 13,
                color: "var(--muted)",
                marginTop: 8,
                lineHeight: 1.5,
              }}
            >
              Shown to friends so they can pay you back.
            </p>
          </>
        )}
      </div>
    </ModalSheet>
  );
}
