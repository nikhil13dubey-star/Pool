import { AddPeopleForm } from "@/components/members/add-people-form";

export default async function AddPeopleModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AddPeopleForm groupId={id} />;
}
