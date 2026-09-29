import type { NextAuthConfig } from "next-auth";
import { Role } from "@prisma/client";

// Edge-safe config used only in proxy.ts (no db imports)
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = (auth?.user as { role?: Role })?.role;
      const pathname = nextUrl.pathname;

      // Public routes
      if (pathname === "/login" || pathname === "/") {
        if (isLoggedIn && role) {
          return Response.redirect(new URL(getDashboardPath(role), nextUrl));
        }
        return true;
      }

      // Must be logged in for all other routes
      if (!isLoggedIn) {
        return false; // Redirects to signIn page
      }

      // Role gates
      if (pathname.startsWith("/admin") && role !== "ADMIN") {
        return Response.redirect(new URL(getDashboardPath(role!), nextUrl));
      }
      if (pathname.startsWith("/hod") && !["HOD", "ADMIN"].includes(role!)) {
        return Response.redirect(new URL(getDashboardPath(role!), nextUrl));
      }
      if (
        pathname.startsWith("/cluster") &&
        !["CLUSTER_HEAD", "HOD", "ADMIN"].includes(role!)
      ) {
        return Response.redirect(new URL(getDashboardPath(role!), nextUrl));
      }

      return true;
    },
  },
  providers: [],
  session: { strategy: "jwt" },
};

function getDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN": return "/admin";
    case "HOD": return "/hod";
    case "CLUSTER_HEAD": return "/cluster";
    default: return "/faculty";
  }
}