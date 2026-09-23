import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const publicRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Cek session cookie secara langsung tanpa fetch HTTP
  const sessionCookie = getSessionCookie(request);

  // Jika di halaman root (/)
  if (pathname === "/") {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/modules", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isPublicRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Jika belum login dan mencoba akses halaman privat
  if (!sessionCookie && !isPublicRoute) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan membuka halaman login/register
  if (sessionCookie && isPublicRoute) {
    return NextResponse.redirect(new URL("/modules", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
