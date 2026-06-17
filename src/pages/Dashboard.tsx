import { motion } from "motion/react";
import * as React from "react";
import { useParams } from "react-router-dom";
import { useTaskStore } from "@/store/taskStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Plus, Zap } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { isLiveMode } from "@/lib/supabase";
import { StatsCards } from "@/components/dashboard/StatsCard";
import { useAuthStore } from "@/store/authStore";
import { TaskOverview } from "@/components/dashboard/TaskOverview";
import { ProjectOverview } from "@/components/dashboard/ProjectOverview";
import { RecentTasks } from "@/components/dashboard/RecentTasks";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function Dashboard() {
  const { workspaceId } = useParams();
  const { profile } = useAuthStore();
  const { tasks, fetchTasks } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();
  const { members, fetchMembers, createWorkspaces, isLoading } =
    useWorkspaceStore();
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [isCreating, setIsCreating] = React.useState(false);

  React.useEffect(() => {
    if (!workspaceId) return;
    fetchTasks(workspaceId);
    fetchProjects(workspaceId);
    fetchMembers(workspaceId);
  }, [workspaceId]);

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
    onHold: projects.filter((t) => t.status === "on_hold").length,
    completed: projects.filter((t) => t.status === "completed").length,
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      await createWorkspaces(name, description);
      setName("");
      setDescription("");
      setIsDialogOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCreating(false);
    }
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Workspace
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Workspace</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Workspace Name</Label>
                  <Input
                    id="name"
                    placeholder="Contoh: Tim Desain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description (optional)</Label>
                  <Input
                    id="desc"
                    placeholder="Brief description of the workspace"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Workspace"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
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

      <StatsCards stats={stats} isLoading={isLoading} />

      <TaskOverview
        todo={stats.todo}
        inProgress={stats.inProgress}
        done={stats.done}
        overdue={stats.overdue}
        totalTasks={stats.totalTasks}
        isLoading={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ProjectOverview projects={projects} isLoading={isLoading} />
        <RecentTasks tasks={tasks} isLoading={isLoading} />
      </div>
    </div>
  );
}
