import { CheckCircle2, Circle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Task } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface RecentTasksProps {
  tasks: Task[];
  isLoading: boolean;
}

const priorityStyle: Record<string, string> = {
  high: "bg-red-50 text-red-600",
  medium: "bg-amber-50 text-amber-600",
  low: "bg-green-50 text-green-600",
};

export function RecentTasks({ tasks, isLoading }: RecentTasksProps) {
  const recent = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updated_at ?? b.created_at).getTime() -
        new Date(a.updated_at ?? a.created_at).getTime(),
    )
    .slice(0, 5);

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Recent tasks</h3>
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between px-4 py-3"
              >
                <Skeleton className="h-4 w-full" />
              </div>
            ))
          ) : recent.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-8">
              there's no Task
            </p>
          ) : (
            recent.map((task, i) => (
              <div
                key={task.id}
                className={`flex items-center justify-between px-4 py-3 ${
                  i < recent.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {task.status === "done" ? (
                    <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                  ) : task.status === "in-progress" ? (
                    <Clock className="w-4 h-4 text-blue-500 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span
                    className={`text-sm truncate ${
                      task.status === "done"
                        ? "line-through text-muted-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {task.title}
                  </span>
                </div>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ml-2 ${
                    priorityStyle[task.priority] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
