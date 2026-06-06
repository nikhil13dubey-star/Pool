import { GroupSettingsForm } from "@/components/groups/group-settings-form";

export default async function GroupSettingsModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <GroupSettingsForm groupId={id} />;
}
