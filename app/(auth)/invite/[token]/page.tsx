"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { GlassCard } from "@/components/ui/glass-card";
import { GroupIcon } from "@/components/shared/group-icon";
import type { GroupType } from "@prisma/client";

interface InviteInfo {
  groupId: string;
  groupName: string;
  groupType: string;
  ghostName?: string;
  expiresAt: string;
}

type PageState = "loading" | "ready" | "claiming" | "done" | "error";

export default function InvitePage() {
  const { token } = useParams<{ token: string }>();
  const router = useRouter();
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch(`/api/invites/${token}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setErrorMsg(data.error);
          setPageState("error");
        } else {
          setInfo(data);
          setPageState("ready");
        }
      })
      .catch(() => {
        setErrorMsg("Something went wrong.");
        setPageState("error");
      });
  }, [token]);

  async function accept() {
    setPageState("claiming");
    const res = await fetch(`/api/invites/${token}`, { method: "POST" });
    const data = await res.json();

    if (res.status === 401) {
      // Not logged in — redirect to sign-in with callback
      router.push(`/sign-in?callbackUrl=/invite/${token}`);
      return;
    }

    if (!res.ok) {
      setErrorMsg(data.error ?? "Something went wrong.");
      setPageState("error");
      return;
    }

    setPageState("done");
    setTimeout(() => router.push(`/groups/${data.groupId}`), 1200);
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{
        background:
          "radial-gradient(ellipse 600px 800px at 50% 0%, #1a1a1a 0%, #050505 70%)",
      }}
    >
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="absolute w-[400px] h-[400px] rounded-full"
          style={{
            background: "rgba(120,120,130,0.18)",
            filter: "blur(80px)",
            top: -100,
            left: -120,
          }}
        />
        <div
          className="absolute w-[350px] h-[350px] rounded-full"
          style={{
            background: "rgba(140,140,145,0.14)",
            filter: "blur(80px)",
            top: 220,
            right: -110,
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {pageState === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-[20px] skeleton" />
            <div className="w-40 h-5 rounded-full skeleton" />
            <div className="w-56 h-4 rounded-full skeleton" />
          </div>
        )}

        {pageState === "error" && (
          <GlassCard className="anim-slide-up text-center">
            <div className="text-[40px] mb-4">⚠️</div>
            <div className="text-[17px] font-semibold text-white mb-2">
              {errorMsg === "Already used"
                ? "Link already used"
                : errorMsg === "Expired"
                  ? "Link expired"
                  : "Invalid invite"}
            </div>
            <div
              className="text-[13px] mb-6 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              {errorMsg === "Already used"
                ? "This invite link has already been claimed."
                : errorMsg === "Expired"
                  ? "This invite link has expired. Ask the group owner to generate a new one."
                  : "This invite link is not valid."}
            </div>
            <button
              onClick={() => router.push("/")}
              className="w-full py-3 rounded-[14px] text-[15px] font-semibold pool-press"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.8)",
                border: "0.5px solid rgba(255,255,255,0.1)",
              }}
            >
              Go home
            </button>
          </GlassCard>
        )}

        {(pageState === "ready" || pageState === "claiming") && info && (
          <div className="anim-slide-up flex flex-col items-center text-center gap-6">
            {/* Pool wordmark */}
            <div
              className="text-[22px] font-bold tracking-[-0.04em]"
              style={{
                background:
                  "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.55) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Pool
            </div>

            {/* Group card */}
            <GlassCard className="w-full">
              <div className="flex flex-col items-center gap-3 py-2">
                <GroupIcon type={info.groupType as GroupType} size={56} />
                <div>
                  <div
                    className="text-[13px] font-medium mb-1"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    You&apos;re invited to join
                  </div>
                  <div className="text-[24px] font-bold text-white tracking-[-0.02em]">
                    {info.groupName}
                  </div>
                </div>
                {info.ghostName && (
                  <div
                    className="px-3 py-1.5 rounded-[10px] text-[13px]"
                    style={{
                      background: "rgba(100,210,255,0.12)",
                      color: "#64d2ff",
                      border: "0.5px solid rgba(100,210,255,0.2)",
                    }}
                  >
                    Claiming account for: <strong>{info.ghostName}</strong>
                  </div>
                )}
              </div>
            </GlassCard>

            <div className="w-full flex flex-col gap-3">
              <button
                onClick={accept}
                disabled={pageState === "claiming"}
                className="w-full py-4 rounded-[16px] text-[15px] font-semibold pool-press transition-all"
                style={{
                  background:
                    pageState === "claiming"
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(255,255,255,0.92)",
                  color: "#000",
                  boxShadow:
                    pageState === "claiming"
                      ? "none"
                      : "inset 0 1px 0 rgba(255,255,255,1), 0 4px 16px rgba(0,0,0,0.4)",
                }}
              >
                {pageState === "claiming" ? "Joining…" : "Accept & join group"}
              </button>
              <div
                className="text-[12px] text-center"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                By accepting you agree to Pool&apos;s terms of service.
              </div>
            </div>
          </div>
        )}

        {pageState === "done" && (
          <div className="anim-scale-pop flex flex-col items-center gap-4 text-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(48,209,88,0.15)",
                border: "0.5px solid rgba(48,209,88,0.3)",
              }}
            >
              <svg
                width="36"
                height="36"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#30d158"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="text-[22px] font-bold text-white tracking-[-0.02em]">
              You&apos;re in!
            </div>
            <div className="text-[14px]" style={{ color: "rgba(255,255,255,0.5)" }}>
              Taking you to the group…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
