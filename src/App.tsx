import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuthStore } from "@/store/authStore";
import Dashboard from "@/pages/Dashboard";
import { useWorkspaceStore } from "@/store/workspaceStore";

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
      </Route>
    </Routes>
  );
}

export default App;
