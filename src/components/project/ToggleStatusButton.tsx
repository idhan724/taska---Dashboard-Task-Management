import * as React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "@/store/projectStore";
import { Pause, Play } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
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
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export default function ToggleStatusButton() {
  const { projects, updateProject } = useProjectStore();
  const { projectId } = useParams();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const project = projects.find((p) => p.id === projectId);
  const isOnHold = project?.status === "on_hold";

  const handleToggleStatus = async () => {
    if (!project) return;

    setIsUpdating(true);
    try {
      await updateProject(project.id, {
        status: isOnHold ? "active" : "on_hold",
      });
      toast.success(
        isOnHold
          ? `Project "${project.name}" resumed`
          : `Project "${project.name}" put on hold`,
      );
    } catch {
      toast.error(
        useProjectStore.getState().error ?? "Failed to update project",
      );
    } finally {
      setIsUpdating(false);
    }
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          size="lg"
          className={cn(
            isOnHold
              ? "bg-green-50 text-green-500 hover:text-green-600 hover:bg-green-100"
              : "bg-amber-50 text-amber-500 hover:text-amber-600 hover:bg-amber-100",
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={isOnHold ? "play" : "pause"}
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {isOnHold ? <Play /> : <Pause />}
            </motion.span>
          </AnimatePresence>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isOnHold ? "Resume Project" : "Put Project on Hold"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isOnHold
              ? "Are you sure you want to resume this project?"
              : "Are you sure you want to put this project on hold?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleToggleStatus} disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Spinner /> Updating...
              </>
            ) : isOnHold ? (
              "Resume"
            ) : (
              "Put on Hold"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
