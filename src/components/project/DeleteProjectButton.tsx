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
import { useProjectStore } from "@/store/projectStore";
import type { Project } from "@/types";
import { Trash } from "lucide-react";

interface DeleteProjectButtonProps {
  project: Project;
}

export default function DeleteProjectButton({
  project,
}: DeleteProjectButtonProps) {
  const { deleteProject } = useProjectStore();

  const handleDelete = async () => {
    try {
      await deleteProject(project.id);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="sm"
          className="bg-background text-foreground hover:text-red-500 hover:bg-red-50"
        >
          <Trash />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Are you sure you want to delete this project?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All tasks under this project will also
            be deleted.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
