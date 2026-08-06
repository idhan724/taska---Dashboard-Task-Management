import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProjectStatus } from "@/types";
import { useProjectStore } from "@/store/projectStore";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectCard from "@/components/project/ProjectCards";

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
        <TabsTrigger value="paused">Paused</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      {isFetching ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-38" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="flex items-center justify-center h-100">
          <p className="text-lg text-muted-foreground">
            There are no projects yet
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
          {filteredProjects.map((project, i) => (
            <ProjectCard key={project.id} project={project} i={i} />
          ))}
        </div>
      )}
    </Tabs>
  );
}
