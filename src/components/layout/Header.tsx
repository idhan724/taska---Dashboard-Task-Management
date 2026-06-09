import { useWorkspaceStore } from "../../store/workspaceStore";
import { SidebarTrigger } from "../ui/sidebar";

export default function Header() {
  const { activeWorkspace } = useWorkspaceStore();

  return (
    <header className="h-14 bg-white border-b px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <h1 className="font-semibold text-gray-800">{activeWorkspace?.name}</h1>
      </div>
    </header>
  );
}
