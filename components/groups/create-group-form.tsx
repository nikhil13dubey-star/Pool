"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModalSheet } from "@/components/ui/modal-sheet";

const TYPES = [
  {
    key: "TRIP",
    name: "Trip",
    desc: "Vacations, outings",
    icon: (
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    ),
  },
  {
    key: "HOME",
    name: "Home",
    desc: "Flatmates, family",
    icon: (
      <>
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M9 22V12h6v10" />
      </>
    ),
  },
  {
    key: "COUPLE",
    name: "Couple",
    desc: "You & partner",
    icon: (
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
    ),
  },
  {
    key: "OTHER",
    name: "Other",
    desc: "Anything else",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
  },
];

export function CreateGroupForm({ defaultType = "TRIP" }: { defaultType?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState(defaultType);
  const [loading, setLoading] = useState(false);

  async function create() {
    if (!name.trim() || loading) return;
    setLoading(true);
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), type }),
    });
    if (res.ok) {
      const g = await res.json();
      router.back(); // dismiss the modal slot
      setTimeout(() => router.push(`/groups/${g.id}`), 60);
    } else {
      setLoading(false);
    }
  }

  return (
    <ModalSheet
      title="New group"
      doneLabel={loading ? "…" : "Create"}
      onDone={create}
      doneDisabled={!name.trim() || loading}
    >
      <div style={{ padding: "18px 20px" }}>
        <input
          className="input"
          autoFocus
          placeholder="Group name — e.g. Goa Trip"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={40}
        />
        <div className="cap" style={{ margin: "24px 0 12px" }}>
          Type
        </div>
        <div className="tiles">
          {TYPES.map((t) => (
            <button
              key={t.key}
              className={`tile${type === t.key ? " on" : ""}`}
              onClick={() => setType(t.key)}
              type="button"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke={type === t.key ? "var(--accent)" : "var(--muted)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {t.icon}
              </svg>
              <div className="tn">{t.name}</div>
              <div className="td">{t.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </ModalSheet>
  );
}
