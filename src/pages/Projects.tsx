import FilteredProjects from "@/components/project/FilteredProjects";
import AddProjectButton from "@/components/project/AddProjectButton";

export default function Projects() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <AddProjectButton />
      </div>
      <FilteredProjects />
    </>
  );
}
