"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ModalSheet } from "@/components/ui/modal-sheet";
import { PinPad } from "@/components/ui/pin-pad";

export function ChangePinForm() {
  const router = useRouter();
  const [step, setStep] = useState<"current" | "new" | "confirm">("current");
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [err, setErr] = useState("");

  function onCurrent(v: string) {
    setCurrent(v);
    if (v.length === 4) setTimeout(() => setStep("new"), 120);
  }
  function onNew(v: string) {
    setNext(v);
    if (v.length === 4) setTimeout(() => setStep("confirm"), 120);
  }
  async function onConfirm(v: string) {
    setConfirm(v);
    if (v.length !== 4) return;
    if (v !== next) {
      setErr("PINs didn't match");
      setConfirm("");
      setNext("");
      setTimeout(() => {
        setErr("");
        setStep("new");
      }, 800);
      return;
    }
    const res = await fetch("/api/me/pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPin: current, newPin: next }),
    });
    if (res.ok) {
      router.back();
    } else {
      setErr("Current PIN is wrong");
      setCurrent("");
      setConfirm("");
      setTimeout(() => {
        setErr("");
        setStep("current");
      }, 900);
    }
  }

  const titles = {
    current: "Enter current PIN",
    new: "Choose a new PIN",
    confirm: "Confirm new PIN",
  };
  const val = step === "current" ? current : step === "new" ? next : confirm;
  const on = step === "current" ? onCurrent : step === "new" ? onNew : onConfirm;

  return (
    <ModalSheet title="Change PIN">
      <div
        style={{
          padding: "30px 20px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 32,
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{titles[step]}</div>
          {err && <div style={{ color: "var(--neg)", marginTop: 8 }}>{err}</div>}
        </div>
        <PinPad value={val} onChange={on} error={!!err} />
      </div>
    </ModalSheet>
  );
}
