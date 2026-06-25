import type { Task } from "@/types";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { Separator } from "../ui/separator";

interface KanbanColumnProps {
  tasks: Task[];
}

export default function KanbanColumn({ tasks }: KanbanColumnProps) {
  const columns = [
    { id: "todo", title: "To Do", color: "bg-blue-500", order: 0 },
    {
      id: "in-progress",
      title: "In Progress",
      color: "bg-yellow-500",
      order: 1,
    },
    { id: "done", title: "Done", color: "bg-green-500", order: 2 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl ring-1 ring-foreground/10 shadow-md ">
      {columns.map((column) => {
        const taskByStatus = tasks.filter((task) => task.status === column.id);
        return (
          <div
            key={column.id}
            className="flex flex-col rounded-2xl p-4 min-h-55 transition-all duration-200"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full shrink-0 ${column.color}`}
                />
                <h2 className="text-lg font-semibold text-neutral-700 tracking-tight">
                  {column.title}
                </h2>
                <span className="text-sm text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded-full tabular-nums">
                  {taskByStatus.length}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-neutral-400 hover:text-neutral-700 rounded-lg"
              >
                <Plus size={14} />
              </Button>
            </div>

            <Separator className="mb-3 opacity-50" />

            <div className="flex flex-col gap-2 flex-1">
              {taskByStatus.length === 0 ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <p className="text-sm text-neutral-400 ">No tasks yet</p>
                </div>
              ) : (
                taskByStatus.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 rounded-lg p-3 shadow-sm"
                  >
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">
                      {task.title}
                    </p>
                  </div>
                ))
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full text-[12px] text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl h-8 hover:bg-white dark:hover:bg-neutral-700/50 hover:text-neutral-600 hover:border-neutral-400 transition"
            >
              <Plus size={11} className="mr-1" />
              Add task
            </Button>
          </div>
        );
      })}
    </div>
  );
}
