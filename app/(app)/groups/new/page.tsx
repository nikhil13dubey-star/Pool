import { CreateGroupForm } from "@/components/groups/create-group-form";

// Base route (direct navigation / refresh). Normally opened as an intercepted modal.
export default async function NewGroupPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <CreateGroupForm defaultType={type ?? "TRIP"} />;
}
