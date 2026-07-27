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
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export default function LeaveWorkspaceButton() {
  const { activeWorkspace, leaveWorkspace } = useWorkspaceStore();
  const [isLeaving, setIsLeaving] = React.useState(false);
  const navigate = useNavigate();

  const handleLeaving = async () => {
    if (!activeWorkspace) return;

    setIsLeaving(true);
    try {
      await leaveWorkspace(activeWorkspace.id);
      toast.success("Success leaving workspace");
      navigate("/");
    } catch {
      toast.error("Failed to leave workspace");
    } finally {
      setIsLeaving(false);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <LogOut /> Leave
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to leave this workspace?
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeaving}
            disabled={isLeaving}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isLeaving ? (
              <>
                <Spinner />
                Leaving...
              </>
            ) : (
              "Leave"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
