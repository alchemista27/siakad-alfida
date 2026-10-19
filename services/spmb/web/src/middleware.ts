import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function getReturnUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto") || "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}${request.nextUrl.pathname}${request.nextUrl.search}`;
  }
  return request.url;
}

const protectedPrefixes = ["/admin", "/observer", "/parent", "/status"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";

  if (pathname === "/login") {
    const loginUrl = new URL("/login", authUrl);
    const returnUrl = `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host") || request.headers.get("host") || "spmb.alfida.or.id"}/admin`;
    loginUrl.searchParams.set("return_to", returnUrl);
    return NextResponse.redirect(loginUrl);
  }

  const isProtected = pathname === "/" || protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const sessionToken =
      request.cookies.get("alfida_session")?.value ||
      request.cookies.get("better-auth.session_token")?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", authUrl);
      const returnUrl = pathname === "/"
        ? `${request.headers.get("x-forwarded-proto") || "https"}://${request.headers.get("x-forwarded-host") || request.headers.get("host") || "spmb.alfida.or.id"}/admin`
        : getReturnUrl(request);
      loginUrl.searchParams.set("return_to", returnUrl);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
