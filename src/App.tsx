import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuthStore } from "@/store/authStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import Dashboard from "@/pages/Dashboard";
import Projects from "@/pages/Projects";

function App() {
  const { initialize } = useAuthStore();
  const { workspaces, fetchWorkspaces } = useWorkspaceStore();

  React.useEffect(() => {
    const init = async () => {
      await initialize();
      fetchWorkspaces();
    };
    init();
  }, [initialize]);

  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={`/${workspaces[0]?.id}`} replace />}
      />
      <Route path="/:workspaceId" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="projects" element={<Projects />} />
      </Route>
    </Routes>
  );
}

export default App;
