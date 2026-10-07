import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Role } from "@prisma/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRoleLabel(role: Role): string {
  const labels: Record<Role, string> = {
    ADMIN: "Administrator",
    HOD: "Head of Department",
    CLUSTER_HEAD: "Cluster Head",
    FACULTY: "Faculty",
  };
  return labels[role];
}

export function getRoleColor(role: Role): string {
  const colors: Record<Role, string> = {
    ADMIN: "role-admin",
    HOD: "role-hod",
    CLUSTER_HEAD: "role-cluster",
    FACULTY: "role-faculty",
  };
  return colors[role];
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN": return "/admin";
    case "HOD": return "/hod";
    case "CLUSTER_HEAD": return "/cluster";
    default: return "/faculty";
  }
}
