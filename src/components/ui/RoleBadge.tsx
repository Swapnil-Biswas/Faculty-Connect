import { Role } from "@prisma/client";
import { getRoleLabel, getRoleColor } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  return (
    <span className={cn("role-badge", getRoleColor(role), className)}>
      {getRoleLabel(role)}
    </span>
  );
}