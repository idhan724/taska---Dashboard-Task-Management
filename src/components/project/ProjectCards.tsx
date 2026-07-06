import { motion } from "motion/react";
import { Card, CardContent } from "@/components/ui/card";
import { useTaskStore } from "@/store/taskStore";
import { Progress } from "@/components/ui/progress";
import { cn, getProjectColor, statusProject } from "@/lib/utils";
import type { Project } from "@/types";
import EditProjectButton from "@/components/project/EditProjectButton";
import DeleteProjectButton from "@/components/project/DeleteProjectButton";
import { Link, useParams } from "react-router-dom";

interface ProjectCardProps {
  project: Project;
  i: number;
}

export default function ProjectCard({ project, i }: ProjectCardProps) {
  const { tasks } = useTaskStore();
  const { workspaceId } = useParams();

  const taskCount = tasks.filter((t) => t.project_id === project.id).length;
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
      className={cn(
        "relative hover:shadow-md hover:scale-105 transition-all duration-200",
        getProjectColor(project.color).ringHover,
      )}
    >
      <Link
        to={`/${workspaceId}/projects/${project.id}`}
        className="absolute inset-0 z-0"
      />
      <Card className="relative z-10 pointer-events-none">
        <CardContent>
          <div className="flex items-center justify-between py-4">
            <h3 className="font-semibold">{project.name}</h3>
            <span
              className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusProject[project.status].className}`}
            >
              {statusProject[project.status]?.label}
            </span>
          </div>
          {project.description && (
            <p className="mb-4 text-xs text-muted-foreground line-clamp-2">
              {project.description}
            </p>
          )}
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
          <div className="flex items-center mt-4 relative z-20 pointer-events-auto">
            <EditProjectButton project={project} />
            <DeleteProjectButton project={project} />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
