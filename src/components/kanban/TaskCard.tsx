import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/types";
import { CalendarIcon, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@dnd-kit/react";
import { cn } from "@/lib/utils";
import EditTaskButton from "@/components/kanban/EditTaskButton";
import DeleteTaskButton from "./DeleteTaskButton";
import { useProjectStore } from "@/store/projectStore";

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 1000 / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const priorityColor: Record<string, string> = {
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-green-500",
};

interface TaskCardProps {
  task: Task;
  isOverlay?: boolean;
}

export default function TaskCard({ task, isOverlay }: TaskCardProps) {
  const projects = useProjectStore((s) => s.projects);
  const project = projects.find((p) => p.id === task.project_id);
  const isOnHold = project?.status === "on_hold";
  const { ref, isDragging } = useDraggable({
    id: task.id,
    disabled: isOverlay || isOnHold,
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const isOverdue =
    task.due_date && new Date(task.due_date) < today && task.status !== "done";
  return (
    <Card
      ref={ref}
      className={cn(
        "relative transition-opacity",
        isOnHold
          ? "cursor-not-allowed"
          : isDragging
            ? "opacity-40 cursor-grabbing"
            : "cursor-grab opacity-100",
        isOnHold && "bg-foreground/10",
      )}
    >
      <div
        className={cn(
          "absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full",
          priorityColor[task.priority],
        )}
      />
      <CardContent>
        <span
          className={cn(
            "text-xs font-medium px-2 py-0.5 rounded",
            priorityColor[task.priority],
          )}
        >
          {task.priority}
        </span>
        <h3 className="text-sm font-medium mt-2">{task.title}</h3>
        {task.description && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        <Separator className="mt-3" />
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-[10px] text-slate-400">Due date: </span>
            <div
              className={cn(
                "flex items-center gap-1 mt-3 text-xs text-muted-foreground",
                isOverdue && "text-red-500",
              )}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{task.due_date ?? "No due date"}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400">
              {task.updated_at ? "Updated at: " : "Created at: "}
            </span>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo(task.updated_at ?? task.created_at)}</span>
            </div>
          </div>
        </div>
        {!isOverlay && (
          <div className="flex items-center absolute top-2 right-0 p-1 opacity-0 group-hover/card:opacity-100 transition-opacity text-neutral-400">
            <EditTaskButton task={task} isOnHold={isOnHold} />
            <DeleteTaskButton task={task} isOnHold={isOnHold} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
