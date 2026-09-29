"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, CheckSquare, Calendar, Star, BarChart3,
  Users, Settings, LogOut, Bell, Shield, BookOpen, Trophy,
  ClipboardList, UserCheck
} from "lucide-react";
import { Role } from "@prisma/client";
import { getRoleLabel, getRoleColor, getInitials } from "@/lib/utils";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
};

const NAV_BY_ROLE: Record<Role, { section: string; items: NavItem[] }[]> = {
  FACULTY: [
    {
      section: "Overview",
      items: [
        { href: "/faculty", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
        { href: "/faculty/tasks", icon: <CheckSquare size={18} />, label: "My Tasks" },
        { href: "/faculty/leave", icon: <Calendar size={18} />, label: "Leave" },
      ],
    },
    {
      section: "Recognition",
      items: [
        { href: "/faculty/stars", icon: <Star size={18} />, label: "My Stars" },
        { href: "/faculty/leaderboard", icon: <Trophy size={18} />, label: "Leaderboard" },
      ],
    },
    {
      section: "Research",
      items: [
        { href: "/faculty/publications", icon: <BookOpen size={18} />, label: "Publications" },
      ],
    },
  ],
  CLUSTER_HEAD: [
    {
      section: "Overview",
      items: [
        { href: "/cluster", icon: <LayoutDashboard size={18} />, label: "Dashboard" },
        { href: "/cluster/tasks", icon: <CheckSquare size={18} />, label: "Tasks" },
        { href: "/cluster/leave", icon: <Calendar size={18} />, label: "Leave Requests" },
      ],
    },
    {
      section: "Management",
      items: [
        { href: "/cluster/roster", icon: <Users size={18} />, label: "Faculty Roster" },
        { href: "/cluster/evaluations", icon: <UserCheck size={18} />, label: "Evaluations" },
        { href: "/cluster/leaderboard", icon: <Trophy size={18} />, label: "Leaderboard" },
      ],
    },
    {
      section: "Reports",
      items: [
        { href: "/cluster/analytics", icon: <BarChart3 size={18} />, label: "Analytics" },
      ],
    },
    {
      section: "My Profile",
      items: [
        { href: "/faculty", icon: <Star size={18} />, label: "My Dashboard" },
      ],
    },
  ],
  HOD: [
    {
      section: "Overview",
      items: [
        { href: "/hod", icon: <LayoutDashboard size={18} />, label: "Department Dashboard" },
        { href: "/hod/clusters", icon: <Users size={18} />, label: "Clusters" },
        { href: "/hod/tasks", icon: <CheckSquare size={18} />, label: "Tasks" },
        { href: "/hod/leave", icon: <Calendar size={18} />, label: "Leave Overview" },
      ],
    },
    {
      section: "Recognition",
      items: [
        { href: "/hod/leaderboard", icon: <Trophy size={18} />, label: "Leaderboard" },
        { href: "/hod/faculty-of-month", icon: <Star size={18} />, label: "Faculty of Month" },
      ],
    },
    {
      section: "Reports",
      items: [
        { href: "/hod/analytics", icon: <BarChart3 size={18} />, label: "Analytics" },
        { href: "/hod/export", icon: <ClipboardList size={18} />, label: "Export Data" },
        { href: "/hod/audit", icon: <Shield size={18} />, label: "Audit Log" },
      ],
    },
    {
      section: "Config",
      items: [
        { href: "/hod/scoring", icon: <Settings size={18} />, label: "Scoring Config" },
      ],
    },
  ],
  ADMIN: [
    {
      section: "System",
      items: [
        { href: "/admin", icon: <LayoutDashboard size={18} />, label: "Admin Dashboard" },
        { href: "/admin/users", icon: <Users size={18} />, label: "Users & Roles" },
        { href: "/admin/clusters", icon: <UserCheck size={18} />, label: "Clusters" },
      ],
    },
    {
      section: "Configuration",
      items: [
        { href: "/admin/scoring", icon: <Star size={18} />, label: "Scoring Defaults" },
        { href: "/admin/notifications", icon: <Bell size={18} />, label: "Notification Rules" },
        { href: "/admin/badges", icon: <Trophy size={18} />, label: "Badges" },
      ],
    },
    {
      section: "Audit & History",
      items: [
        { href: "/admin/audit", icon: <Shield size={18} />, label: "Full Audit Log" },
      ],
    },
  ],
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user.role;
  const navGroups = NAV_BY_ROLE[role] ?? [];
  const deptName = process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Department";

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">FC</div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">Faculty Connect</span>
          <span className="sidebar-brand-dept" title={deptName}>{deptName}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navGroups.map((group) => (
          <div key={group.section}>
            <div className="sidebar-section-label">{group.section}</div>
            {group.items.map((item) => {
              const isActive =
                item.href === `/${role.toLowerCase().replace("_", "")}` ||
                item.href === "/faculty"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`sidebar-item ${isActive ? "active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className="sidebar-item-icon">{item.icon}</span>
                  {item.label}
                  {item.badge != null && item.badge > 0 && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" title={`${session.user.name} — ${getRoleLabel(role)}`}>
          <div className={`avatar avatar-sm`}>
            {getInitials(session.user.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{session.user.name}</div>
            <div className="sidebar-user-role">
              <span className={`role-badge ${getRoleColor(role)}`} style={{ fontSize: 10, padding: "1px 7px" }}>
                {getRoleLabel(role)}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost"
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}