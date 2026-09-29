import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
      clusterId: string | null;
      avatarUrl: string | null;
    };
  }

  interface User {
    role: Role;
    clusterId: string | null;
    avatarUrl: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    clusterId: string | null;
    avatarUrl: string | null;
  }
}
