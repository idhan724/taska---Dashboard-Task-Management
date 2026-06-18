import { useParams, NavLink, useNavigate } from "react-router-dom";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useAuthStore } from "@/store/authStore";
import {
  LayoutDashboard,
  Settings,
  LogOut,
  Users,
  Folder,
  ChevronRight,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { getInitials, getAvatarColor } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLiveMode } from "@/lib/supabase";
import { Avatar } from "@/components/ui/avatar";

export default function AppSidebar() {
  const { workspaceId } = useParams();
  const { workspaces, activeWorkspace, setActiveWorkspace } =
    useWorkspaceStore();
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: `/${workspaceId}` },
    { label: "projects", icon: Folder, path: `/${workspaceId}/projects` },
    { label: "Team", icon: Users, path: `/${workspaceId}/team` },
    { label: "Settings", icon: Settings, path: `/${workspaceId}/settings` },
  ];

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader
        className={`border-b border-sidebar-border ${isCollapsed ? "p-3" : "p-4"}`}
      >
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="icon" className="w-8 h-8 shrink-0" />
          {!isCollapsed && (
            <span className="font-bold text-sm leading-tight block">Taska</span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        {workspaces.length > 1 && (
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  className="w-full"
                  tooltip={activeWorkspace?.name ?? "Workspace"}
                >
                  <div
                    className="w-4 h-4 rounded shrink-0"
                    style={{
                      backgroundColor: activeWorkspace?.name
                        ? `hsl(${(activeWorkspace.name.charCodeAt(0) * 10) % 360}, 60%, 50%)`
                        : "#888",
                    }}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 truncate text-sm">
                        {activeWorkspace?.name ?? "Select Workspace"}
                      </span>
                      <ChevronsUpDown
                        size={14}
                        className="shrink-0 text-muted-foreground"
                      />
                    </>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="start" className="w-52">
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => {
                      setActiveWorkspace(ws);
                      navigate(`/${ws.id}`);
                    }}
                    className="flex items-center gap-2"
                  >
                    <div
                      className="w-3 h-3 rounded shrink-0"
                      style={{
                        backgroundColor: ws.name
                          ? `hsl(${(ws.name.charCodeAt(0) * 10) % 360}, 60%, 50%)`
                          : "#888",
                      }}
                    />
                    <span className="text-sm">{ws.name}</span>
                    {ws.id === workspaceId && (
                      <Check size={14} className="text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(({ path, icon: Icon, label }) => (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton asChild tooltip={label}>
                  <NavLink to={path} end={path === `/${workspaceId}`}>
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className="shrink-0" />
                        <span
                          className={
                            isActive ? "text-primary font-medium flex-1" : ""
                          }
                        >
                          {label}
                        </span>
                        {isActive && <ChevronRight size={14} />}
                      </>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {profile && (
        <SidebarFooter className="border-t border-sidebar-border p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton size="lg" tooltip={profile.full_name}>
                <Avatar
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${getAvatarColor(profile.full_name)}`}
                >
                  {getInitials(profile.full_name)}
                </Avatar>
                <div>
                  <p className="text-sm font-medium truncate">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {profile.email}
                  </p>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            {isLiveMode && (
              <DropdownMenuContent side="right" align="end" className="w-48">
                <DropdownMenuItem variant="destructive" onClick={signOut}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
