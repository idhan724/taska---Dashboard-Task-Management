import { motion } from "motion/react";
import { useTaskStore } from "@/store/taskStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Zap } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { isLiveMode } from "@/lib/supabase";
import { StatsCards } from "@/components/dashboard/StatsCard";
import { useAuthStore } from "@/store/authStore";
import { TaskOverview } from "@/components/dashboard/TaskOverview";
import { ProjectOverview } from "@/components/dashboard/ProjectOverview";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import AddWorkspaceButton from "@/components/dashboard/AddWorkspaceButton";

export default function Dashboard() {
  const { profile } = useAuthStore();
  const { tasks, isFetching: isFetchingTasks } = useTaskStore();
  const { projects, isFetching: isFetchingProjects } = useProjectStore();
  const { members, isFetching: isFetchingWorkspace } = useWorkspaceStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    totalMember: members.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    overdue: tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < today && t.status !== "done",
    ).length,
    doneThisWeek: tasks.filter(
      (t) =>
        t.status === "done" &&
        t.updated_at &&
        new Date(t.updated_at) >= startOfWeek,
    ).length,
    active: projects.filter((t) => t.status === "active").length,
    paused: projects.filter((t) => t.status === "paused").length,
    completed: projects.filter((t) => t.status === "completed").length,
  };

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between gap-2 mb-1">
          <div>
            <h2 className="text-2xl font-bold">
              Good morning, {profile?.full_name?.split(" ")[0]}
            </h2>
            <p className="text-muted-foreground text-sm">
              Here's what's happening across your team today.
            </p>
          </div>
          <AddWorkspaceButton />
        </div>
      </motion.div>

      {isLiveMode ? (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-300/10 text-primary rounded-full text-xs font-medium border border-primary/20">
          <Zap size={11} />
          Live Mode
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-medium border border-primary/20">
          <span className="relative inline-flex">
            <Zap size={11} />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="w-[160%] h-[1.5px] bg-current -rotate-45 opacity-70" />
            </span>
          </span>
          Demo Mode — Using static data. Add Supabase credentials to connect
          live database.
        </div>
      )}

      <StatsCards
        stats={stats}
        isLoading={isFetchingWorkspace || isFetchingTasks || isFetchingProjects}
      />

      <TaskOverview
        todo={stats.todo}
        inProgress={stats.inProgress}
        done={stats.done}
        overdue={stats.overdue}
        totalTasks={stats.totalTasks}
        isLoading={isFetchingTasks}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectOverview projects={projects} isLoading={isFetchingProjects} />
        <RecentTasks tasks={tasks} isLoading={isFetchingTasks} />
      </div>
    </div>
  );
}
