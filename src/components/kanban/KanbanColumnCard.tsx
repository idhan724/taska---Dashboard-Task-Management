import { useTaskStore } from "@/store/taskStore";
import { useDroppable } from "@dnd-kit/react";
import type { columns } from "@/components/kanban/KanbanColumn";
import AddTaskButton from "@/components/kanban/AddTaskButton";
import TaskCard from "@/components/kanban/TaskCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useProjectStore } from "@/store/projectStore";

interface KanbanColumnCardProps {
  column: (typeof columns)[number];
  projectId: string;
}

export default function KanbanColumnCard({
  column,
  projectId,
}: KanbanColumnCardProps) {
  const projects = useProjectStore((s) => s.projects);
  const project = projects.find((p) => p.id === projectId);
  const isOnHold = project?.status === "on_hold";
  const { getTasksByStatus } = useTaskStore();
  const taskByStatus = getTasksByStatus(projectId, column.id);
  const { ref, isDropTarget } = useDroppable({ id: column.id });

  return (
    <div
      key={column.id}
      ref={ref}
      className={cn(
        "flex flex-col rounded-2xl p-4 min-h-55 transition-all duration-200 shadow-sm",
        isOnHold
          ? "bg-muted-foreground/10 ring-1 ring-muted-foreground/10"
          : "ring-1 ring-foreground/10 ",
        isDropTarget && "bg-neutral-100 ring-2 ring-dashed ring-neutral-300",
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full shrink-0 ${column.color}`} />
          <h2 className="text-lg font-semibold text-neutral-700 tracking-tight">
            {column.title}
          </h2>
          <span className="text-sm text-neutral-400 bg-neutral-200 px-2 py-0.5 rounded-full tabular-nums">
            {taskByStatus.length}
          </span>
        </div>

        <AddTaskButton
          status={column.id}
          trigger={
            <Button
              variant="ghost"
              disabled={isOnHold}
              size="sm"
              className="text-neutral-400 hover:text-neutral-700 rounded-lg"
            >
              <Plus size={14} />
            </Button>
          }
        />
      </div>

      <Separator className="mb-3 opacity-50" />

      <div className="flex flex-col gap-2 flex-1">
        {taskByStatus.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-8">
            <p className="text-sm text-neutral-400 ">No tasks yet</p>
          </div>
        ) : (
          taskByStatus.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>

      <AddTaskButton
        status={column.id}
        trigger={
          <Button
            variant="ghost"
            disabled={isOnHold}
            size="sm"
            className="mt-3 w-full text-[12px] text-neutral-400 border border-dashed border-neutral-300 dark:border-neutral-700 rounded-xl h-8 hover:bg-white dark:hover:bg-neutral-700/50 hover:text-neutral-600 hover:border-neutral-400 transition"
          >
            <Plus size={11} className="mr-1" />
            Add task
          </Button>
        }
      />
    </div>
  );
}
