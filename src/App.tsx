import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";
import Teams from "@/pages/Teams";
import KanbanBoard from "@/pages/KanbanBoard";
import { Toaster } from "@/components/ui/sonner";
import Settings from "@/pages/Settings";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import type { Subscription } from "@supabase/supabase-js";
import InviteAcceptPage from "@/components/team/InviteAcceptPage";
import SignUpPage from "@/auth/SignUpPage";
import SignInPage from "@/auth/SignInPage";
import ForgotPasswordPage from "@/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/auth/ResetPasswordPage";
import ProtectedRoute from "@/auth/ProtectedRoute";

function App() {
  const { initialize, user } = useAuthStore();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [authChecked, setAuthChecked] = React.useState(false);
  const [workspacesChecked, setWorkspacesChecked] = React.useState(false);

  React.useEffect(() => {
    let subscription: Subscription | undefined;

    const init = async () => {
      try {
        subscription = await initialize();
      } catch {
        toast.error(
          useAuthStore.getState().error ?? "Failed to initialize user",
        );
      } finally {
        setAuthChecked(true);
      }
    };
    init();

    return () => subscription?.unsubscribe();
  }, [initialize]);

  React.useEffect(() => {
    const fetch = async () => {
      if (user) {
        try {
          await fetchWorkspaces();
        } catch {
          toast.error(
            useWorkspaceStore.getState().error ?? "Failed to load workspace",
          );
        } finally {
          setWorkspacesChecked(true);
        }
      } else if (authChecked) {
        setWorkspacesChecked(true);
      }
    };
    fetch();
  }, [user, fetchWorkspaces, authChecked]);

  if (!authChecked || (user && !workspacesChecked)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/invite/accept" element={<InviteAcceptPage />} />
        <Route element={<ProtectedRoute />}>
          <Route
            path="/"
            element={<Navigate to={`/${workspaces[0]?.id}`} replace />}
          />
          <Route path="/:workspaceId" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:projectId" element={<KanbanBoard />} />
            <Route path="teams" element={<Teams />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
