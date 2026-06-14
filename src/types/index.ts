import type { Tables } from "@/types/supabase";

export type Priority = "low" | "medium" | "high";
export type Status = "todo" | "in-progress" | "done";
export type WorkspaceRole = "owner" | "member";
export type ProjectStatus = "active" | "on_hold" | "completed";

export type Profile = Tables<"users">;
export type Workspace = Tables<"workspaces">;

export type WorkspaceMember = Omit<Tables<"workspace_members">, "role"> & {
  role: WorkspaceRole;
  profile: Profile;
};

export type WorkspaceInvite = Tables<"workspace_invites">;

export type Project = Omit<Tables<"projects">, "status"> & {
  status: ProjectStatus;
};

export type Task = Omit<Tables<"tasks">, "status" | "priority"> & {
  status: Status;
  priority: Priority;
  projects?: Project;
};

export interface TaskFilters {
  search: string;
  priority: Priority | "all";
  dueDateRange: "all" | "today" | "this-week" | "overdue";
}

export interface ProjectFilters {
  search: string;
  status: ProjectStatus | "all";
}

export interface Stats {
  totalProjects: number;
  totalTasks: number;
  totalMember: number;
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  doneThisWeek: number;
  active: number;
  onHold: number;
  completed: number;
}
