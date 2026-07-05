import * as React from "react";
import type { Project } from "@/types";
import { useProjectStore } from "@/store/projectStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

interface EditProjectButtonProps {
  project: Project;
}

export default function EditProjectButton({ project }: EditProjectButtonProps) {
  const { updateProject } = useProjectStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [name, setName] = React.useState(project.name);
  const [description, setDescription] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    try {
      await updateProject(project.id, {
        name,
        description,
      });
      setName("");
      setDescription("");
      setIsDialogOpen(false);
    } catch {
      toast.error(
        useProjectStore.getState().error ?? "Failed to update project",
      );
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          onClick={(e) => e.stopPropagation()}
          className="bg-background text-foreground hover:text-blue-500 hover:bg-blue-50"
        >
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Project</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Project Name</Label>
            <Input
              id="name"
              placeholder="Name of the project"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Spinner />
                Updating...
              </>
            ) : (
              "Update Project"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
