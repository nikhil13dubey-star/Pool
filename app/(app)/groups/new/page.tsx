"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { GroupIcon } from "@/components/shared/group-icon";
import { cn } from "@/lib/client/utils";

type GroupType = "TRIP" | "HOME" | "COUPLE" | "OTHER";

const types: { value: GroupType; label: string }[] = [
  { value: "TRIP", label: "Trip" },
  { value: "HOME", label: "Home" },
  { value: "COUPLE", label: "Couple" },
  { value: "OTHER", label: "Other" },
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
            {types.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-[16px] pool-press transition-all duration-200",
                  type === value
                    ? "border border-white/25 bg-white/8"
                    : "border border-white/7 bg-white/5",
                )}
              >
                <GroupIcon type={value} size={36} />
                <span className="text-[15px] font-medium text-white">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
}
