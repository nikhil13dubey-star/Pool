import Link from "next/link";
import { getCurrentUser } from "@/lib/server/current-user";
import { Avatar } from "@/components/ui/avatar";
import { SignOutButton } from "@/components/ui/sign-out-button";

export default async function ProfilePage() {
  const user = (await getCurrentUser())!;
  return (
    <div style={{ minHeight: "100svh", padding: "24px 18px 130px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
      >
        <h1 className="lt">Profile</h1>
        <Link href="/profile/edit" className="btn-text" style={{ fontSize: 16 }}>
          Edit
        </Link>
      </div>

      <div
        className="card"
        style={{
          marginTop: 20,
          padding: 20,
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <Avatar name={user.displayName} hue={user.avatarColor} size={56} ring />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 19, fontWeight: 700 }}>{user.displayName}</div>
          <div style={{ color: "var(--muted)", marginTop: 2 }}>@{user.handle}</div>
        </div>
      </div>

      <div className="cap" style={{ margin: "26px 0 10px" }}>
        Account
      </div>
      <div className="card">
        <div className="row">
          <span style={{ flex: 1, color: "var(--muted)" }}>UPI ID</span>
          <span>{user.upiId || "Not set"}</span>
        </div>
        <Link href="/profile/pin" className="row" style={{ color: "var(--ink)" }}>
          <span style={{ flex: 1 }}>Change PIN</span>
          <Chevron />
        </Link>
        <Link href="/profile/edit" className="row" style={{ color: "var(--ink)" }}>
          <span style={{ flex: 1 }}>Edit profile</span>
          <Chevron />
        </Link>
      </div>

      <div className="cap" style={{ margin: "26px 0 10px" }}>
        About
      </div>
      <div className="card">
        <div className="row">
          <span style={{ flex: 1, color: "var(--muted)" }}>Pool</span>
          <span className="muted">v1.0</span>
        </div>
      </div>

      <div style={{ marginTop: 24 }}>
        <SignOutButton />
      </div>
    </div>
  );
}

function Chevron() {
  return (
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
  );
}
