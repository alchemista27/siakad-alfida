import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

export const GET = handler.GET;
export async function POST(req: NextRequest) {
  if (req.nextUrl.pathname === "/api/auth/sign-up/email") {
    return NextResponse.json({ error: "Forbidden. Gunakan halaman registrasi resmi." }, { status: 403 });
  }
  return handler.POST(req);
}
