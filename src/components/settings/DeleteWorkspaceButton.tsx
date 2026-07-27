import * as React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useNavigate } from "react-router-dom";

export default function DeleteWorkspaceButton() {
  const { activeWorkspace, deleteWorkspaces } = useWorkspaceStore();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!activeWorkspace) return;

    setIsDeleting(true);
    try {
      await deleteWorkspaces(activeWorkspace.id);
      toast.success("Workspace deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete workspace");
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          <Trash /> Delete
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this workspace?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete
            <span className="font-semibold text-foreground">
              {activeWorkspace?.name}
            </span>
            along with all projects and tasks inside it.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {isDeleting ? (
              <>
                <Spinner />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
