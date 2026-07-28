import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { WorkspaceMember } from "@/types";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { toast } from "sonner";

interface RemoveMemberButtonProps {
  member: WorkspaceMember;
}

export default function RemoveMemberButton({
  member,
}: RemoveMemberButtonProps) {
  const { activeWorkspace, removeMember } = useWorkspaceStore();
  const [isRemoving, setIsRemoving] = React.useState(false);

  const handleRemoveMember = async () => {
    if (!activeWorkspace) return;

    setIsRemoving(true);
    try {
      await removeMember(activeWorkspace.id, member.profile.id);
      toast.success("Successfully remove member");
    } catch {
      toast.error(
        useWorkspaceStore.getState().error ?? "Failed to remove member",
      );
    } finally {
      setIsRemoving(false);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger>
        <Button>Remove member</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure to remove this member?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleRemoveMember} disabled={isRemoving}>
            {isRemoving ? (
              <>
                <Spinner />
                Removing...
              </>
            ) : (
              "Remove"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
