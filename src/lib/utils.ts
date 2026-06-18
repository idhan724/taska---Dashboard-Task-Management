import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getInitials = (fullName: string): string => {
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return parts[0][0] + parts[1][0].toUpperCase();
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-green-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const getProjectColor = (color: string) => {
  const colors: Record<
    string,
    { bg: string; bgHover: string; ring: string; ringHover: string }
  > = {
    violet: {
      bg: "bg-violet-600",
      bgHover: "hover:bg-violet-600",
      ring: "ring-violet-600",
      ringHover: "hover:ring-violet-600",
    },
    teal: {
      bg: "bg-teal-600",
      bgHover: "hover:bg-teal-600",
      ring: "ring-teal-600",
      ringHover: "hover:ring-teal-600",
    },
    orange: {
      bg: "bg-orange-600",
      bgHover: "hover:bg-orange-600",
      ring: "ring-orange-600",
      ringHover: "hover:ring-orange-600",
    },
    amber: {
      bg: "bg-amber-600",
      bgHover: "hover:bg-amber-600",
      ring: "ring-amber-600",
      ringHover: "hover:ring-amber-600",
    },
  };
  return colors[color] ?? colors.violet;
};
