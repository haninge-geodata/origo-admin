import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const authEnabled = process.env.AUTH_ENABLED === "true";
  const publicPaths = ["/api/auth", "/login", "/signup"];
  const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));
  const sessionCookie = process.env.NEXTAUTH_URL?.startsWith("https://") ? "__Secure-next-auth.session-token" : "next-auth.session-token";

  if (authEnabled && !isPublicPath) {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: sessionCookie
    });

    if (!token || token.error === "RefreshAccessTokenError") {
      const url = req.nextUrl.clone();
      url.pathname = "/api/auth/signin";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
