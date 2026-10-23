import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function publicReturnUrl(request: NextRequest): string {
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "https";
  if (host) return `${protocol}://${host}${request.nextUrl.pathname}${request.nextUrl.search}`;
  return request.url;
}

export function middleware(request: NextRequest) {
  const session =
    request.cookies.get("alfida_session")?.value ||
    request.cookies.get("better-auth.session_token")?.value ||
    request.cookies.get("__Secure-better-auth.session_token")?.value;
  if (session) return NextResponse.next();

  const loginUrl = new URL("/login", process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id");
  loginUrl.searchParams.set("return_to", publicReturnUrl(request));
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
