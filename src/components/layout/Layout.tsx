import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import { SidebarInset, SidebarProvider } from "../ui/sidebar";
import AppSidebar from "@/components/layout/AppSidebar";

export default function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
