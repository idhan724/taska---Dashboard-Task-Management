import { create } from "zustand";
import { isLiveMode, supabase } from "@/lib/supabase";
import type { Task, Status, TaskFilters } from "@/types";
import { getMockTasksByProjects, mockTasks } from "@/data/staticData";

const defaultFiltersTasks: TaskFilters = {
  search: "",
  priority: "all",
  dueDateRange: "all",
};

interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;
  isLoading: boolean;
  error: string | null;
  fetchTasks: (workspaceId: string) => Promise<void>;
  addTask: (
    task: Omit<Task, "id" | "created_at" | "updated_at">,
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: Status) => Promise<void>;
  setFilter: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  getFilteredTasks: () => Task[];
  getTasksByStatus: (status: Status) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: mockTasks,
  filters: defaultFiltersTasks,
  isLoading: false,
  error: null,

  fetchTasks: async (projectId) => {
    if (!isLiveMode) {
      const { tasks } = get();
      const filtered = getMockTasksByProjects(projectId, tasks);
      set({ tasks: filtered });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          projects(*)
        `,
        )
        .eq("project_id", projectId)
        .order("position", { ascending: true });

      if (error) throw error;
      set({ tasks: (data as unknown as Task[]) || [] });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Gagal memuat tasks";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (taskData) => {
    set({ error: null });
    if (!isLiveMode) {
      const newTask: Task = {
        ...taskData,
        id: `t${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      set((state) => ({ tasks: [newTask, ...state.tasks] }));
      return;
    }

    try {
      const { projects, ...insertData } = taskData;

      const { data, error } = await supabase
        .from("tasks")
        .insert(insertData)
        .select(`*, projects(*)`)
        .single();

      if (error) throw error;
      set((state) => ({ tasks: [...state.tasks, data as unknown as Task] }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menambahkan task";
      set({ error: message });
      throw err;
    }
  },

  updateTask: async (id, updates) => {
    set({ error: null });
    if (!isLiveMode) {
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      }));
      return;
    }

    try {
      const { projects, ...updatesData } = updates;
      const { data, error } = await supabase
        .from("tasks")
        .update(updatesData)
        .eq("id", id)
        .select(`*, projects(*)`)
        .single();

      if (error) throw error;
      set((state) => ({
        tasks: state.tasks.map((t) =>
          t.id === id ? (data as unknown as Task) : t,
        ),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal mengupdate task";
      set({ error: message });
      throw err;
    }
  },

  deleteTask: async (id) => {
    if (!isLiveMode) {
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
      }));
      return;
    }
    set({ error: null });
    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus task";
      set({ error: message });
      throw err;
    }
  },

  moveTask: async (taskId, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t,
      ),
    }));

    if (!isLiveMode) return;

    try {
      const { error } = await supabase
        .from("tasks")
        .update({ status: newStatus })
        .eq("id", taskId);

      if (error) throw error;
    } catch (err) {
      const projectId = get().tasks.find((t) => t.id === taskId)?.project_id;
      if (projectId) await get().fetchTasks(projectId);

      const message =
        err instanceof Error ? err.message : "Gagal memindahkan task";
      set({ error: message });
      throw err;
    }
  },

  setFilter: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
  },

  resetFilters: () => set({ filters: defaultFiltersTasks }),

  getFilteredTasks: () => {
    const { tasks, filters } = get();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + 7);

    return tasks.filter((task) => {
      if (
        filters.search &&
        !task.title.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      if (filters.priority !== "all" && task.priority !== filters.priority) {
        return false;
      }

      if (filters.dueDateRange !== "all") {
        if (!task.due_date) return false;
        const dueDate = new Date(task.due_date);
        if (
          filters.dueDateRange === "today" &&
          dueDate.toDateString() !== today.toDateString()
        )
          return false;
        if (
          filters.dueDateRange === "this-week" &&
          (dueDate < today || dueDate > endOfWeek)
        )
          return false;
        if (filters.dueDateRange === "overdue" && dueDate >= today)
          return false;
      }
      return true;
    });
  },

  getTasksByStatus: (status) => {
    return get()
      .getFilteredTasks()
      .filter((t) => t.status === status);
  },
}));
