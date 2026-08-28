import type { DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/enums";

/**
 * Auth.js-ийн үндсэн төрлүүдийг өргөтгөнө.
 * Ингэснээр session.user.role гэж бичихэд TypeScript алдаа өгөхгүй.
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    role: Role;
  }
}

// NextAuth v5-д JWT-ийн төрөл @auth/core-оос ирдэг тул хоёуланг нь өргөтгөнө
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
