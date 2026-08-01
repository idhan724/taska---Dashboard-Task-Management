import { create } from "zustand";
import { isLiveMode, supabase } from "@/lib/supabase";
import type { Profile } from "@/types";
import type { Subscription, User } from "@supabase/supabase-js";
import { mockCurrentUser } from "@/data/staticData";

interface AuthStore {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<Subscription | undefined>;
  signUp: (email: string, password: string, fullname: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGithub: (redirectPath?: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (id: string, updates: Partial<Profile>) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
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
      return undefined;
    }

    let timeoutId: ReturnType<typeof setTimeout>;

    const authPromise = new Promise<Subscription | undefined>(
      (resolve, reject) => {
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange((event, session) => {
          try {
            if (session?.user) {
              set({ user: session.user });
              supabase
                .from("users")
                .select("*")
                .eq("id", session.user.id)
                .maybeSingle()
                .then(({ data: profile, error: profileError }) => {
                  if (profileError) {
                    set({ error: profileError.message });
                    return;
                  }
                  set({ profile: profile ?? null });
                });
            } else {
              set({ user: null, profile: null });
            }

            if (event === "INITIAL_SESSION") {
              clearTimeout(timeoutId);
              resolve(subscription);
            }
          } catch (err) {
            const message =
              err instanceof Error ? err.message : "Failed to initialize";
            set({ error: message });
            clearTimeout(timeoutId);
            reject(err);
          } finally {
            set({ isLoading: false });
          }
        });
      },
    );

    const timeoutPromise = new Promise<undefined>((_resolve, reject) => {
      timeoutId = setTimeout(() => {
        const message = "Failed to restore session, please sign in again";
        set({ user: null, profile: null, isLoading: false, error: message });
        reject(new Error(message));
      }, 8000);
    });

    return Promise.race([authPromise, timeoutPromise]);
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

  signInWithGithub: async (redirectPath?: string) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}${redirectPath ?? ""}`,
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
  sendPasswordResetEmail: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset email";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
  updatePassword: async (newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update password";
      set({ error: message });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },
}));
