import * as React from "react";
import KanbanColumn from "@/components/kanban/KanbanColumn";
import { Progress } from "@/components/ui/progress";
import { getProjectColor } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import { useParams } from "react-router-dom";
import { DragDropProvider, DragOverlay } from "@dnd-kit/react";
import type { Task } from "@/types";
import { toast } from "sonner";
import TaskCards from "@/components/kanban/TaskCard";

export default function KanbanBoard() {
  const { tasks, moveTask } = useTaskStore();
  const { projectId } = useParams();
  const [activeCard, setActiveCard] = React.useState<Task | null>(null);

  const projectTasks = tasks.filter((t) => t.project_id === projectId);
  const taskCount = projectTasks.length;
  const completedCount = projectTasks.filter((t) => t.status === "done").length;
  const percent =
    taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  const projectColor = projectTasks[0]?.projects?.color;
  return (
    <DragDropProvider
      onDragStart={(event) => {
        const { source } = event.operation;
        const task = tasks.find((t) => t.id === source?.id);
        setActiveCard(task ?? null);
      }}
      onDragOver={(event) => {
        const { source, target } = event.operation;
        if (!source || !target) return;

        const currentTask = tasks.find((t) => t.id === source.id);
        if (!currentTask) return;

        const newStatus = target.id as Task["status"];
        if (currentTask.status !== newStatus) {
          moveTask(currentTask.id, newStatus).catch(() => {
            toast.error(useTaskStore.getState().error ?? "Failed to move task");
          });
        }
      }}
      onDragEnd={async (e) => {
        setActiveCard(null);
        if (e.canceled) return;
      }}
    >
      <div className="flex items-center justify-between p-4 mb-5">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <div className="w-50 ring-1 ring-foreground/10 rounded-xl p-4 shadow-md">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
            <span>
              {completedCount ?? 0} / {taskCount ?? 0} tasks
            </span>
            <span>{percent}%</span>
          </div>
          <Progress
            value={percent}
            indicatorClassName={getProjectColor(projectColor || "").bg}
          />
        </div>
      </div>

      <KanbanColumn />

      <DragOverlay
        dropAnimation={{
          duration: 180,
          easing: "cubic-bezier(0.18,0.67,0.6,1.22)",
        }}
      >
        {activeCard ? (
          <div className="rotate-1 scale-105 shadow-xl opacity-95">
            <TaskCards task={activeCard} isOverlay />
          </div>
        ) : null}
      </DragOverlay>
    </DragDropProvider>
  );
}
