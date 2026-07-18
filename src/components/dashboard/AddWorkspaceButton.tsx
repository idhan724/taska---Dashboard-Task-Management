import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function AddWorkspaceButton() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const { addWorkspaces } = useWorkspaceStore();
  const [isCreating, setIsCreating] = React.useState(false);
  const navigate = useNavigate();

  const handleCreate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    setIsCreating(true);
    try {
      await addWorkspaces({ name, description });

      const newWorkspace = useWorkspaceStore.getState().activeWorkspace;
      if (newWorkspace) {
        navigate(`/${newWorkspace.id}`);
      }
      setName("");
      setDescription("");
      setIsDialogOpen(false);
    } catch (err) {
      toast.error(
        useWorkspaceStore.getState().error ?? "Failed to add workspace",
      );
    } finally {
      setIsCreating(false);
    }
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Workspace
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name</Label>
            <Input
              id="name"
              placeholder="Team Desain"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description (optional)</Label>
            <Input
              id="desc"
              placeholder="Brief description of the workspace"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? (
              <>
                {" "}
                <Spinner /> Creating...
              </>
            ) : (
              "Create Workspace"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
