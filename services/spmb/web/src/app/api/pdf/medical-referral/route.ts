import { NextRequest, NextResponse } from "next/server";
import { createMedicalReferralPdf, type MedicalReferralPdfInput } from "@/lib/letters/medical-referral-pdf";

export const runtime = "nodejs";

type LetterPayload = Omit<MedicalReferralPdfInput, "verificationUrl"> & { verificationToken: string };

function parseLetter(payload: unknown): LetterPayload | null {
  if (!payload || typeof payload !== "object") return null;
  const value = payload as Record<string, unknown>;
  const strings = ["referralNumber", "verificationToken", "issuedAt", "registrationNumber", "unitName", "academicYearLabel", "studentName", "birthPlace", "birthDate", "foundationName"] as const;
  if (!strings.every((key) => typeof value[key] === "string" && value[key].trim())) return null;
  const nullableStrings = ["unitAddress", "unitPhone", "unitEmail", "unitLogoUrl", "foundationLogoUrl"] as const;
  if (!nullableStrings.every((key) => value[key] === null || (typeof value[key] === "string" && value[key].trim()))) return null;
  if (!/^[a-f0-9]{64}$/i.test(value.verificationToken as string)) return null;
  return value as LetterPayload;
}

function safeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "") || "surat-pengantar-kesehatan";
}

export async function GET(request: NextRequest) {
  const registrationId = request.nextUrl.searchParams.get("registrationId")?.trim();
  if (!registrationId) return NextResponse.json({ message: "registrationId wajib diisi." }, { status: 400 });
  const apiBase = (process.env.SPMB_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
  let upstream: Response;
  try {
    upstream = await fetch(`${apiBase}/api/letters/medical-referral/${encodeURIComponent(registrationId)}`, {
      headers: {
        ...(request.headers.get("cookie") ? { cookie: request.headers.get("cookie")! } : {}),
        ...(request.headers.get("authorization") ? { authorization: request.headers.get("authorization")! } : {}),
        accept: "application/json",
      },
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Layanan surat pengantar tidak dapat dihubungi." }, { status: 503 });
  }
  if (!upstream.ok) {
    const payload = await upstream.json().catch(() => ({ message: "Surat pengantar kesehatan tidak tersedia." }));
    return NextResponse.json(payload, { status: upstream.status });
  }
  const letter = parseLetter(await upstream.json());
  if (!letter) return NextResponse.json({ message: "Data surat pengantar kesehatan tidak valid." }, { status: 502 });
  try {
    const verificationUrl = new URL(
      `/verify/medical-referral/${encodeURIComponent(letter.verificationToken)}`,
      request.nextUrl.origin,
    ).toString();
    const pdf = await createMedicalReferralPdf({ ...letter, verificationUrl });
    return new NextResponse(new Uint8Array(pdf).buffer as ArrayBuffer, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="surat-pengantar-kesehatan-${safeFilename(letter.referralNumber)}.pdf"`,
        "cache-control": "private, no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ message: "Surat pengantar kesehatan belum dapat dibuat." }, { status: 500 });
  }
}
