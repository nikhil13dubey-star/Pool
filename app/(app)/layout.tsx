import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/server/current-user";
import { TabBar } from "@/components/shared/tab-bar";
import { RefreshOnFocus } from "@/components/shared/refresh-on-focus";

export default async function AppLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/welcome");
  return (
    <>
      {children}
      {modal}
      <TabBar />
      <RefreshOnFocus />
    </>
  );
}
