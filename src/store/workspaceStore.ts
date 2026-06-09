import { create } from "zustand";
import {
  getMockStats,
  mockCurrentUser,
  mockMembers,
  mockWorkspaces,
} from "@/data/staticData";
import { isLiveMode, supabase } from "@/lib/supabase";
import type { Project, Stats, Task, Workspace, WorkspaceMember } from "@/types";

const defaultStats: Stats = {
  totalProjects: 0,
  totalTasks: 0,
  todoCount: 0,
  inProgressCount: 0,
  doneCount: 0,
  overdueCount: 0,
  doneThisWeek: 0,
  activeCount: 0,
  onHoldCount: 0,
  completedCount: 0,
  memberCount: 0,
};

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  members: WorkspaceMember[];
  stats: Stats;
  isLoading: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  createWorkspaces: (name: string, description?: string) => Promise<void>;
  updateWorkspaces: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspaces: (id: string) => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => void;
  fetchMembers: (workspaceId: string) => Promise<void>;
  inviteMember: (workspaceId: string, email: string) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  fetchStats: (
    workspaceId: string,
    projectId: string,
    tasks: Task[],
    projects: Project[],
    members: WorkspaceMember[],
  ) => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
}

const createEmptyWorkspace = async (userId: string) => {
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({ name: "My Workspace", description: "", owner_id: userId })
    .select()
    .single();

  if (wsError) throw wsError;

  const { error: memberError } = await supabase
    .from("workspace_members")
    .insert({ workspace_id: workspace.id, user_id: userId, role: "Owner" });

  if (memberError) throw memberError;

  return workspace;
};

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [mockWorkspaces[0]],
  activeWorkspace: mockWorkspaces[0],
  members: mockMembers.filter((m) => m.workspace_id === mockWorkspaces[0].id),
  stats: defaultStats,
  isLoading: false,
  error: null,

  fetchWorkspaces: async () => {
    if (!isLiveMode) return;

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const workspaces = data || [];
      set({ workspaces, activeWorkspace: workspaces[0] ?? null });
    } catch (err) {
      set({ error: "Failed to load workspace" });
    } finally {
      set({ isLoading: false });
    }
  },

  createWorkspaces: async (name, description) => {
    if (!isLiveMode) {
      const newWorkspace: Workspace = {
        id: `ws-${Date.now()}`,
        name,
        description: description ?? null,
        owner_id: mockCurrentUser.id,
        created_at: new Date().toISOString(),
      };

      const newMember: WorkspaceMember = {
        id: `mem-${Date.now()}`,
        workspace_id: newWorkspace.id,
        user_id: mockCurrentUser.id,
        role: "owner",
        invited_by: null,
        joined_at: new Date().toISOString(),
        profile: mockCurrentUser,
      };

      set((state) => ({
        workspaces: [newWorkspace, ...state.workspaces],
        activeWorkspace:
          state.workspaces.length === 0 ? newWorkspace : state.activeWorkspace,
        members: newMember ? [newMember] : state.members,
      }));
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("user not found");

    const { data: workspace, error: wsError } = await supabase
      .from("workspaces")
      .insert({ name, description, owner_id: user.id })
      .select()
      .single();

    if (wsError) throw wsError;

    const { error: memberError } = await supabase
      .from("workspace_members")
      .insert({ workspace_id: workspace.id, user_id: user.id, role: "Owner" });

    if (memberError) throw memberError;

    set((state) => ({
      workspaces: [workspace, ...state.workspaces],
      activeWorkspace:
        state.workspaces.length === 0 ? workspace : state.activeWorkspace,
    }));
  },

  updateWorkspaces: async (id, data) => {
    if (!isLiveMode) {
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === id ? { ...w, ...data } : w,
        ),
        activeWorkspace:
          state.activeWorkspace?.id === id
            ? { ...state.activeWorkspace, ...data }
            : state.activeWorkspace,
      }));
      return;
    }

    const { data: updated, error } = await supabase
      .from("workspaces")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
      activeWorkspace:
        state.activeWorkspace?.id === id ? updated : state.activeWorkspace,
    }));
  },

  deleteWorkspaces: async (id) => {
    if (!isLiveMode) {
      const remainingWorkspaces = get().workspaces.filter((w) => w.id !== id);

      if (remainingWorkspaces.length === 0) {
        const newWorkspace: Workspace = {
          id: `ws-${Date.now()}`,
          name: "My Workspace",
          description: null,
          owner_id: mockCurrentUser.id,
          created_at: new Date().toISOString(),
        };

        const newMember: WorkspaceMember = {
          id: `mem-${Date.now()}`,
          workspace_id: newWorkspace.id,
          user_id: mockCurrentUser.id,
          role: "owner",
          invited_by: null,
          joined_at: new Date().toISOString(),
          profile: mockCurrentUser,
        };

        set({
          workspaces: [newWorkspace],
          activeWorkspace: newWorkspace,
          members: [newMember],
        });
        return;
      }

      set((state) => ({
        workspaces: remainingWorkspaces,
        activeWorkspace:
          state.activeWorkspace?.id === id
            ? remainingWorkspaces[0]
            : state.activeWorkspace,
      }));
      return;
    }

    const { error } = await supabase.from("workspaces").delete().eq("id", id);
    if (error) throw error;

    const remainingWorkspaces = get().workspaces.filter((w) => w.id !== id);

    if (remainingWorkspaces.length === 0) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const newWorkspace = await createEmptyWorkspace(user.id);

      set({ workspaces: [newWorkspace], activeWorkspace: newWorkspace });
      return;
    }

    set((state) => ({
      workspaces: remainingWorkspaces,
      activeWorkspace:
        state.activeWorkspace?.id === id
          ? remainingWorkspaces[0]
          : state.activeWorkspace,
    }));
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace });
  },

  fetchMembers: async (workspaceId) => {
    if (!isLiveMode) {
      set({
        members: mockMembers.filter((m) => m.workspace_id === workspaceId),
      });
      return;
    }
    const { data, error } = await supabase
      .from("workspace_members")
      .select("*, profile:users!workspace_members_user_id_fkey(*)")
      .eq("workspace_id", workspaceId);

    if (error) throw error;
    set({ members: (data as WorkspaceMember[]) || [] });
  },

  inviteMember: async (workspaceId, email) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("User not found");

    const { error } = await supabase.from("workspace_invites").insert({
      workspace_id: workspaceId,
      email,
      invited_by: user.id,
    });

    if (error) throw error;
  },

  removeMember: async (workspaceId, userId) => {
    if (!isLiveMode) {
      set((state) => ({
        members: state.members.filter((m) => m.user_id !== userId),
      }));
      return;
    }

    const { error } = await supabase
      .from("workspace_members")
      .delete()
      .eq("workspace_id", workspaceId)
      .eq("user_id", userId);

    if (error) throw error;

    set((state) => ({
      members: state.members.filter((m) => m.user_id !== userId),
    }));
  },

  fetchStats: async (workspaceId, projectId, tasks, projects, members) => {
    if (!isLiveMode) {
      const mockStats = getMockStats(
        workspaceId,
        projectId,
        tasks,
        projects,
        members,
      );
      set({
        stats: {
          totalProjects: mockStats.totalProjects.length,
          totalTasks: mockStats.totalTasks,
          todoCount: mockStats.todoCount,
          inProgressCount: mockStats.inProgressCount,
          doneCount: mockStats.doneCount,
          overdueCount: mockStats.overdueCount,
          doneThisWeek: mockStats.doneThisWeek,
          activeCount: mockStats.activeCount.length,
          onHoldCount: mockStats.onHoldCount.length,
          completedCount: mockStats.completedCount.length,
          memberCount: mockStats.memberCount,
        },
      });
      return;
    }

    try {
      const [tasksResult, projectsResult, membersResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, status, due_date, updated_at")
          .eq("workspace_id", workspaceId),
        supabase
          .from("projects")
          .select("id, status")
          .eq("workspace_id", workspaceId),
        supabase
          .from("workspace_members")
          .select("id", { count: "exact" })
          .eq("workspace_id", workspaceId),
      ]);

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());

      const allTasks = tasksResult.data ?? [];
      const allProjects = projectsResult.data ?? [];

      set({
        stats: {
          totalProjects: allProjects.length,
          totalTasks: allTasks.length,
          todoCount: allTasks.filter((t) => t.status === "todo").length,
          inProgressCount: allTasks.filter((t) => t.status === "in-progress")
            .length,
          doneCount: allTasks.filter((t) => t.status === "done").length,
          overdueCount: allTasks.filter(
            (t) =>
              t.due_date && new Date(t.due_date) < today && t.status !== "done",
          ).length,
          doneThisWeek: allTasks.filter(
            (t) =>
              t.status === "done" &&
              t.updated_at &&
              new Date(t.updated_at) >= startOfWeek,
          ).length,
          activeCount: allProjects.filter((p) => p.status === "active").length,
          onHoldCount: allProjects.filter((p) => p.status === "on_hold").length,
          completedCount: allProjects.filter((p) => p.status === "completed")
            .length,
          memberCount: membersResult.count ?? 0,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat stats";
      set({ error: message });
    }
  },

  leaveWorkspace: async (workspaceId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await get().removeMember(workspaceId, user.id);
    set((state) => {
      const remaining = state.workspaces.filter((w) => w.id !== workspaceId);
      return {
        workspaces: remaining,
        activeWorkspace:
          state.activeWorkspace?.id === workspaceId
            ? (remaining[0] ?? null)
            : state.activeWorkspace,
      };
    });
  },
}));
