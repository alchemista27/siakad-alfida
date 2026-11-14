import { NextRequest, NextResponse } from "next/server";
import { createAcceptancePdf, type AcceptanceLetterPdfInput } from "@/lib/letters/acceptance-pdf";

export const runtime = "nodejs";

function parseLetter(payload: unknown): AcceptanceLetterPdfInput | null {
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  const required = ["registrationNumber", "unitName", "academicYearLabel", "studentName", "issuedAt", "foundationName"] as const;
  if (!required.every((key) => typeof value[key] === "string" && value[key].trim())) return null;
  if (value.letterheadKind !== "unit" && value.letterheadKind !== "foundation") return null;
  const nullableStrings = [
    "unitAddress",
    "unitPhone",
    "unitEmail",
    "unitLogoUrl",
    "foundationAddress",
    "foundationPhone",
    "foundationEmail",
    "foundationLogoUrl",
  ] as const;
  if (!nullableStrings.every((key) => value[key] === null || (typeof value[key] === "string" && value[key].trim()))) return null;
  if (value.decisionNote !== null && value.decisionNote !== undefined && typeof value.decisionNote !== "string") return null;

  return {
    registrationNumber: value.registrationNumber as string,
    unitName: value.unitName as string,
    academicYearLabel: value.academicYearLabel as string,
    studentName: value.studentName as string,
    decisionNote: typeof value.decisionNote === "string" ? value.decisionNote : null,
    issuedAt: value.issuedAt as string,
    unitAddress: value.unitAddress as string | null,
    unitPhone: value.unitPhone as string | null,
    unitEmail: value.unitEmail as string | null,
    unitLogoUrl: value.unitLogoUrl as string | null,
    letterheadKind: value.letterheadKind,
    foundationName: value.foundationName as string,
    foundationAddress: value.foundationAddress as string | null,
    foundationPhone: value.foundationPhone as string | null,
    foundationEmail: value.foundationEmail as string | null,
    foundationLogoUrl: value.foundationLogoUrl as string | null,
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

  const pdf = await createAcceptancePdf(letter);
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
