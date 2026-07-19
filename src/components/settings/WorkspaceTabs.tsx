import * as React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function WorkspaceTabs() {
  const { activeWorkspace, updateWorkspaces, deleteWorkspaces, isSubmitting } =
    useWorkspaceStore();
  const [name, setName] = React.useState(activeWorkspace?.name ?? "");
  const [confirmName, setConfirmName] = React.useState("");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const navigate = useNavigate();

  const isConfirmed = confirmName.trim() === activeWorkspace?.name;
  React.useEffect(() => {
    setName(activeWorkspace?.name ?? "");
  }, [activeWorkspace?.id]);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim() || !activeWorkspace) return;
    if (name.trim() === activeWorkspace.name) {
      toast.info("Nothing changed");
      return;
    }

    try {
      await updateWorkspaces(activeWorkspace.id, { name: name });
      toast.success("Workspace renamed");
    } catch {
      toast.error(
        useWorkspaceStore.getState().error ?? "Failed to update workspace",
      );
    }
  };

  const handleDelete = async () => {
    if (!activeWorkspace || !isConfirmed) return;

    try {
      await deleteWorkspaces(activeWorkspace.id);
      toast.success("Workspace deleted");
      navigate("/");
    } catch {
      toast.error("Failed to delete workspace");
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-6 space-y-5">
      <div>
        <h2 className="text-sm font-semibold text-foreground">
          Workspace name
        </h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          The workspace name is shown in the sidebar and on all shared views.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label
            className="text-xs font-medium text-muted-foreground"
            htmlFor="ws-name"
          >
            Name
          </Label>
          <Input
            id="ws-name"
            placeholder="My Workspace"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Rename workspace"}
        </Button>
      </form>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start justify-between gap-4">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">
            Delete workspace
          </p>
          <p className="text-xs text-muted-foreground">
            Permanently delete{" "}
            <span className="font-medium text-foreground">
              {activeWorkspace?.name}
            </span>{" "}
            and all its projects, tasks, and members. This cannot be undone.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">Delete</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete workspace?</DialogTitle>
            </DialogHeader>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-foreground">
                {activeWorkspace?.name}
              </span>{" "}
              along with all projects and tasks inside it.
            </DialogDescription>
            <Label
              className="text-xs font-medium text-muted-foreground"
              htmlFor="confirm-name"
            >{`Type "${activeWorkspace?.name}" to confirm`}</Label>
            <Input
              id="confirm-name"
              placeholder={activeWorkspace?.name}
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              autoFocus
            />
            <DialogClose>Cancel</DialogClose>
            <Button
              onClick={handleDelete}
              disabled={!isConfirmed || isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting ? "Deleting…" : "Yes, delete workspace"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
