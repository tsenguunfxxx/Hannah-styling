import { handlers } from "@/lib/auth";

/**
 * Auth.js-ийн бүх хүсэлт энэ route руу ирнэ:
 *   /api/auth/signin, /api/auth/signout, /api/auth/session, /api/auth/callback/...
 * Гараар логик бичих шаардлагагүй — Auth.js өөрөө хариулна.
 */
export const { GET, POST } = handlers;
