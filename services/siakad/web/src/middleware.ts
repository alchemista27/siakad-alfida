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

export function middleware(request: NextRequest) {
  const isProtected = true;
  if (!isProtected) return NextResponse.next();

  const sessionToken =
    request.cookies.get("alfida_session")?.value ||
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;
  if (sessionToken) return NextResponse.next();

  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";
  const loginUrl = new URL("/login", authUrl);
  loginUrl.searchParams.set("return_to", getReturnUrl(request));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
