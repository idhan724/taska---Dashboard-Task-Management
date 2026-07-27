import * as React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { toast } from "sonner";
import DeleteWorkspaceButton from "@/components/settings/DeleteWorkspaceButton";
import { useAuthStore } from "@/store/authStore";
import LeaveWorkspaceButton from "./LeaveWorkspaceButton";

export default function WorkspaceTabs() {
  const { profile } = useAuthStore();
  const { activeWorkspace, updateWorkspaces } = useWorkspaceStore();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [name, setName] = React.useState(activeWorkspace?.name ?? "");

  const isOwner = activeWorkspace?.owner_id === profile?.id;

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

    setIsUpdating(true);
    try {
      await updateWorkspaces(activeWorkspace.id, { name: name });
      toast.success("Workspace renamed");
    } catch {
      toast.error(
        useWorkspaceStore.getState().error ?? "Failed to update workspace",
      );
    } finally {
      setIsUpdating(false);
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
            disabled={!isOwner}
            required
          />
        </div>

        <Button type="submit" disabled={isUpdating || !isOwner}>
          {isUpdating ? "Saving..." : "Rename workspace"}
        </Button>
      </form>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start justify-between gap-4">
        {isOwner ? (
          <>
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
            <DeleteWorkspaceButton />
          </>
        ) : (
          <>
            <div className="space-y-0 5">
              <p className="text-sm font-medium text-foreground">
                Leave workspace
              </p>
              <p className="text-xs text-muted-foreground">
                You will lose access to this workspace and its projects.
              </p>
            </div>
            <LeaveWorkspaceButton />
          </>
        )}
      </div>
    </div>
  );
}
