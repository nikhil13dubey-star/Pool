import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(next || "/");
  const q = next ? `?next=${encodeURIComponent(next)}` : "";

  return (
    <div
      style={{
        minHeight: "100svh",
        display: "flex",
        flexDirection: "column",
        padding: "0 28px 40px",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 28,
        }}
      >
        {/* brand mark — real Pool logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.png"
          alt="Pool"
          width={88}
          height={106}
          style={{ objectFit: "contain" }}
        />

        <div>
          <h1
            style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Welcome to Pool.
          </h1>
          <p
            style={{
              fontSize: 16,
              color: "var(--muted)",
              marginTop: 12,
              lineHeight: 1.5,
            }}
          >
            Split expenses with friends. Settle up in seconds. No ads, no limits.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Link href={`/create${q}`} className="btn btn-primary">
          Create your account
        </Link>
        <Link href={`/signin${q}`} className="btn btn-ghost">
          I already have an account
        </Link>
      </div>
    </div>
  );
}
