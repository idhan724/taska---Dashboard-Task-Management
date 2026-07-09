import { create } from "zustand";
import { isLiveMode, supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";
import { mockCurrentUser } from "@/data/staticData";

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  signUp: (email: string, password: string, fullname: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  profile: mockCurrentUser,
  isLoading: false,
  error: null,

  initialize: async () => {
    set({ isLoading: true, error: null });
    if (!isLiveMode) {
      await new Promise((r) => setTimeout(r, 2000));
      set({ user: { id: mockCurrentUser.id } as User, isLoading: false });
      return;
    }

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile, error: profileError } = await supabase
          .from("users")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) throw profileError;

        set({ user: session.user, profile });
      }
      if (sessionError) throw sessionError;

      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (profileError) {
            console.error(profileError);
            set({ user: session.user, profile: null });
            return;
          }

          set({ user: session.user, profile });
        } else {
          set({ user: null, profile: null });
        }
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to initialize user";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signUp: async (email, password, fullName) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign up";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign in";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithGithub: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to continue with Github";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  signOut: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, profile: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to sign out";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  updateProfile: async (id, updates) => {
    if (!isLiveMode) {
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      }));
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("users")
        .update(updates)
        .eq("id", id);

      if (error) throw error;
      set((state) => ({
        profile: state.profile ? { ...state.profile, ...updates } : null,
      }));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update users";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
