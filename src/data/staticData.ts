import type {
  Profile,
  Workspace,
  WorkspaceMember,
  Task,
  Project,
} from "@/types";

export const mockProfiles: Profile[] = [
  {
    id: "user-001",
    full_name: "Idhan Khalas Saputra",
    email: "idhan@taska.io",
    created_at: "2024-01-10T08:00:00Z",
  },
  {
    id: "user-002",
    full_name: "Budi Santoso",
    email: "budi@taska.io",
    created_at: "2024-01-11T09:30:00Z",
  },
  {
    id: "user-003",
    full_name: "Alice Wu",
    email: "alice@taska.io",
    created_at: "2024-01-12T10:00:00Z",
  },
  {
    id: "user-004",
    full_name: "Rizky Darmawan",
    email: "rizky@taska.io",
    created_at: "2024-01-13T11:00:00Z",
  },
  {
    id: "user-005",
    full_name: "Siti Rahayu",
    email: "siti@taska.io",
    created_at: "2024-01-15T13:00:00Z",
  },
];

export const mockCurrentUser = mockProfiles[0];

export const mockWorkspaces: Workspace[] = [
  {
    id: "ws-001",
    name: "Tim Desain",
    description: "Workspace untuk tim desain UI/UX produk",
    owner_id: "user-001",
    created_at: "2024-01-15T08:00:00Z",
  },
  {
    id: "ws-002",
    name: "Backend Squad",
    description: "Task tracking untuk tim backend dan API",
    owner_id: "user-002",
    created_at: "2024-01-20T09:00:00Z",
  },
  {
    id: "ws-003",
    name: "Marketing Q2",
    description: "Kampanye dan konten marketing Q2 2024",
    owner_id: "user-001",
    created_at: "2024-02-01T10:00:00Z",
  },
];

export const mockMembers: WorkspaceMember[] = [
  {
    id: "mem-001",
    workspace_id: "ws-001",
    user_id: "user-001",
    role: "owner",
    invited_by: null,
    joined_at: "2024-01-15T08:00:00Z",
    profile: mockProfiles[0],
  },
  {
    id: "mem-002",
    workspace_id: "ws-001",
    user_id: "user-002",
    role: "member",
    invited_by: "user-001",
    joined_at: "2024-01-16T10:00:00Z",
    profile: mockProfiles[1],
  },
  {
    id: "mem-003",
    workspace_id: "ws-001",
    user_id: "user-003",
    role: "member",
    invited_by: "user-001",
    joined_at: "2024-01-17T09:00:00Z",
    profile: mockProfiles[2],
  },
  {
    id: "mem-004",
    workspace_id: "ws-001",
    user_id: "user-004",
    role: "member",
    invited_by: "user-002",
    joined_at: "2024-01-18T14:00:00Z",
    profile: mockProfiles[3],
  },

  {
    id: "mem-005",
    workspace_id: "ws-002",
    user_id: "user-002",
    role: "owner",
    invited_by: null,
    joined_at: "2024-01-20T09:00:00Z",
    profile: mockProfiles[1],
  },
  {
    id: "mem-006",
    workspace_id: "ws-002",
    user_id: "user-001",
    role: "member",
    invited_by: "user-002",
    joined_at: "2024-01-21T11:00:00Z",
    profile: mockProfiles[0],
  },
];

export const mockProjects: Project[] = [
  {
    id: "p1",
    workspace_id: "ws-001",
    name: "TaskFlow Redesign",
    description: "Complete UI overhaul of the main dashboard",
    status: "active",
    color: "#7c3aed",
    created_at: "2024-11-01",
    updated_at: null,
    task_count: 24,
    completed_count: 14,
  },
  {
    id: "p2",
    workspace_id: "ws-001",
    name: "API Integration",
    description: "Integrate third-party payment and auth APIs",
    status: "active",
    color: "#0d9488",
    created_at: "2024-11-10",
    updated_at: null,
    task_count: 18,
    completed_count: 7,
  },
  {
    id: "p3",
    workspace_id: "ws-002",
    name: "Mobile App",
    description: "React Native mobile companion app",
    status: "on_hold",
    color: "#ea580c",
    created_at: "2024-10-15",
    updated_at: null,
    task_count: 32,
    completed_count: 12,
  },
  {
    id: "p4",
    workspace_id: "ws-002",
    name: "Analytics Dashboard",
    description: "Business intelligence reporting suite",
    status: "active",
    color: "#d97706",
    created_at: "2024-12-01",
    updated_at: null,
    task_count: 15,
    completed_count: 3,
  },
];

export const mockTasks: Task[] = [
  {
    id: "task-001",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Redesain halaman onboarding",
    description:
      "Buat alur onboarding yang lebih intuitif untuk user baru. Fokus pada step pertama yang menarik.",
    status: "todo",
    priority: "high",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 1,
    created_at: "2024-02-01T08:00:00Z",
    updated_at: "2024-02-01T08:00:00Z",
    projects: mockProjects[0],
  },
  {
    id: "task-002",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Riset kompetitor untuk fitur notifikasi",
    description:
      "Analisis 5 kompetitor: Asana, Trello, Linear, Notion, Monday.com",
    status: "todo",
    priority: "medium",
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 2,
    created_at: "2024-02-02T09:00:00Z",
    updated_at: "2024-02-02T09:00:00Z",
    projects: mockProjects[0],
  },
  {
    id: "task-003",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Update design system dokumentasi",
    description: null,
    status: "todo",
    priority: "low",
    due_date: null,
    position: 3,
    created_at: "2024-02-03T10:00:00Z",
    updated_at: "2024-02-03T10:00:00Z",
    projects: mockProjects[0],
  },
  {
    id: "task-004",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Buat komponen Toast Notification",
    description:
      "Implementasi toast untuk success, error, warning, dan info state",
    status: "todo",
    priority: "medium",
    due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 4,
    created_at: "2024-02-04T11:00:00Z",
    updated_at: "2024-02-04T11:00:00Z",
    projects: mockProjects[0],
  },
  {
    id: "task-005",
    workspace_id: "ws-001",
    project_id: "p2",
    title: "Buat halaman login & sign up",
    description:
      "Implementasi form autentikasi dengan validasi dan error handling yang proper",
    status: "in-progress",
    priority: "high",
    due_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 1,
    created_at: "2024-01-28T08:00:00Z",
    updated_at: "2024-02-05T10:30:00Z",
    projects: mockProjects[1],
  },
  {
    id: "task-006",
    workspace_id: "ws-001",
    project_id: "p3",
    title: "Desain mobile responsif Kanban Board",
    description:
      "Pastikan kanban bisa dipakai di layar 375px ke atas dengan UX yang nyaman",
    status: "in-progress",
    priority: "high",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 2,
    created_at: "2024-01-30T09:00:00Z",
    updated_at: "2024-02-05T14:00:00Z",
    projects: mockProjects[2],
  },
  {
    id: "task-007",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Setup Zustand store untuk task management",
    description: null,
    status: "in-progress",
    priority: "medium",
    due_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 3,
    created_at: "2024-02-01T13:00:00Z",
    updated_at: "2024-02-05T15:30:00Z",
    projects: mockProjects[0],
  },
  {
    id: "task-008",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Setup project: Vite + React + TypeScript",
    description: "Inisialisasi project dengan semua dependency yang dibutuhkan",
    status: "done",
    priority: "high",
    due_date: "2024-01-20",
    position: 1,
    created_at: "2024-01-15T08:00:00Z",
    updated_at: "2024-01-19T17:00:00Z",
    projects: mockProjects[0],
  },
  {
    id: "task-009",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Konfigurasi Tailwind CSS + shadcn/ui",
    description: null,
    status: "done",
    priority: "medium",
    due_date: "2024-01-22",
    position: 2,
    created_at: "2024-01-18T09:00:00Z",
    updated_at: "2024-01-22T16:00:00Z",
    projects: mockProjects[0],
  },
  {
    id: "task-010",
    workspace_id: "ws-001",
    project_id: "p2",
    title: "Setup Supabase: tabel + RLS policy",
    description: "Buat semua tabel database dan konfigurasi Row Level Security",
    status: "done",
    priority: "high",
    due_date: "2024-01-25",
    position: 3,
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-25T18:00:00Z",
    projects: mockProjects[1],
  },
  {
    id: "task-011",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Buat TypeScript types & interfaces",
    description: null,
    status: "done",
    priority: "medium",
    due_date: "2024-01-26",
    position: 4,
    created_at: "2024-01-21T11:00:00Z",
    updated_at: "2024-01-26T14:00:00Z",
    projects: mockProjects[0],
  },
];

export const getMockMembersByWorkspace = (
  workspaceId: string,
  members: WorkspaceMember[],
) => members.filter((m) => m.workspace_id === workspaceId);

export const getMockProjectByWorkspace = (
  workspaceId: string,
  project: Project[],
) => project.filter((t) => t.workspace_id === workspaceId);

export const getMockTasksByProjects = (projectId: string, tasks: Task[]) =>
  tasks.filter((t) => t.project_id === projectId);

export const getMockStats = (
  workspaceId: string,
  projectId: string,
  tasks: Task[],
  projects: Project[],
  members: WorkspaceMember[],
) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  return {
    totalProjects: getMockProjectByWorkspace(workspaceId, projects),
    totalTasks: getMockTasksByProjects(projectId, tasks).length,
    todoCount: tasks.filter((t) => t.status === "todo").length,
    inProgressCount: tasks.filter((t) => t.status === "in-progress").length,
    doneCount: tasks.filter((t) => t.status === "done").length,
    overdueCount: tasks.filter(
      (t) => t.due_date && new Date(t.due_date) < today && t.status !== "done",
    ).length,
    doneThisWeek: tasks.filter(
      (t) =>
        t.status === "done" &&
        t.updated_at &&
        new Date(t.updated_at) >= startOfWeek,
    ).length,
    activeCount: projects.filter((t) => t.status === "active"),
    onHoldCount: projects.filter((t) => t.status === "on_hold"),
    completedCount: projects.filter((t) => t.status === "completed"),
    memberCount: getMockMembersByWorkspace(workspaceId, members).length,
  };
};
