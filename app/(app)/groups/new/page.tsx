"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { GroupIcon } from "@/components/shared/group-icon";

type GroupType = "TRIP" | "HOME" | "COUPLE" | "OTHER";

const types: { value: GroupType; label: string; subtitle: string }[] = [
  { value: "TRIP", label: "Trip", subtitle: "Vacations, events" },
  { value: "HOME", label: "Home", subtitle: "Roommates, family" },
  { value: "COUPLE", label: "Couple", subtitle: "You & partner" },
  { value: "OTHER", label: "Other", subtitle: "Anything else" },
];

export default function NewGroupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [type, setType] = useState<GroupType>("TRIP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), type }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { id } = await res.json();
      router.push(`/groups/${id}`);
    } catch {
      setError("Failed to create group. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <button
          onClick={() => router.back()}
          className="text-[15px] font-medium pool-press"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          Cancel
        </button>
        <div className="text-[17px] font-semibold tracking-[-0.01em]">New group</div>
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || loading}
          className="text-[15px] font-semibold pool-press disabled:opacity-40"
          style={{ color: "#64d2ff" }}
        >
          {loading ? "Creating…" : "Create"}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="px-6 flex flex-col gap-8 anim-slide-up">
        {/* Name */}
        <div>
          <Input
            label="Group name"
            placeholder="Goa weekend"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            maxLength={60}
            error={error}
          />
        </div>

        {/* Type */}
        <div>
          <div
            className="text-xs font-medium mb-3 pl-1"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            Type
          </div>
          <div className="grid grid-cols-2 gap-2">
            {types.map(({ value, label, subtitle }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                style={{
                  padding: 16,
                  textAlign: "center",
                  borderRadius: 16,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  background:
                    type === value ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
                  border: `0.5px solid ${type === value ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)"}`,
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)",
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
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
                    pointerEvents: "none",
                  }}
                />
                <div style={{ position: "relative", zIndex: 2 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: 10,
                    }}
                  >
                    <GroupIcon type={value} size={40} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.55)",
                      marginTop: 2,
                    }}
                  >
                    {subtitle}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
