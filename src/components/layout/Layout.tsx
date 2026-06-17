import * as React from "react";
import { Outlet, useParams } from "react-router-dom";
import Header from "@/components/layout/Header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { TooltipProvider } from "../ui/tooltip";

export default function Layout() {
  const { workspaceId } = useParams();
  const { workspaces, setActiveWorkspace } = useWorkspaceStore();

  React.useEffect(() => {
    if (!workspaceId) return;
    const workspace = workspaces.find((w) => w.id === workspaceId);
    if (workspace) setActiveWorkspace(workspace);
  }, [workspaceId, workspaces]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
