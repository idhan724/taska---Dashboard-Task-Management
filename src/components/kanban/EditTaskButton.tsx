import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTaskStore } from "@/store/taskStore";
import type { Task } from "@/types";
import { toast } from "sonner";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface EditTaskButtonProps {
  task: Task;
}

export default function EditTaskButton({ task }: EditTaskButtonProps) {
  const { updateTask } = useTaskStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [name, setName] = React.useState(task.title);
  const [description, setDescription] = React.useState("");
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    try {
      await updateTask(task.id, { title: name, description });
      setName("");
      setDescription("");
      setIsDialogOpen(false);
    } catch {
      toast.error(useTaskStore.getState().error ?? "Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="bg-background text-neutral-400 hover:text-red-500 hover:bg-red-50"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <Edit2 size={11} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Task Name</Label>
            <Input
              id="name"
              placeholder="Name of the task"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Input
              id="desc"
              placeholder="Brief description of the project"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Task"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
