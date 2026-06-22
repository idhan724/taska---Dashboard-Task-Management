import TeamCards from "@/components/team/TeamCards";
import InviteDialogButton from "@/components/team/inviteDialogButton";

export default function Teams() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Teams</h1>
        <InviteDialogButton />
      </div>
      <TeamCards />
    </>
  );
}
