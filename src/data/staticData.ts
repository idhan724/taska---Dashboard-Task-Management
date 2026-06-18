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

const daysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

export const mockProjects: Project[] = [
  {
    id: "p1",
    workspace_id: "ws-001",
    name: "TaskFlow Redesign",
    description: "Complete UI overhaul of the main dashboard",
    status: "active",
    color: "violet",
    created_at: daysAgo(30),
  },
  {
    id: "p2",
    workspace_id: "ws-001",
    name: "API Integration",
    description: "Integrate third-party payment and auth APIs",
    status: "active",
    color: "teal",
    created_at: daysAgo(28),
  },
  {
    id: "p3",
    workspace_id: "ws-002",
    name: "Mobile App",
    description: "React Native mobile companion app",
    status: "on_hold",
    color: "amber",
    created_at: daysAgo(35),
  },
  {
    id: "p4",
    workspace_id: "ws-003",
    name: "Analytics Dashboard",
    description: "Business intelligence reporting suite",
    status: "active",
    color: "amber",
    created_at: daysAgo(20),
  },
];

export const statusProject: Record<
  string,
  { label: string; className: string }
> = {
  active: {
    label: "active",
    className: "bg-emerald-50 text-emerald-700",
  },
  on_hold: {
    label: "on hold",
    className: "bg-amber-50 text-amber-700",
  },
  completed: {
    label: "completed",
    className: "bg-blue-50 text-blue-700",
  },
};

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
    created_at: daysAgo(24),
    updated_at: daysAgo(24),
    projects: mockProjects.find((p) => p.id === "p1"),
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
    created_at: daysAgo(22),
    updated_at: daysAgo(22),
    projects: mockProjects.find((p) => p.id === "p1"),
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
    created_at: daysAgo(20),
    updated_at: daysAgo(20),
    projects: mockProjects.find((p) => p.id === "p1"),
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
    created_at: daysAgo(18),
    updated_at: daysAgo(18),
    projects: mockProjects.find((p) => p.id === "p1"),
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
    created_at: daysAgo(15),
    updated_at: daysAgo(4),
    projects: mockProjects.find((p) => p.id === "p2"),
  },
  {
    id: "task-006",
    workspace_id: "ws-001",
    project_id: "p2",
    title: "Desain mobile responsif Kanban Board",
    description:
      "Pastikan kanban bisa dipakai di layar 375px ke atas dengan UX yang nyaman",
    status: "in-progress",
    priority: "high",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 2,
    created_at: daysAgo(13),
    updated_at: daysAgo(2),
    projects: mockProjects.find((p) => p.id === "p2"),
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
    created_at: daysAgo(12),
    updated_at: daysAgo(1),
    projects: mockProjects.find((p) => p.id === "p1"),
  },
  {
    id: "task-008",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Setup project: Vite + React + TypeScript",
    description: "Inisialisasi project dengan semua dependency yang dibutuhkan",
    status: "done",
    priority: "high",
    due_date: new Date(Date.now() - 22 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 1,
    created_at: daysAgo(26),
    updated_at: daysAgo(23),
    projects: mockProjects.find((p) => p.id === "p1"),
  },
  {
    id: "task-009",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Konfigurasi Tailwind CSS + shadcn/ui",
    description: null,
    status: "done",
    priority: "medium",
    due_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 2,
    created_at: daysAgo(25),
    updated_at: daysAgo(21),
    projects: mockProjects.find((p) => p.id === "p1"),
  },
  {
    id: "task-010",
    workspace_id: "ws-001",
    project_id: "p2",
    title: "Setup Supabase: tabel + RLS policy",
    description: "Buat semua tabel database dan konfigurasi Row Level Security",
    status: "done",
    priority: "high",
    due_date: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 3,
    created_at: daysAgo(21),
    updated_at: daysAgo(17),
    projects: mockProjects.find((p) => p.id === "p2"),
  },
  {
    id: "task-011",
    workspace_id: "ws-001",
    project_id: "p1",
    title: "Buat TypeScript types & interfaces",
    description: null,
    status: "done",
    priority: "medium",
    due_date: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0],
    position: 4,
    created_at: daysAgo(19),
    updated_at: daysAgo(2),
    projects: mockProjects.find((p) => p.id === "p1"),
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

export const getMockTasksByWorkspace = (workspaceId: string, tasks: Task[]) =>
  tasks.filter((t) => t.workspace_id === workspaceId);

export const getMockTasksByProjects = (projectId: string, tasks: Task[]) =>
  tasks.filter((t) => t.project_id === projectId);
