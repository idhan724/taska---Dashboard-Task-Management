import { motion } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { statusProject } from "@/data/staticData";
import { useTaskStore } from "@/store/taskStore";
import { Progress } from "@/components/ui/progress";
import { getProjectColor } from "@/lib/utils";
import type { Project } from "@/types";
import EditProjectButton from "@/components/project/EditProjectButton";
import DeleteProjectButton from "@/components/project/DeleteProjectButton";

interface ProjectCardsProps {
  projects: Project[];
  isLoading?: boolean;
}

export default function ProjectCards({
  projects,
  isLoading,
}: ProjectCardsProps) {
  const { tasks } = useTaskStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
      {isLoading ? (
        [...Array(projects.length)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))
      ) : projects.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          there's no projects
        </p>
      ) : (
        projects.map((project, i) => {
          const taskCount = tasks.filter(
            (t) => t.project_id === project.id,
          ).length;
          const completedCount = tasks.filter(
            (t) => t.project_id === project.id && t.status === "done",
          ).length;
          const percent =
            taskCount > 0 ? Math.round((completedCount / taskCount) * 100) : 0;
          return (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card
                className={`hover:shadow-md hover:scale-105 ${getProjectColor(project.color).ringHover} transition-all duration-200`}
              >
                <CardContent>
                  <div className="flex items-center justify-between py-4">
                    <h3 className="font-semibold">{project.name}</h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusProject[project.status].className}`}
                    >
                      {statusProject[project.status]?.label}
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
                    indicatorClassName={getProjectColor(project.color).bg}
                  />
                  <div className="flex items-center mt-4">
                    <EditProjectButton project={project} />
                    <DeleteProjectButton project={project} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })
      )}
    </div>
  );
}
