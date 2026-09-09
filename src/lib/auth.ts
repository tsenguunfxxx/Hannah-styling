import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { mergeGuestCartIntoUser } from "@/lib/cart-merge";
import { loginSchema } from "@/schemas/auth.schema";
import type { Role } from "@/generated/prisma/enums";

/**
 * Auth.js (NextAuth v5) тохиргоо.
 *
 * Экспортлогдож байгаа зүйлс:
 *   handlers — /api/auth/... route-д хэрэглэнэ
 *   auth     — session уншина (Server Component, Server Action, proxy дотор)
 *   signIn   — нэвтрүүлнэ
 *   signOut  — гаргана
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // JWT: session-ийг cookie дотор шифрлэж хадгална.
  // Хуудас ачаалах бүрд database руу хандахгүй тул хурдан.
  session: { strategy: "jwt" },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    Credentials({
      credentials: {
        identifier: { label: "Имэйл", type: "text" },
        password: { label: "Нууц үг", type: "password" },
      },

      /**
       * Нэвтрэх оролдлого бүрд ажиллана.
       * Хэрэглэгч буцаавал → нэвтэрсэн. null буцаавал → амжилтгүй.
       */
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        /*
          Зөвхөн ИМЭЙЛЭЭР хайна. Утсаар нэвтрэх боломжийг хассан —
          `loginSchema` дээр имэйл эсэхийг аль хэдийн шалгасан тул
          энд өөр хувилбар шаардлагагүй.

          Имэйлийг ЖИЖИГ үсэг рүү буулгана: бүртгэх үед мөн адил
          хийдэг тул "Name@Mail.com" ч таарна.
        */
        const { identifier } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email: identifier.toLowerCase() },
        });

        // Хэрэглэгч байхгүй, эсвэл зөвхөн Google-ээр бүртгүүлсэн (password хоосон)
        if (!user?.password) return null;

        const isValid = await bcrypt.compare(parsed.data.password, user.password);
        if (!isValid) return null;

        // ЭНД буцаасан зүйл л JWT рүү орно. password-ыг ХЭЗЭЭ Ч буцаахгүй.
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  callbacks: {
    /**
     * JWT үүсэх/шинэчлэгдэх бүрд ажиллана.
     * Хэрэглэгчийн id ба role-ийг token дотор хадгална.
     */
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as Role;
      }

      // Профайл засах үед session-ийг шинэчлэх
      if (trigger === "update" && session?.name) {
        token.name = session.name as string;
      }

      return token;
    },

    /**
     * Component дотроос session уншихад ажиллана.
     * token дотор байгаа мэдээллийг session.user рүү хуулна.
     */
    async session({ session, token }) {
      if (token.id) session.user.id = token.id;
      if (token.role) session.user.role = token.role;
      return session;
    },
  },

  events: {
    /**
     * Нэвтрэх бүрд ажиллана.
     * Зочин байхдаа сагсалсан барааг хэрэглэгчийн сагстай нэгтгэнэ.
     */
    async signIn({ user }) {
      if (!user.id) return;

      try {
        await mergeGuestCartIntoUser(user.id);
      } catch (error) {
        // Сагс нэгтгэх нь БҮТЭЛГҮЙТСЭН ч нэвтрэх үйлдлийг зогсоохгүй.
        // Хэрэглэгчийн хувьд нэвтрэх нь илүү чухал.
        console.error("Зочны сагсыг нэгтгэж чадсангүй:", error);
      }
    },
  },
});
