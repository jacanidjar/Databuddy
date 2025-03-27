import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const nonAuthRoutes = [ "/login", "/register", "/verify-email", "/reset-password", "/forgot-password" ];

export default async function middleware(request: NextRequest) {
  const session = getSessionCookie(request);

  if (!session && !nonAuthRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}


export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico, sitemap.xml, robots.txt (metadata files)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
    ],
};