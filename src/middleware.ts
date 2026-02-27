import { NextResponse, type NextRequest } from "next/server";
import { createAuthMiddleware } from "@eximia/auth/server";

const handleAuth = createAuthMiddleware({
  publicRoutes: ["/"],
  authRoutes: ["/login", "/signup", "/forgot-password", "/reset-password"],
  loginUrl: "/login",
  afterLoginUrl: "/apps",
  appId: "auth-portal",
  cookieDomain: process.env.NEXT_PUBLIC_COOKIE_DOMAIN ?? ".eximia.app",
});

export async function middleware(request: NextRequest) {
  return handleAuth(request, {
    createNextResponse: (req) => NextResponse.next({ request: req as NextRequest }),
    redirect: (url) => NextResponse.redirect(url),
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
