import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { TabBar } from "@/components/shared/tab-bar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  return (
    <div
      className="relative min-h-screen overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse 600px 800px at 50% 100%, #1a1a1a 0%, #050505 70%)",
      }}
    >
      {/* Persistent ambient blobs */}
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
        <div
          className="absolute w-[380px] h-[380px] rounded-full"
          style={{
            background: "rgba(100,100,110,0.16)",
            filter: "blur(80px)",
            bottom: 120,
            left: -80,
          }}
        />
      </div>

      {/* Main content with bottom padding for tab bar */}
      <main className="relative z-10 min-h-screen pb-[100px]">{children}</main>

      <TabBar />
    </div>
  );
}
