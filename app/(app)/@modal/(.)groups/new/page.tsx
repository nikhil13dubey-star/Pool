import { CreateGroupForm } from "@/components/groups/create-group-form";

export default async function NewGroupModal({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  return <CreateGroupForm defaultType={type ?? "TRIP"} />;
}
