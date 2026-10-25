import { NextRequest, NextResponse } from "next/server";
import { lookupSsoUser } from "@/lib/sso-server";

export async function GET(request: NextRequest) {
  const result = await lookupSsoUser(request.headers.get("cookie") || "");

  return NextResponse.json(result.body, {
    status: result.status,
    headers: { "Cache-Control": "no-store" },
  });
}
