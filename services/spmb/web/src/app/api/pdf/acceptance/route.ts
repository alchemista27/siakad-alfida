import { NextRequest, NextResponse } from "next/server";

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

  const letter = await upstream.json();
  const html = `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8" />
  <title>Surat Keterangan Diterima - ${letter.registrationNumber}</title>
  <style>
    body { font-family: Inter, sans-serif; color: #454545; background: #F7F8F8; padding: 32px; }
    .sheet { max-width: 720px; margin: 0 auto; background: #FFFFFF; border: 1px solid #E3E8E7; padding: 32px; }
    h1 { font-family: Lora, serif; color: #454545; margin-bottom: 8px; }
    .badge { display: inline-block; padding: 4px 10px; background: #e6f4f1; color: #0f7f6d; font-weight: 700; font-size: 12px; }
    .row { margin: 10px 0; font-size: 14px; }
  </style>
</head>
<body>
  <div class="sheet">
    <span class="badge">SURAT KETERANGAN KELULUSAN SELEKSI SPMB</span>
    <h1>${letter.unitName}</h1>
    <p class="row">Tahun Ajaran: <strong>${letter.academicYearLabel}</strong></p>
    <p class="row">Nomor Registrasi: <strong>${letter.registrationNumber}</strong></p>
    <p class="row">Nama Calon Santri: <strong>${letter.studentName}</strong></p>
    <p class="row">Status Seleksi: <strong>DITERIMA</strong></p>
    <p class="row">Catatan Panitia: ${letter.decisionNote}</p>
  </div>
</body>
</html>`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
    },
  });
}
