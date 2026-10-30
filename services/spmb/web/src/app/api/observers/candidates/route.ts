import { NextRequest, NextResponse } from "next/server";
import { getAuthApiBaseUrl } from "@/lib/sso-server";

export async function GET(request: NextRequest) {
  const unitId = request.nextUrl.searchParams.get("unitId")?.trim() || "";
  const search = request.nextUrl.searchParams.get("search")?.trim() || "";

  if (!unitId) {
    return NextResponse.json({ message: "Unit penugasan wajib dipilih." }, { status: 400 });
  }

  const upstreamUrl = new URL(`${getAuthApiBaseUrl()}/api/admin/users/observer-candidates`);
  upstreamUrl.searchParams.set("unitId", unitId);
  upstreamUrl.searchParams.set("search", search.slice(0, 100));

  try {
    const upstream = await fetch(upstreamUrl, {
      cache: "no-store",
      headers: {
        accept: "application/json",
        cookie: request.headers.get("cookie") || "",
      },
    });
    const body = await upstream.json().catch(() => ({ message: "Respons pencarian observer tidak valid." }));

    return NextResponse.json(body, {
      status: upstream.status,
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json(
      { message: "Layanan identitas sedang tidak dapat dihubungi. Silakan coba lagi." },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
