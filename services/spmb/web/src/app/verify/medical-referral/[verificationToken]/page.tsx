type VerificationResult = {
  valid: boolean;
  studentName?: string;
  unitName?: string;
  academicYearLabel?: string;
  referralNumber?: string;
  issuedAt?: string;
};

function formatDate(value: string | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

async function verify(verificationToken: string): Promise<VerificationResult> {
  const apiBase = (process.env.SPMB_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001").replace(/\/$/, "");
  try {
    const response = await fetch(`${apiBase}/api/public/medical-referrals/${encodeURIComponent(verificationToken)}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return { valid: false };
    const payload = await response.json().catch(() => null) as VerificationResult | null;
    return payload?.valid === true ? payload : { valid: false };
  } catch {
    return { valid: false };
  }
}

export default async function MedicalReferralVerificationPage({ params }: { params: Promise<{ verificationToken: string }> }) {
  const { verificationToken } = await params;
  const result = await verify(verificationToken);

  return (
    <main className="min-h-screen bg-[#F7F8F8] px-4 py-12 font-body text-[#454545]">
      <section className="mx-auto max-w-lg rounded-lg border border-[#E3E8E7] bg-white p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#0f7f6d]">Verifikasi SPMB</p>
        {result.valid ? (
          <>
            <h1 className="mt-2 font-heading text-2xl font-bold">Surat terverifikasi</h1>
            <p className="mt-2 text-sm text-slate-600">Nama berikut benar tercatat sebagai peserta SPMB.</p>
            <dl className="mt-6 divide-y divide-[#E3E8E7] border-y border-[#E3E8E7] text-sm">
              <div className="grid grid-cols-[9rem_1fr] gap-3 py-3"><dt className="text-slate-500">Nama calon murid</dt><dd className="font-semibold">{result.studentName}</dd></div>
              <div className="grid grid-cols-[9rem_1fr] gap-3 py-3"><dt className="text-slate-500">Unit</dt><dd>{result.unitName}</dd></div>
              <div className="grid grid-cols-[9rem_1fr] gap-3 py-3"><dt className="text-slate-500">Tahun ajaran</dt><dd>{result.academicYearLabel}</dd></div>
              <div className="grid grid-cols-[9rem_1fr] gap-3 py-3"><dt className="text-slate-500">Nomor surat</dt><dd>{result.referralNumber}</dd></div>
              <div className="grid grid-cols-[9rem_1fr] gap-3 py-3"><dt className="text-slate-500">Tanggal terbit</dt><dd>{formatDate(result.issuedAt)}</dd></div>
            </dl>
          </>
        ) : (
          <>
            <h1 className="mt-2 font-heading text-2xl font-bold">Surat tidak dapat diverifikasi</h1>
            <p className="mt-2 text-sm text-slate-600">Pastikan QR dipindai dengan lengkap atau hubungi panitia SPMB.</p>
          </>
        )}
      </section>
    </main>
  );
}