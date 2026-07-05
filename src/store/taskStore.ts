import { create } from "zustand";
import { isLiveMode, supabase } from "@/lib/supabase";
import type { Task, Status, TaskFilters } from "@/types";
import { getMockTasks, mockTasks } from "@/data/staticData";

const defaultFiltersTasks: TaskFilters = {
  search: "",
  priority: "all",
  dueDateRange: "all",
};

interface TaskStore {
  tasks: Task[];
  filters: TaskFilters;
  isFetching: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchTasks: (workspaceId: string) => Promise<void>;
  addTask: (
    task: Omit<Task, "id" | "created_at" | "updated_at" | "position">,
  ) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  moveTask: (taskId: string, newStatus: Status) => Promise<void>;
  setFilter: (filters: Partial<TaskFilters>) => void;
  resetFilters: () => void;
  getFilteredTasks: () => Task[];
  getTasksByStatus: (id: string, status: Status) => Task[];
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  tasks: [],
  filters: defaultFiltersTasks,
  isFetching: false,
  isSubmitting: false,
  error: null,

  fetchTasks: async (workspaceId) => {
    set({ isFetching: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      const filtered = getMockTasks(workspaceId, mockTasks);
      set({ tasks: filtered, isFetching: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .select(
          `
          *,
          projects(*)
        `,
        )
        .eq("workspace_id", workspaceId)
        .order("position", { ascending: true });

      if (error) throw error;
      set({ tasks: (data as unknown as Task[]) || [] });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to Load tasks";
      set({ error: message });
      throw err;
    } finally {
      set({ isFetching: false });
    }
  },

  addTask: async (task) => {
    set({ isSubmitting: true, error: null });

    const tasksInSameStatus = get().tasks.filter(
      (t) => t.status === task.status,
    );
    const maxPosition =
      tasksInSameStatus.length > 0
        ? Math.max(...tasksInSameStatus.map((t) => t.position ?? 0))
        : 0;

    const newPosition = maxPosition + 1;

    const taskData: Omit<Task, "id" | "created_at" | "updated_at"> = {
      ...task,
      position: newPosition,
    };

    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      const newTask: Task = {
        ...taskData,
        id: `t${Date.now()}`,
        created_at: new Date().toISOString(),
        updated_at: null,
      };
      set((state) => ({
        tasks: [newTask, ...state.tasks],
        isSubmitting: false,
      }));
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
      const message = err instanceof Error ? err.message : "Failed to add task";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateTask: async (id, updates) => {
    set({ isSubmitting: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
        isSubmitting: false,
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
        err instanceof Error ? err.message : "Failed to Update task";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteTask: async (id) => {
    set({ isSubmitting: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      set((state) => ({
        tasks: state.tasks.filter((t) => t.id !== id),
        isSubmitting: false,
      }));
      return;
    }

    try {
      const { error } = await supabase.from("tasks").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete task";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  moveTask: async (taskId, newStatus) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, status: newStatus } : t,
      ),
    }));

    if (!isLiveMode) return;

    set({ isSubmitting: true, error: null });
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
        err instanceof Error ? err.message : "Failed to move task";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
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

  getTasksByStatus: (id, status) => {
    return get()
      .getFilteredTasks()
      .filter((t) => t.status === status && t.project_id === id)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  },
}));
