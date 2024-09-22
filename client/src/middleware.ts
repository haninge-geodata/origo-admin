import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const publicPaths = ["/api/auth", "/login", "/signup"];
  const isPublicPath = publicPaths.some((path) => req.nextUrl.pathname.startsWith(path));
  const authEnabled = process.env.PROTECTED_AUTH_ENABLED === undefined || process.env.PROTECTED_AUTH_ENABLED === "true";

  if (authEnabled && !isPublicPath) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/api/auth/signin";
      return NextResponse.redirect(url);
    }

    if (token.error === "RefreshAccessTokenError") {
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
