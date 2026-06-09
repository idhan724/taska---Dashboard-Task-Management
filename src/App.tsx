import * as React from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuthStore } from "@/store/authStore";

function App() {
  const { initialize } = useAuthStore();

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" />
      </Route>
    </Routes>
  );
}

export default App;
