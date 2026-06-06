"use client";

import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/welcome");
  }
  return (
    <button className="btn btn-ghost" onClick={signOut}>
      Sign out
    </button>
  );
}
