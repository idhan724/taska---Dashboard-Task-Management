import { motion } from "motion/react";
import { CheckCircle2, Circle, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface TaskOverviewProps {
  todo: number;
  inProgress: number;
  done: number;
  overdue: number;
  totalTasks: number;
  isLoading: boolean;
}

export function TaskOverview({
  todo,
  inProgress,
  done,
  overdue,
  totalTasks,
  isLoading,
}: TaskOverviewProps) {
  const items = [
    {
      label: "To do",
      value: todo,
      icon: Circle,
      color: "text-gray-400",
      bar: "bg-gray-400",
    },
    {
      label: "In progress",
      value: inProgress,
      icon: Clock,
      color: "text-blue-500",
      bar: "bg-blue-500",
    },
    {
      label: "Done",
      value: done,
      icon: CheckCircle2,
      color: "text-green-500",
      bar: "bg-green-500",
    },
    {
      label: "Overdue",
      value: overdue,
      icon: AlertCircle,
      color: "text-red-500",
      bar: "bg-red-500",
    },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Task overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {isLoading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
          : items.map(({ label, value, icon: Icon, color, bar }, i) => {
              const percent = totalTasks > 0 ? (value / totalTasks) * 100 : 0;
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <Card>
                    <CardContent className="pt-4 pb-3 px-4">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${color}`} />
                        <span className="text-xs text-muted-foreground">
                          {label}
                        </span>
                      </div>
                      <p className="text-2xl font-semibold mb-2">{value}</p>
                      <Progress value={percent} indicatorClassName={`${bar}`} />
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
      </div>
    </div>
  );
}
