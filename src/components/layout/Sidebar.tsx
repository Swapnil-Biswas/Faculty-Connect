"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  LayoutDashboard, CheckSquare, Calendar, Star, BarChart3,
  Users, Settings, LogOut, Bell, Shield, BookOpen, Trophy,
  ClipboardList, UserCheck, Globe, Award, Clock
} from "lucide-react";
import { Role } from "@prisma/client";
import { getRoleLabel, getRoleColor, getInitials } from "@/lib/utils";

type NavItem = {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
};

const NAV_BY_ROLE: Record<Role, { section: string; code: string; items: NavItem[] }[]> = {
  FACULTY: [
    {
      section: "Overview",
      code: "// 01 WORKSPACE",
      items: [
        { href: "/faculty", icon: <LayoutDashboard size={17} />, label: "Dashboard" },
        { href: "/faculty/tasks", icon: <CheckSquare size={17} />, label: "My Tasks" },
        { href: "/faculty/leave", icon: <Calendar size={17} />, label: "Leave Requests" },
      ],
    },
    {
      section: "Recognition",
      code: "// 02 RECOGNITION",
      items: [
        { href: "/faculty/stars", icon: <Star size={17} />, label: "My Stars & Badges" },
        { href: "/faculty/leaderboard", icon: <Trophy size={17} />, label: "Leaderboard" },
      ],
    },
    {
      section: "Research",
      code: "// 03 SCHOLARLY",
      items: [
        { href: "/faculty/publications", icon: <BookOpen size={17} />, label: "Publications" },
      ],
    },
    {
      section: "Communication",
      code: "// 04 COMMS",
      items: [
        { href: "/faculty/notifications", icon: <Bell size={17} />, label: "Notifications" },
      ],
    },
  ],
  CLUSTER_HEAD: [
    {
      section: "Overview",
      code: "// 01 OVERVIEW",
      items: [
        { href: "/cluster", icon: <LayoutDashboard size={17} />, label: "Cluster Console" },
        { href: "/cluster/tasks", icon: <CheckSquare size={17} />, label: "Tasks Matrix" },
        { href: "/cluster/leave", icon: <Calendar size={17} />, label: "Leave Approvals" },
      ],
    },
    {
      section: "Management",
      code: "// 02 MANAGEMENT",
      items: [
        { href: "/cluster/roster", icon: <Users size={17} />, label: "Faculty Roster" },
        { href: "/cluster/evaluations", icon: <UserCheck size={17} />, label: "Evaluations" },
        { href: "/cluster/leaderboard", icon: <Trophy size={17} />, label: "Leaderboard" },
      ],
    },
    {
      section: "Reports",
      code: "// 03 ANALYTICS",
      items: [
        { href: "/cluster/analytics", icon: <BarChart3 size={17} />, label: "Cluster Analytics" },
      ],
    },
    {
      section: "Personal",
      code: "// 04 PERSONAL",
      items: [
        { href: "/faculty", icon: <Star size={17} />, label: "My Profile Dashboard" },
      ],
    },
  ],
  HOD: [
    {
      section: "Attention",
      code: "ATTENTION",
      items: [
        { href: "/hod", icon: <LayoutDashboard size={17} />, label: "Department Overview" },
      ],
    },
    {
      section: "Academic Operations",
      code: "ACADEMIC OPERATIONS",
      items: [
        { href: "/hod/tasks", icon: <CheckSquare size={17} />, label: "Tasks Matrix" },
        { href: "/hod/leave", icon: <Calendar size={17} />, label: "Leave Approvals" },
      ],
    },
    {
      section: "Oversight & Recognition",
      code: "OVERSIGHT & RECOGNITION",
      items: [
        { href: "/hod/clusters", icon: <Users size={17} />, label: "Academic Clusters" },
        { href: "/hod/analytics", icon: <BarChart3 size={17} />, label: "Department Analytics" },
        { href: "/hod/leaderboard", icon: <Trophy size={17} />, label: "Faculty Leaderboard" },
        { href: "/hod/faculty-of-month", icon: <Star size={17} />, label: "Faculty of the Month" },
      ],
    },
    {
      section: "Compliance & Governance",
      code: "COMPLIANCE & GOVERNANCE",
      items: [
        { href: "/hod/accreditation", icon: <Award size={17} />, label: "Accreditation & SSR" },
        { href: "/hod/audit", icon: <Shield size={17} />, label: "Audit Ledger" },
        { href: "/hod/export", icon: <ClipboardList size={17} />, label: "Data Export" },
        { href: "/hod/scoring", icon: <Settings size={17} />, label: "Scoring System" },
      ],
    },
  ],
  ADMIN: [
    {
      section: "System",
      code: "// 01 INFRASTRUCTURE",
      items: [
        { href: "/admin", icon: <LayoutDashboard size={17} />, label: "System Console" },
        { href: "/admin/users", icon: <Users size={17} />, label: "User Directory" },
        { href: "/admin/clusters", icon: <UserCheck size={17} />, label: "Cluster Units" },
        { href: "/admin/jobs", icon: <Clock size={17} />, label: "Cron & Automations" },
        { href: "/admin/webhooks", icon: <Globe size={17} />, label: "Webhooks & API" },
      ],
    },
    {
      section: "Configuration",
      code: "// 02 CONFIGURATION",
      items: [
        { href: "/admin/scoring", icon: <Star size={17} />, label: "Global Scoring" },
        { href: "/admin/notifications", icon: <Bell size={17} />, label: "Dispatch Rules" },
        { href: "/admin/badges", icon: <Trophy size={17} />, label: "Badge Registry" },
      ],
    },
    {
      section: "Audit",
      code: "// 03 AUDIT & LOGS",
      items: [
        { href: "/admin/audit", icon: <Shield size={17} />, label: "Security Audit" },
      ],
    },
  ],
};

const ROLE_GLYPHS: Record<Role, string> = {
  FACULTY: "◆",
  CLUSTER_HEAD: "▣",
  HOD: "◈",
  ADMIN: "★",
};

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  if (!session) return null;

  const role = session.user.role;
  const navGroups = NAV_BY_ROLE[role] ?? [];
  const deptName = process.env.NEXT_PUBLIC_DEPARTMENT_NAME ?? "Dept. of Computer Science & Engineering";

  return (
    <aside className="sidebar" aria-label="Main navigation">
      {/* Institutional Brand Header */}
      <div className="sidebar-brand">
        <div className="sidebar-logo" style={{ backgroundColor: "#173B67", border: "1px solid #173B67" }}>FC</div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">
            <span>FACULTY CONNECT</span>
          </div>
          <div className="sidebar-brand-dept" title={deptName}>
            {deptName}
          </div>
          <div style={{ marginTop: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: "#667085" }}>
              Academic Year 2026–27
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navGroups.map((group) => (
          <div key={group.section} style={{ marginBottom: 8 }}>
            <div className="sidebar-section-label" style={{ fontFamily: "var(--font-sans, Inter)", letterSpacing: "0.06em", color: "#667085" }}>
              <span>{group.code}</span>
            </div>
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
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge != null && item.badge > 0 && (
                    <span className="sidebar-item-badge">{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Cyber Console Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user" title={`${session.user.name} — ${getRoleLabel(role)}`}>
          <div 
            className="avatar avatar-sm" 
            style={{ 
              background: "var(--grey-800, #1D1D1F)", 
              border: "1px solid var(--grey-800, #1D1D1F)", 
              color: "#FFFFFF",
              fontWeight: 700,
            }}
          >
            {getInitials(session.user.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">{session.user.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <span 
                style={{ 
                  fontFamily: "var(--font-mono)", 
                  fontSize: 10, 
                  fontWeight: 600,
                  color: "var(--grey-600, #424245)",
                  letterSpacing: "0.04em",
                  background: "var(--grey-100, #E8E8ED)",
                  border: "1px solid var(--grey-200, #D2D2D7)",
                  padding: "1px 6px",
                  borderRadius: 4
                }}
              >
                {ROLE_GLYPHS[role]} {getRoleLabel(role)}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="btn-ghost"
            title="Sign out"
            aria-label="Sign out"
            style={{
              padding: 6,
              borderRadius: 6,
              color: "var(--grey-500, #6E6E73)",
              transition: "all 0.15s ease",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}