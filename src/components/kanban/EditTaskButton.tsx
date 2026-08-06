import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTaskStore } from "@/store/taskStore";
import type { Priority, Task } from "@/types";
import { toast } from "sonner";
import { CalendarIcon, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn, formatDisplayDate, toISODateString } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useParams } from "react-router-dom";

interface EditTaskButtonProps {
  task: Task;
  isPaused: boolean;
}

export default function EditTaskButton({
  task,
  isPaused,
}: EditTaskButtonProps) {
  const { updateTask } = useTaskStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [name, setName] = React.useState(task.title);
  const [dueDate, setDueDate] = React.useState<Date | undefined>(
    task.due_date ? new Date(task.due_date) : undefined,
  );
  const [priority, setPriority] = React.useState<Priority>(task.priority);
  const [description, setDescription] = React.useState(task.description || "");
  const [isUpdating, setIsUpdating] = React.useState(false);
  const { workspaceId, projectId } = useParams();

  const handleUpdate = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsUpdating(true);
    try {
      await updateTask(task.id, {
        title: name,
        description: description || null,
        due_date: dueDate ? toISODateString(dueDate) : null,
        workspace_id: workspaceId,
        project_id: projectId,
        priority,
      });
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
          disabled={isPaused}
          className="bg-background text-neutral-400 hover:text-blue-500 hover:bg-blue-50"
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
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Name of the task"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Due date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? formatDisplayDate(dueDate) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    className="rounded-lg border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={priority}
                onValueChange={(v) => setPriority(v as Priority)}
              >
                <SelectTrigger id="priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? (
              <>
                <Spinner /> Updating...
              </>
            ) : (
              "Update Task"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
