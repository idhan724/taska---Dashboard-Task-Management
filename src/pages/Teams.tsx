import TeamCards from "@/components/team/TeamCards";
import InviteDialogButton from "@/components/team/inviteDialogButton";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";

export default function Teams() {
  const { profile } = useAuthStore();
  const { activeWorkspace } = useWorkspaceStore();

  const isOwner = activeWorkspace?.owner_id === profile?.id;
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        {isOwner && <InviteDialogButton />}
      </div>
      <TeamCards />
    </>
  );
}
