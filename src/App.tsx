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
import SignUpPage from "@/pages/auth/SignUpPage";
import SignInPage from "@/pages/auth/SignInPage";
import ProtectedRoute from "@/pages/auth/ProtectedRoute";

function App() {
  const { initialize, user } = useAuthStore();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();
  const [authChecked, setAuthChecked] = React.useState(false);

  React.useEffect(() => {
    const init = async () => {
      await initialize();
      setAuthChecked(true);
    };
    init();
  }, [initialize]);

  React.useEffect(() => {
    if (user) {
      fetchWorkspaces();
    }
  }, [user, fetchWorkspaces]);

  if (!authChecked) {
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
