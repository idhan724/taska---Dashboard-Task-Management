import { useTaskStore } from "@/store/taskStore";
import { useParams } from "react-router-dom";
import KanbanColumnCard from "@/components/kanban/KanbanColumnCard";
import { Skeleton } from "@/components/ui/skeleton";

export const columns = [
  { id: "todo", title: "To Do", color: "bg-blue-500", order: 0 },
  {
    id: "in-progress",
    title: "In Progress",
    color: "bg-yellow-500",
    order: 1,
  },
  { id: "done", title: "Done", color: "bg-green-500", order: 2 },
] as const;

export default function KanbanColumn() {
  const { isFetching } = useTaskStore();
  const { projectId } = useParams();

  if (!projectId) return;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {isFetching
        ? [...Array(columns.length)].map((_, i) => (
            <Skeleton key={i} className="min-h-screen" />
          ))
        : columns.map((column) => (
            <KanbanColumnCard
              key={column.id}
              column={column}
              projectId={projectId}
            />
          ))}
    </div>
  );
}
