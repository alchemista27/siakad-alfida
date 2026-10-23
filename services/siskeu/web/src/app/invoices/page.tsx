"use client";

import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@alfida/ui";
import { InvoiceList } from "@/components/invoice-list";
import { SiskeuAppShell } from "@/components/siskeu-app-shell";
import { getInvoices, type FinanceInvoice, type SiskeuUser } from "@/lib/api";
import { getCurrentSiskeuUser, redirectToLogin } from "@/lib/current-user";

const statuses = ["", "unpaid", "pending", "paid", "overdue", "cancelled"] as const;
type FilterStatus = (typeof statuses)[number];

export default function InvoicesPage() {
  const [user, setUser] = useState<SiskeuUser | null>(null);
  const [invoices, setInvoices] = useState<FinanceInvoice[]>([]);
  const [status, setStatus] = useState<FilterStatus>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async (nextStatus = status) => {
    setLoading(true);
    setError(null);
    try {
      const currentUser = await getCurrentSiskeuUser();
      setUser(currentUser);
      const result = await getInvoices(nextStatus || undefined);
      setInvoices(result.data);
    } catch (caught) {
      if (caught instanceof Error && caught.message === "AUTHENTICATION_REQUIRED") {
        redirectToLogin();
        return;
      }
      setError(caught instanceof Error ? caught.message : "Gagal memuat tagihan SPP.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return <SiskeuAppShell user={user} active="invoices"><main className="mx-auto max-w-7xl space-y-6"><header className="border-b border-border pb-5"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-tertiary">Buku tagihan</p><h1 className="mt-1 font-heading text-3xl font-bold text-primary">Tagihan SPP</h1><p className="mt-2 text-sm leading-6 text-primary/70">Daftar ini bersifat read-only untuk monitoring finance. Perubahan status dilakukan melalui alur pembayaran SISKEU yang terotorisasi.</p></header><section className="rounded-lg border border-border bg-surface p-4"><label className="block max-w-xs text-xs font-semibold text-primary">Status tagihan<select value={status} onChange={(event) => { const next = event.target.value as FilterStatus; setStatus(next); void load(next); }} className="mt-1.5 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm"><option value="">Semua status</option><option value="unpaid">Belum lunas</option><option value="pending">Menunggu</option><option value="paid">Lunas</option><option value="overdue">Jatuh tempo</option><option value="cancelled">Dibatalkan</option></select></label></section><section className="overflow-hidden rounded-lg border border-border bg-surface">{loading ? <LoadingState message="Memuat tagihan SPP..." /> : error ? <ErrorState message={error} onRetry={() => load()} /> : <InvoiceList invoices={invoices} />}</section></main></SiskeuAppShell>;
}
