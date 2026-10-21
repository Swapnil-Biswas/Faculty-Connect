import { Role } from "@prisma/client";
import { getRoleLabel } from "@/lib/utils";

interface RoleBadgeProps {
  role: Role;
  className?: string;
}

export function RoleBadge({ role, className = "" }: RoleBadgeProps) {
  const getStyle = (r: Role) => {
    switch (r) {
      case "ADMIN":
        return {
          backgroundColor: "#D02020",
          color: "#FFFFFF",
        };
      case "HOD":
        return {
          backgroundColor: "#F0C020",
          color: "#121212",
        };
      case "CLUSTER_HEAD":
        return {
          backgroundColor: "#1040C0",
          color: "#FFFFFF",
        };
      default:
        return {
          backgroundColor: "#FFFFFF",
          color: "#121212",
        };
    }
  };

  const style = getStyle(role);

  return (
    <span
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        fontSize: "11px",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        border: "2px solid #121212",
        boxShadow: "2px 2px 0px 0px #121212",
        borderRadius: 0,
        lineHeight: 1.2,
        ...style,
      }}
    >
      {getRoleLabel(role)}
    </span>
  );
}

export default RoleBadge;