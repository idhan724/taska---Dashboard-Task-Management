import { Card, CardContent } from "@/components/ui/card";
import { useTaskStore } from "@/store/taskStore";
import type { Project } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

interface ProjectOverviewProps {
  projects: Project[];
  isLoading: boolean;
}

const statusLabel: Record<string, { label: string; className: string }> = {
  active: {
    label: "active",
    className: "bg-emerald-50 text-emerald-700",
  },
  on_hold: {
    label: "on hold",
    className: "bg-amber-50 text-amber-700",
  },
  completed: {
    label: "completed",
    className: "bg-blue-50 text-blue-700",
  },
};

export function ProjectOverview({ projects, isLoading }: ProjectOverviewProps) {
  const { tasks } = useTaskStore();

  const recent = [...projects]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )
    .slice(0, 4);

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Projects</h3>
      <div className="flex flex-col gap-2">
        {isLoading ? (
          [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)
        ) : recent.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm py-8">
            there's no projects
          </p>
        ) : (
          recent.map((project) => {
            const taskCount = tasks.filter(
              (t) => t.project_id === project.id,
            ).length;
            const completedCount = tasks.filter(
              (t) => t.project_id === project.id && t.status === "done",
            ).length;
            const percent =
              taskCount > 0
                ? Math.round((completedCount / taskCount) * 100)
                : 0;

            const status = statusLabel[project.status] ?? {
              label: project.status,
              className: "bg-gray-100 text-gray-600",
            };

            return (
              <Card key={project.id}>
                <CardContent className="pt-3 pb-3 px-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ background: project.color ?? "#888" }}
                      />
                      <span className="text-sm font-medium">
                        {project.name}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                    <span>
                      {completedCount ?? 0} / {taskCount ?? 0} tasks
                    </span>
                    <span>{percent}%</span>
                  </div>
                  <Progress
                    value={percent}
                    indicatorStyle={{ background: project.color ?? "#888" }}
                  />
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
