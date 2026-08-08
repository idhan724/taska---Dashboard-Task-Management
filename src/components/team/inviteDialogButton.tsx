import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Copy, Check, RefreshCw } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { isLiveMode } from "@/lib/supabase";

export default function inviteDialogButton() {
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [link, setLink] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [isCopied, setIsCopied] = React.useState(false);
  const { activeWorkspace, getInviteLink, regenerateInviteLink } =
    useWorkspaceStore();

  React.useEffect(() => {
    if (!isDialogOpen || !activeWorkspace) return;

    const run = async () => {
      setIsLoading(true);
      try {
        const getLink = await getInviteLink(activeWorkspace.id);
        setLink(getLink);
      } catch {
        toast.error(
          useWorkspaceStore.getState().error ?? "Failed to get invite link",
        );
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [isDialogOpen]);

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setIsCopied(true);
    toast.success("Copy link to clipboard");
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRegenerate = async () => {
    if (!activeWorkspace) return;
    setIsRegenerating(true);
    try {
      const newLink = await regenerateInviteLink(activeWorkspace.id);
      setLink(newLink);
      toast.success("Create new link");
    } catch {
      toast.error(
        useWorkspaceStore.getState().error ?? "Failed to make new link",
      );
    } finally {
      setIsRegenerating(false);
    }
  };
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button disabled={!isLiveMode}>
          <Plus className="w-4 h-4 mr-2" />
          Invite
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite to workspace</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Share this link to invite members to join this workspace.
          </p>

          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner />
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Input readOnly value={link ?? ""} className="text-xs" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  disabled={!link}
                >
                  {isCopied ? <Check /> : <Copy />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleRegenerate}
                  disabled={isLoading || isRegenerating}
                >
                  {isRegenerating ? <Spinner /> : <RefreshCw />}
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Old links automatically stop working once a new link is created.
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
