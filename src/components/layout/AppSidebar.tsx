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
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isLiveMode } from "@/lib/supabase";

export default function AppSidebar() {
  const { workspaceId } = useParams();
  const { workspaces, setActiveWorkspace } = useWorkspaceStore();
  const { profile, signOut } = useAuthStore();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", icon: LayoutDashboard, path: `/${workspaceId}` },
    { label: "Team", icon: Users, path: `/${workspaceId}/team` },
    { label: "projects", icon: Folder, path: `/${workspaceId}/projects` },
    { label: "Settings", icon: Settings, path: `/${workspaceId}/settings` },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border p-5">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="icon" className="w-8 h-8" />
          <div>
            <span className="font-bold text-sm leading-tight block">Taska</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {workspaces.length > 1 && (
          <SidebarGroup>
            <SidebarGroupLabel>Workspace</SidebarGroupLabel>
            <Select
              value={workspaceId}
              onValueChange={(value) => {
                const selected = workspaces.find((w) => w.id === value);
                if (selected) setActiveWorkspace(selected);
              }}
            >
              <SelectTrigger className="w-full max-w-48">
                <SelectValue placeholder="Select a workspace" />
              </SelectTrigger>
              <SelectContent>
                {workspaces.map((ws) => (
                  <SelectItem key={ws.id} value={ws.id}>
                    {ws.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </SidebarGroup>
        )}

        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarMenu>
            {navItems.map(({ path, icon: Icon, label }) => (
              <SidebarMenuItem key={path}>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={path}
                    end={path === "/"}
                    className={({ isActive }) =>
                      isActive ? "text-primary font-medium" : ""
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className="shrink-0" />
                        <span className="flex-1">{label}</span>
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
              <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent cursor-pointer transition-colors">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(profile.full_name)}`}
                >
                  {getInitials(profile.full_name)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {profile.full_name}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {profile.email}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => navigate(`/${workspaceId}/settings`)}
              >
                <Settings />
                Settings
              </DropdownMenuItem>
              {isLiveMode && (
                <DropdownMenuItem variant="destructive" onClick={signOut}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
