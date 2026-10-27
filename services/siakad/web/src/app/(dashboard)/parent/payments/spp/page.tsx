"use client";

import { useEffect, useState } from "react";
import { siakadApiFetch } from "@/lib/api";

type Enrollment = { id: string; student: { fullName: string }; classroom: { name: string } | null };
type Invoice = { id: string; enrollmentId: string; reference: string; description: string; amount: number; currency: string; dueDate: string; status: "unpaid" | "pending" | "paid" | "overdue" | "cancelled"; paymentUrl: string | null };
type PaymentSession = {
  invoiceId: string;
  paymentMethod: "gateway" | "manual_transfer";
  paymentUrl: string | null;
  instructions: string | null;
  reference: string;
  amount: number;
  currency: "IDR";
};
type BillingResponse = { enrollments: Enrollment[]; invoices: Invoice[] };

const formatRupiah = (amount: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
const statusLabel: Record<Invoice["status"], string> = { unpaid: "Belum dibayar", pending: "Menunggu pembayaran", paid: "Lunas", overdue: "Jatuh tempo", cancelled: "Dibatalkan" };

export default function ParentSppPaymentPage() {
  const [data, setData] = useState<BillingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [payingInvoiceId, setPayingInvoiceId] = useState<string | null>(null);
  const [manualSession, setManualSession] = useState<PaymentSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setData(await siakadApiFetch<BillingResponse>("/billing/spp"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Tagihan SPP tidak dapat dimuat.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function pay(invoice: Invoice) {
    setPayingInvoiceId(invoice.id);
    setError(null);
    try {
      const session = await siakadApiFetch<PaymentSession>(`/billing/spp/${encodeURIComponent(invoice.id)}/payment-session`, { method: "POST" });
      if (session.paymentMethod === "gateway" && session.paymentUrl) {
        window.location.assign(session.paymentUrl);
        return;
      }
      if (session.paymentMethod === "manual_transfer" && session.paymentUrl === null && session.instructions) {
        setManualSession(session);
        return;
      }
      throw new Error("Sesi pembayaran yang diterima tidak valid.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sesi pembayaran tidak dapat dibuat.");
    } finally {
      setPayingInvoiceId(null);
    }
  }

  const enrollments = data?.enrollments ?? [];
  const invoices = data?.invoices ?? [];
  const enrollmentName = new Map(enrollments.map((enrollment) => [enrollment.id, `${enrollment.student.fullName}${enrollment.classroom ? ` · ${enrollment.classroom.name}` : ""}`]));

  return (
    <main className="mx-auto min-h-screen max-w-6xl space-y-6 p-5 md:p-8">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0f7f6d]">Pembayaran</p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#454545]">Tagihan SPP</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#454545]/75">Tagihan dan status pembayaran dikelola oleh SISKEU. SIAKAD hanya menampilkan tagihan anak Anda dan mengarahkan ke proses pembayaran yang aman.</p>
      </header>

      {manualSession && <section role="status" aria-labelledby="manual-transfer-title" className="rounded-lg border border-[#b9dfd8] bg-[#e6f4f1] p-5 text-[#454545]"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#0f7f6d]">Pembayaran manual</p><h2 id="manual-transfer-title" className="mt-1 font-serif text-xl font-semibold">Instruksi transfer manual</h2></div><button type="button" onClick={() => setManualSession(null)} className="rounded-sm border border-[#0f7f6d] px-3 py-1.5 text-sm font-semibold text-[#0f7f6d]">Tutup</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[#454545]/80">{manualSession.instructions}</p><dl className="mt-4 grid gap-3 border-t border-[#b9dfd8] pt-4 text-sm sm:grid-cols-2"><div><dt className="text-xs font-semibold uppercase tracking-wide text-[#454545]/60">Referensi pembayaran</dt><dd className="mt-1 break-all font-semibold text-[#454545]">{manualSession.reference}</dd></div><div><dt className="text-xs font-semibold uppercase tracking-wide text-[#454545]/60">Nominal</dt><dd className="mt-1 font-semibold text-[#454545]">{formatRupiah(manualSession.amount)}</dd></div></dl><p className="mt-4 text-xs leading-5 text-[#454545]/70">Status tagihan diperbarui setelah pembayaran Anda dikonfirmasi oleh petugas keuangan.</p></section>}
      {error && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800"><span>{error}</span><button type="button" onClick={() => void load()} className="rounded border border-red-300 px-3 py-1.5 font-semibold">Coba lagi</button></div>}
      {loading && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Memuat tagihan dari SISKEU…</p>}
      {!loading && !error && enrollments.length === 0 && <p className="rounded-lg border border-[#E3E8E7] bg-white p-5 text-sm text-[#454545]/75">Belum ada siswa aktif yang terhubung dengan akun Anda.</p>}
      {!loading && !error && enrollments.length > 0 && invoices.length === 0 && <p className="rounded-lg border border-[#b9dfd8] bg-[#e6f4f1] p-5 text-sm text-[#0f7f6d]">Tidak ada tagihan SPP aktif untuk anak Anda.</p>}

      {!loading && invoices.length > 0 && <section className="overflow-hidden rounded-lg border border-[#E3E8E7] bg-white"><div className="border-b border-[#E3E8E7] px-5 py-4"><h2 className="font-serif text-lg font-semibold">Daftar tagihan</h2></div><div className="divide-y divide-[#E3E8E7]">{invoices.map((invoice) => <article key={invoice.id} className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#454545]/55">{enrollmentName.get(invoice.enrollmentId) ?? "Siswa"}</p><h3 className="mt-1 font-semibold text-[#454545]">{invoice.description}</h3><p className="mt-1 text-xs text-[#454545]/65">{invoice.reference} · Jatuh tempo {new Intl.DateTimeFormat("id-ID", { dateStyle: "long" }).format(new Date(`${invoice.dueDate}T00:00:00`))}</p></div><div className="flex flex-wrap items-center gap-3 md:justify-end"><div className="text-left md:text-right"><p className="font-semibold text-[#454545]">{formatRupiah(invoice.amount)}</p><p className="text-xs text-[#454545]/65">{statusLabel[invoice.status]}</p></div>{["unpaid", "pending", "overdue"].includes(invoice.status) && <button type="button" onClick={() => void pay(invoice)} disabled={payingInvoiceId === invoice.id} className="rounded-sm bg-[#0f7f6d] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">{payingInvoiceId === invoice.id ? "Mengarahkan…" : "Bayar"}</button>}</div></article>)}</div></section>}
    </main>
  );
}
