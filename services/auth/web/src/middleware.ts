import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { safeReturnTo } from "@/lib/safe-return-to";

const publicRoutes = ["/login", "/register", "/register-staff"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken =
    request.cookies.get("alfida_session")?.value ||
    request.cookies.get("better-auth.session_token")?.value;

  // Jika membuka root (/)
  if (pathname === "/") {
    if (sessionToken) {
      return NextResponse.redirect(new URL("/modules", request.url));
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isPublic = publicRoutes.some((route) => pathname.startsWith(route));

  // Jika belum login dan mencoba akses rute privat (/modules atau /admin/users)
  if (!sessionToken && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    const returnTo = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("return_to", returnTo);
    return NextResponse.redirect(loginUrl);
  }

  // Jika sudah login dan membuka halaman login/register
  if (sessionToken && isPublic) {
    const rawReturnTo = request.nextUrl.searchParams.get("return_to") || request.nextUrl.searchParams.get("callbackUrl");
    const target = safeReturnTo(rawReturnTo, request.nextUrl.origin);
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
