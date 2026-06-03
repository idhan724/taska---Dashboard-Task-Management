export type Priority = 'low' | 'medium' | 'high'
export type Status = 'todo' | 'in-progress' | 'done'
export type WorkspaceRole = 'owner' | 'member'

export interface Profile {
    id: string
    full_name: string
    created_at: string
}

export interface Workspace {
    id: string
    workspace_id: string
    description: string | null
    owner_id: string
    created_at: string
}

export interface WorkspaceMember {
    id: string;
    workspace_id: string
    user_id: string
    role: WorkspaceRole
    invited_by: string | null
    joined_at: string
    profile: Profile
}

export interface WorkspaceInvite {
    id: string
    workspace_id: string
    email: string
    role: 'member'
    token: string
    invited_by: string
    expires_at: string
    accepted_at: string | null
}

export interface Task {
    id: string
    workspace_id: string
    created_by: string
    assigned_to: string | null
    title: string
    description: string | null
    status: Status
    priority: Priority
    due_date: string | null
    position: number
    created_at: string
    updated_at: string
    assignee?: Profile
}

export interface TaskFilters {
    search: string
    priority: Priority | 'all'
    assignee: string | 'all'
    dueDateRange: 'all' | 'today' | 'this-week' | 'overdue'
}