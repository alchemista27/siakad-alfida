import { NextRequest, NextResponse } from "next/server";
import { createAcceptancePdf, type AcceptanceLetterPdfInput } from "@/lib/letters/acceptance-pdf";

function parseLetter(payload: unknown): AcceptanceLetterPdfInput | null {
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  const required = ["registrationNumber", "unitName", "academicYearLabel", "studentName"] as const;
  if (!required.every((key) => typeof value[key] === "string" && value[key].trim())) return null;

  return {
    registrationNumber: value.registrationNumber as string,
    unitName: value.unitName as string,
    academicYearLabel: value.academicYearLabel as string,
    studentName: value.studentName as string,
    decisionNote: typeof value.decisionNote === "string" ? value.decisionNote : null,
  };
}

function safeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "surat-diterima";
}

export async function GET(request: NextRequest) {
  const registrationId = request.nextUrl.searchParams.get("registrationId")?.trim();
  if (!registrationId) {
    return NextResponse.json({ message: "registrationId wajib diisi." }, { status: 400 });
  }

  const apiBase = (process.env.SPMB_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3012").replace(/\/$/, "");
  const cookieHeader = request.headers.get("cookie") || "";
  const authHeader = request.headers.get("authorization") || "";

  const upstream = await fetch(
    `${apiBase}/api/letters/acceptance/${encodeURIComponent(registrationId)}`,
    {
      headers: {
        ...(cookieHeader ? { cookie: cookieHeader } : {}),
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      cache: "no-store",
    },
  );

  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => ({ message: "Surat keterangan tidak ditemukan." }));
    return NextResponse.json(payload, { status: upstream.status });
  }

  const letter = parseLetter(await upstream.json());
  if (!letter) {
    return NextResponse.json({ message: "Data surat keterangan tidak valid." }, { status: 502 });
  }

  const pdf = createAcceptancePdf(letter);
  const pdfBody = new Uint8Array(pdf).buffer as ArrayBuffer;
  return new NextResponse(pdfBody, {
    status: 200,
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `inline; filename="surat-diterima-${safeFilenamePart(letter.registrationNumber)}.pdf"`,
      "cache-control": "private, no-store",
      "x-content-type-options": "nosniff",
    },
  });
}
