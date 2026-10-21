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
      section: "System Architecture",
      code: "SYSTEM ARCHITECTURE",
      items: [
        { href: "/admin", icon: <LayoutDashboard size={17} />, label: "System Overview" },
      ],
    },
    {
      section: "Identity & Topology",
      code: "IDENTITY & TOPOLOGY",
      items: [
        { href: "/admin/users", icon: <Users size={17} />, label: "User Directory" },
        { href: "/admin/clusters", icon: <UserCheck size={17} />, label: "Academic Clusters" },
      ],
    },
    {
      section: "Governance & Heuristics",
      code: "GOVERNANCE & HEURISTICS",
      items: [
        { href: "/admin/scoring", icon: <Star size={17} />, label: "Scoring Configuration" },
        { href: "/admin/badges", icon: <Trophy size={17} />, label: "Merit Badges" },
        { href: "/admin/notifications", icon: <Bell size={17} />, label: "Notification Rules" },
      ],
    },
    {
      section: "Operations & Audit",
      code: "OPERATIONS & AUDIT",
      items: [
        { href: "/admin/jobs", icon: <Clock size={17} />, label: "Automation Jobs" },
        { href: "/admin/webhooks", icon: <Globe size={17} />, label: "External Webhooks" },
        { href: "/admin/audit", icon: <Shield size={17} />, label: "Security Audit Ledger" },
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
      {/* Bauhaus Institutional Brand Header */}
      <div className="sidebar-brand">
        <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "6px 8px", backgroundColor: "#FFFFFF", border: "2px solid #121212", boxShadow: "3px 3px 0px 0px #121212" }}>
          <span style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#D02020", display: "inline-block", border: "1.5px solid #121212" }} />
          <span style={{ width: 12, height: 12, borderRadius: 0, backgroundColor: "#1040C0", display: "inline-block", border: "1.5px solid #121212" }} />
          <span
            style={{
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderBottom: "12px solid #F0C020",
              display: "inline-block",
            }}
          />
        </div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">
            <span>FACULTY CONNECT</span>
          </div>
          <div className="sidebar-brand-dept" title={deptName}>
            {deptName}
          </div>
          <div style={{ marginTop: 2 }}>
            <span style={{ fontSize: 10.5, fontWeight: 700, color: "#121212", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              AY 2026–27
            </span>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {navGroups.map((group) => (
          <div key={group.section} style={{ marginBottom: 12 }}>
            <div className="sidebar-section-label" style={{ fontFamily: "var(--font-body)", letterSpacing: "0.08em", color: "#121212" }}>
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
                    <span className="sidebar-item-badge" style={{ borderRadius: 0, border: "1.5px solid #121212", backgroundColor: "#D02020", color: "#FFFFFF" }}>{item.badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Cyber Console Footer */}
      <div className="sidebar-footer" style={{ borderTop: "4px solid #121212", backgroundColor: "#FFFFFF", padding: "12px 14px" }}>
        <div className="sidebar-user" title={`${session.user.name} — ${getRoleLabel(role)}`}>
          <div 
            className="avatar avatar-sm" 
            style={{ 
              background: "#121212", 
              border: "2px solid #121212", 
              color: "#FFFFFF",
              fontWeight: 900,
              borderRadius: "50%",
            }}
          >
            {getInitials(session.user.name)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name" style={{ fontWeight: 700, color: "#121212" }}>{session.user.name}</div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 2 }}>
              <span 
                style={{ 
                  fontFamily: "var(--font-body)", 
                  fontSize: 10, 
                  fontWeight: 700,
                  color: "#121212",
                  letterSpacing: "0.06em",
                  background: "#F0C020",
                  border: "1.5px solid #121212",
                  padding: "1px 6px",
                  borderRadius: 0,
                  textTransform: "uppercase",
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
              borderRadius: 0,
              border: "1.5px solid #121212",
              backgroundColor: "#FFFFFF",
              color: "#121212",
              cursor: "pointer",
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}