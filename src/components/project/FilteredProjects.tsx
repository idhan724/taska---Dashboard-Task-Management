import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectStatus } from "@/types";
import { useProjectStore } from "@/store/projectStore";
import ProjectCards from "@/components/project/ProjectCards";

export default function FilteredProjects() {
  type TabsFilteredProps = ProjectStatus | "all";
  const { isFetching, setFilter, getFilteredProjects } = useProjectStore();

  const filteredProjects = getFilteredProjects();
  return (
    <Tabs
      defaultValue="all"
      onValueChange={(val) => setFilter({ status: val as TabsFilteredProps })}
      className="w-full my-25"
    >
      <TabsList className="mx-6">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Active</TabsTrigger>
        <TabsTrigger value="on_hold">On Hold</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      <ProjectCards projects={filteredProjects} isLoading={isFetching} />
    </Tabs>
  );
}
