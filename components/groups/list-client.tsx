"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmSheet } from "@/components/ui/confirm-sheet";

interface ListItem {
  id: string;
  text: string;
  addedById: string;
  addedByName: string;
  createdAt: string;
}

// Defensive parser: API may return a bare array or { items: [...] }.
function normalizeList(data: unknown): ListItem[] {
  if (Array.isArray(data)) return data as ListItem[];
  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: ListItem[] }).items;
  }
  return [];
}

// Defensive parser: API may return a bare item or { item: {...} }.
function normalizeItem(data: unknown): ListItem | null {
  if (data && typeof data === "object") {
    const wrapped = (data as { item?: unknown }).item;
    if (wrapped && typeof wrapped === "object") return wrapped as ListItem;
    if ("id" in (data as object)) return data as ListItem;
  }
  return null;
}

export function ListClient({
  groupId,
  groupName,
  initialItems,
}: {
  groupId: string;
  groupName: string;
  initialItems: ListItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<ListItem[]>(initialItems);
  const [text, setText] = useState("");
  const [adding, setAdding] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ListItem | null>(null);

  async function add() {
    const value = text.trim();
    if (!value || adding) return;
    setAdding(true);
    setErr(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      if (!res.ok) throw new Error("failed");
      const created = normalizeItem(await res.json());
      if (created) {
        setItems((prev) => [created, ...prev]);
        setText("");
      } else {
        // Server accepted but shape unknown — refresh from server.
        await refresh();
        setText("");
      }
    } catch {
      setErr("Couldn't add that. Try again.");
    } finally {
      setAdding(false);
    }
  }

  async function refresh() {
    try {
      const res = await fetch(`/api/groups/${groupId}/list`);
      if (!res.ok) return;
      setItems(normalizeList(await res.json()));
    } catch {
      // ignore
    }
  }

  async function remove(itemId: string) {
    const prev = items;
    setItems((cur) => cur.filter((i) => i.id !== itemId)); // optimistic
    setErr(null);
    try {
      const res = await fetch(`/api/groups/${groupId}/list`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      setItems(prev); // rollback
      setErr("Couldn't remove that. Try again.");
    }
  }

  return (
    <div style={{ minHeight: "100svh", padding: "16px 0 130px" }}>
      {/* header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 18px",
          minHeight: 44,
        }}
      >
        <button
          onClick={() => router.push(`/groups/${groupId}`)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "flex",
          }}
          aria-label="Back"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <span style={{ fontSize: 17, fontWeight: 600 }}>List</span>
        <span style={{ width: 24 }} />
      </div>

      <div style={{ textAlign: "center", padding: "8px 0 18px" }}>
        <div style={{ fontSize: 13, color: "var(--muted)" }}>{groupName}</div>
      </div>

      {/* add row */}
      <div style={{ padding: "0 18px", display: "flex", gap: 10, alignItems: "stretch" }}>
        <input
          className="input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="Add something the group needs"
          enterKeyHint="done"
        />
        <button
          onClick={add}
          disabled={adding || !text.trim()}
          aria-label="Add item"
          style={{
            flexShrink: 0,
            width: 54,
            borderRadius: 16,
            border: "none",
            cursor: text.trim() && !adding ? "pointer" : "default",
            background: "var(--brand-grad)",
            color: "var(--accent-ink)",
            opacity: adding || !text.trim() ? 0.4 : 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,0.2), 0 8px 22px -8px var(--brand-glow)",
            transition: "opacity 0.15s, transform 0.06s",
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        </button>
      </div>

      {err && (
        <p style={{ color: "var(--neg)", fontSize: 13, padding: "10px 18px 0" }}>{err}</p>
      )}

      {/* items */}
      {items.length === 0 ? (
        <p
          style={{
            textAlign: "center",
            color: "var(--muted)",
            padding: "60px 36px 0",
            fontSize: 14,
            lineHeight: 1.5,
          }}
        >
          Nothing on the list yet — add what the group needs.
        </p>
      ) : (
        <div
          style={{
            padding: "20px 18px 0",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "flex-start",
                padding: "16px 16px 16px 18px",
                gap: 12,
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 500,
                    lineHeight: 1.35,
                    wordBreak: "break-word",
                  }}
                >
                  {item.text}
                </div>
                <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 5 }}>
                  added by {item.addedByName}
                </div>
              </div>
              <button
                onClick={() => setPendingDelete(item)}
                aria-label="Remove item"
                style={{
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  padding: 4,
                  margin: "-4px -4px 0 0",
                  color: "var(--faint)",
                }}
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <ConfirmSheet
        open={!!pendingDelete}
        title="Remove from list?"
        message={
          pendingDelete
            ? `“${pendingDelete.text}” will be removed for everyone in the group.`
            : undefined
        }
        confirmLabel="Remove"
        onConfirm={() => {
          if (pendingDelete) remove(pendingDelete.id);
          setPendingDelete(null);
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
}
