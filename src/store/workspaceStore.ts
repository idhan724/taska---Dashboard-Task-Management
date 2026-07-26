import { create } from "zustand";
import {
  mockCurrentUser,
  mockMembers,
  mockWorkspaces,
} from "@/data/staticData";
import { isLiveMode, supabase } from "@/lib/supabase";
import type { Workspace, WorkspaceMember } from "@/types";

interface WorkspaceStore {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  members: WorkspaceMember[];
  isFetching: boolean;
  isSubmitting: boolean;
  isAcceptingInvite: boolean;
  error: string | null;
  fetchWorkspaces: () => Promise<void>;
  addWorkspaces: (
    workspace: Omit<Workspace, "id" | "created_at" | "owner_id">,
  ) => Promise<void>;
  updateWorkspaces: (id: string, data: Partial<Workspace>) => Promise<void>;
  deleteWorkspaces: (id: string) => Promise<void>;
  setActiveWorkspace: (workspace: Workspace) => void;
  fetchMembers: (workspaceId: string) => Promise<void>;
  removeMember: (workspaceId: string, userId: string) => Promise<void>;
  leaveWorkspace: (workspaceId: string) => Promise<void>;
  regenerateInviteLink: (workspaceId: string) => Promise<string>;
  getInviteLink: (workspaceId: string) => Promise<string>;
  previewInviteLink: (token: string) => Promise<{ workspaceName: string }>;
  acceptInviteLink: (token: string) => Promise<string | undefined>;
}

export const useWorkspaceStore = create<WorkspaceStore>((set, get) => ({
  workspaces: [],
  activeWorkspace: null,
  members: [],
  isFetching: false,
  isAcceptingInvite: false,
  isSubmitting: false,
  error: null,

  fetchWorkspaces: async () => {
    set({ isFetching: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      const userWorkspaces = mockWorkspaces.filter(
        (w) => w.owner_id === mockCurrentUser.id,
      );
      set({
        workspaces: userWorkspaces,
        activeWorkspace: userWorkspaces[0] ?? null,
        isFetching: false,
      });

      return;
    }

    try {
      const { data, error } = await supabase
        .from("workspaces")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      const workspaces = data || [];
      set({ workspaces, activeWorkspace: workspaces[0] ?? null });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load workspace";
      set({ error: message });
      throw err;
    } finally {
      set({ isFetching: false });
    }
  },

  addWorkspaces: async (workspace) => {
    set({ isSubmitting: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      const newWorkspace: Workspace = {
        ...workspace,
        id: `ws-${Date.now()}`,
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
        members: [newMember, ...state.members],
        activeWorkspace: newWorkspace,
        isSubmitting: false,
      }));
      return;
    }

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("user not found");

      const workspaceData = {
        ...workspace,
        owner_id: user.id,
      };

      const { error: insertError } = await supabase
        .from("workspaces")
        .insert(workspaceData);

      if (insertError) throw insertError;

      const { data, error: selectError } = await supabase
        .from("workspaces")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (selectError) throw selectError;

      set((state) => ({
        workspaces: [data as Workspace, ...state.workspaces],
        activeWorkspace: data as Workspace,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to add workspace";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  updateWorkspaces: async (id, data) => {
    set({ isSubmitting: true, error: null });
    if (!isLiveMode) {
      set((state) => ({
        workspaces: state.workspaces.map((w) =>
          w.id === id ? { ...w, ...data } : w,
        ),
        activeWorkspace:
          state.activeWorkspace?.id === id
            ? { ...state.activeWorkspace, ...data }
            : state.activeWorkspace,
        isSubmitting: false,
      }));
      return;
    }

    try {
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update workspace";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  deleteWorkspaces: async (id) => {
    set({ isSubmitting: true, error: null });
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
          isSubmitting: false,
        });
        return;
      }

      set((state) => ({
        workspaces: remainingWorkspaces,
        activeWorkspace:
          state.activeWorkspace?.id === id
            ? remainingWorkspaces[0]
            : state.activeWorkspace,
        isSubmitting: false,
      }));
      return;
    }

    try {
      const { error } = await supabase.from("workspaces").delete().eq("id", id);
      if (error) throw error;

      await get().fetchWorkspaces();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete workspace";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  setActiveWorkspace: (workspace) => {
    set({ activeWorkspace: workspace });
  },

  fetchMembers: async (workspaceId) => {
    set({ isFetching: true, error: null });
    if (!isLiveMode) {
      set({
        members: mockMembers.filter((m) => m.workspace_id === workspaceId),
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from("workspace_members")
        .select("*, profile:users!workspace_members_user_id_fkey(*)")
        .eq("workspace_id", workspaceId);

      if (error) throw error;
      set({ members: (data as WorkspaceMember[]) || [] });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch members";
      set({ error: message });
      throw err;
    } finally {
      set({ isFetching: false });
    }
  },

  removeMember: async (workspaceId, userId) => {
    if (!isLiveMode) return;

    set({ isSubmitting: true, error: null });
    try {
      const { error } = await supabase
        .from("workspace_members")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId);

      if (error) throw error;

      set((state) => ({
        members: state.members.filter((m) => m.user_id !== userId),
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to remove member";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  leaveWorkspace: async (workspaceId) => {
    if (!isLiveMode) return;

    set({ isSubmitting: true, error: null });
    try {
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
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to leave workspace";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  regenerateInviteLink: async (workspaceId) => {
    if (!isLiveMode) return "";

    set({ isSubmitting: true, error: null });
    try {
      const { data, error } = await supabase.rpc("regenerate_invite_link", {
        p_workspace_id: workspaceId,
      });
      if (error) throw error;

      const token = (data as { token: string }).token;
      return `${window.location.origin}/invite/accept?token=${token}`;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to regenerate link";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  getInviteLink: async (workspaceId) => {
    if (!isLiveMode) return "";

    set({ isSubmitting: true, error: null });
    try {
      const { data, error } = await supabase.rpc("get_or_create_invite_link", {
        p_workspace_id: workspaceId,
      });
      if (error) throw error;

      const token = (data as { token: string }).token;
      return `${window.location.origin}/invite/accept?token=${token}`;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to get invite link";
      set({ error: message });
      throw err;
    } finally {
      set({ isSubmitting: false });
    }
  },

  previewInviteLink: async (token) => {
    const { data, error } = await supabase.rpc("preview_invite_link", {
      p_token: token,
    });

    if (error) throw error;
    return {
      workspaceName: (data as { workspace_name: string }).workspace_name,
    };
  },
  acceptInviteLink: async (token) => {
    if (!isLiveMode) return;

    set({ isAcceptingInvite: true, error: null });
    try {
      const { data, error } = await supabase.rpc("accept_invite_link", {
        p_token: token,
      });
      if (error) throw error;

      await get().fetchWorkspaces();

      return (data as { workspace_id: string })?.workspace_id;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to accept invite";
      set({ error: message });
      throw err;
    } finally {
      set({ isAcceptingInvite: false });
    }
  },
}));
