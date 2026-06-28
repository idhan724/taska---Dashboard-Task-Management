import KanbanColumn from "@/components/kanban/KanbanColumn";
import { Progress } from "@/components/ui/progress";
import { getProjectColor } from "@/lib/utils";
import { useTaskStore } from "@/store/taskStore";
import { useParams } from "react-router-dom";
import { DragDropProvider } from "@dnd-kit/react";
import type { Task } from "@/types";
import { toast } from "sonner";

export default function KanbanBoard() {
  const { tasks, updateTask } = useTaskStore();
  const { projectId } = useParams();

  const projectTasks = tasks.filter((t) => t.project_id === projectId);
  const taskCount = projectTasks.length;
  const completedCount = projectTasks.filter((t) => t.status === "done").length;
  const percent =
    taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;

  const projectColor = projectTasks[0]?.projects?.color;
  return (
    <DragDropProvider
      onDragEnd={async (e) => {
        if (e.canceled) return;

        const taskId = e.operation.source?.id;
        const newStatus = e.operation.target?.id;

        if (!taskId || !newStatus) return;

        try {
          await updateTask(String(taskId), {
            status: newStatus as Task["status"],
          });
        } catch {
          toast.error(useTaskStore.getState().error ?? "Failed to update task");
        }
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

      <KanbanColumn tasks={projectTasks} />
    </DragDropProvider>
  );
}
