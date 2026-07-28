import { motion } from "motion/react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { getAvatarColor, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import RemoveMemberButton from "./RemoveMemberButton";

export default function TeamCards() {
  const { profile } = useAuthStore();
  const { activeWorkspace, members, isFetching } = useWorkspaceStore();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-7">
      {isFetching
        ? [...Array(members.length)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        : members.map((member, i) => {
            const isOwner = activeWorkspace?.owner_id === profile?.id;
            const canRemove =
              isOwner && member.profile.id !== activeWorkspace?.owner_id;
            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card>
                  <CardContent className="flex flex-col items-center p-4">
                    <Avatar
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-md font-bold shrink-0 ${getAvatarColor(member.profile.full_name)}`}
                    >
                      {getInitials(member.profile.full_name)}
                    </Avatar>
                    <p className="font-semibold mt-4">
                      {member.profile.full_name}
                    </p>
                    <p className="text-sm">{member.role}</p>
                  </CardContent>
                  {canRemove ? (
                    <RemoveMemberButton member={member} />
                  ) : !isOwner || members.length <= 1 ? (
                    <></>
                  ) : (
                    <div className="h-8" />
                  )}
                </Card>
              </motion.div>
            );
          })}
    </div>
  );
}
