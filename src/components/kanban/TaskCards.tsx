import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/types";
import { CalendarIcon, Clock } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useDraggable } from "@dnd-kit/react";

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

interface KanbanColumnProps {
  tasks: Task;
}

function TaskCards({ tasks }: KanbanColumnProps) {
  const { ref, isDragging } = useDraggable({ id: tasks.id });
  return (
    <Card
      ref={ref}
      className="relative transition-opacity"
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: isDragging ? "grabbing" : "grab",
      }}
    >
      <div
        className={`absolute left-0 top-3 bottom-3 w-0.75 rounded-r-full ${priorityColor[tasks.priority]}`}
      />
      <CardContent>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded ${priorityColor[tasks.priority]}`}
        >
          {tasks.priority}
        </span>
        <h3 className="text-sm font-medium mt-2">{tasks.title}</h3>
        {tasks.description && (
          <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2">
            {tasks.description}
          </p>
        )}
        <Separator className="mt-3" />
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-[10px] text-slate-400">Due date: </span>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>{tasks.due_date ?? "No due date"}</span>
            </div>
          </div>
          <div>
            <span className="text-[10px] text-slate-400">
              {tasks.updated_at ? "Updated at: " : "Created at: "}
            </span>
            <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeAgo(tasks.updated_at ?? tasks.created_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskCards;
