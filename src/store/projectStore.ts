import { create } from "zustand";
import { getMockProjectByWorkspace, mockProjects } from "@/data/staticData";
import { isLiveMode, supabase } from "@/lib/supabase";
import type { Project, ProjectFilters, ProjectStatus, Task } from "@/types";
import { getRandomProjectColor } from "@/lib/utils";

const defaultFiltersProjects: ProjectFilters = {
  search: "",
  status: "all",
};

interface ProjectStore {
  projects: Project[];
  filters: ProjectFilters;
  isFetching: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchProjects: (workspaceId: string) => Promise<void>;
  addProject: (
    project: Omit<Project, "id" | "created_at" | "color" | "status">,
  ) => Promise<void>;
  updateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  updateProjectStatus: (id: string, tasks: Task[]) => void;
  deleteProject: (id: string) => Promise<void>;
  setFilter: (filters: Partial<ProjectFilters>) => void;
  resetFilters: () => void;
  getFilteredProjects: () => Project[];
  getProjectByStatus: (status: ProjectStatus) => Project[];
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  filters: defaultFiltersProjects,
  isFetching: false,
  isSubmitting: false,
  error: null,
  fetchProjects: async (workspaceId) => {
    set({ isFetching: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      const filtered = getMockProjectByWorkspace(workspaceId, mockProjects);
      set({ projects: filtered, isFetching: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("workspace_id", workspaceId);

      if (error) throw error;
      set({ projects: (data as unknown as Project[]) || [] });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed load project";
      set({ error: message });
    } finally {
      set({ isFetching: false });
    }
  },
  addProject: async (project) => {
    set({ isSubmitting: true, error: null });
    const projectData = {
      ...project,
      color: getRandomProjectColor(),
      status: "active" as ProjectStatus,
    };
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      const newProject: Project = {
        ...projectData,
        id: `t${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      set((state) => ({
        projects: [newProject, ...state.projects],
        isSubmitting: false,
      }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .insert(projectData)
        .select("*")
        .single();

      if (error) throw error;
      set((state) => ({
        projects: [data as Project, ...state.projects],
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add project";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
  updateProject: async (id, updates) => {
    set({ isSubmitting: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      set((state) => ({
        projects: state.projects.map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        ),
        isSubmitting: false,
      }));
      return;
    }

    try {
      const { data, error } = await supabase
        .from("projects")
        .update(updates)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      set((state) => ({
        projects: state.projects.map((t) =>
          t.id === id ? (data as unknown as Project) : t,
        ),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update project";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
  updateProjectStatus: (id, tasks) => {
    const projectTasks = tasks.filter((t) => t.project_id === id);
    if (projectTasks.length === 0) return;

    const allDone = projectTasks.every((t) => t.status === "done");
    const project = get().projects.find((p) => p.id === id);
    if (!project || project.status === "paused") return;

    let newStatus: ProjectStatus = allDone ? "completed" : "active";

    if (project.status !== newStatus) {
      get().updateProject(project.id, { status: newStatus });
    }
  },
  deleteProject: async (id) => {
    set({ isSubmitting: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      set((state) => ({
        projects: state.projects.filter((t) => t.id !== id),
        isSubmitting: false,
      }));
      return;
    }

    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({ projects: state.projects.filter((t) => t.id !== id) }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete project";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },
  setFilter: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),

  resetFilters: () => set({ filters: defaultFiltersProjects }),

  getFilteredProjects: () => {
    const { projects, filters } = get();

    return projects.filter((project) => {
      if (
        filters.search &&
        !project.name.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }
      if (filters.status !== "all" && project.status !== filters.status) {
        return false;
      }
      return true;
    });
  },

  getProjectByStatus: (status) => {
    return get()
      .getFilteredProjects()
      .filter((t) => t.status === status);
  },
}));
