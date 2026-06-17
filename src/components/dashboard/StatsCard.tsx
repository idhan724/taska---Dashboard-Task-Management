import { motion } from "motion/react";
import type { Stats } from "@/types";
import { KanbanIcon, ListTodo, Users } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardsProps {
  stats: Stats;
  isLoading: boolean;
}

const cards = [
  {
    key: "totalProjects" as const,
    label: "Total Projects",
    icon: KanbanIcon,
  },
  {
    key: "totalTasks" as const,
    label: "Total Tasks",
    icon: ListTodo,
  },
  {
    key: "totalMember" as const,
    label: "Total Members",
    icon: Users,
  },
];

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {isLoading
        ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-28" />)
        : cards.map(({ key, label, icon: Icon }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-5 space-y-3">
                  <div
                    className={`w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center`}
                  >
                    <Icon size={18} className="text-primary" />
                  </div>
                  <p className="text-3xl font-bold">{stats[key]}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {label}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
    </div>
  );
}
