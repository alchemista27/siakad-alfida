import type { FinanceInvoice } from "@/lib/api";

function formatIdr(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

const label: Record<FinanceInvoice["status"], string> = {
  unpaid: "Belum lunas",
  pending: "Menunggu",
  paid: "Lunas",
  cancelled: "Dibatalkan",
  overdue: "Jatuh tempo",
};

export function InvoiceList({ invoices }: { invoices: FinanceInvoice[] }) {
  if (!invoices.length) return <p className="py-12 text-center text-sm text-primary/65">Belum ada tagihan pada filter ini.</p>;
  return <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="border-b border-border bg-neutral text-xs uppercase tracking-wide text-primary/60"><tr><th className="px-4 py-3">Santri</th><th className="px-4 py-3">Periode</th><th className="px-4 py-3">Jatuh tempo</th><th className="px-4 py-3">Nominal</th><th className="px-4 py-3">Status</th></tr></thead><tbody className="divide-y divide-border">{invoices.map((invoice) => <tr key={invoice.id}><td className="px-4 py-4"><p className="font-semibold text-primary">{invoice.studentName}</p><p className="mt-1 font-mono text-xs text-primary/60">{invoice.reference}</p></td><td className="px-4 py-4 text-primary/75">{invoice.billingPeriod}</td><td className="px-4 py-4 text-primary/75">{new Date(`${invoice.dueDate}T00:00:00Z`).toLocaleDateString("id-ID", { timeZone: "UTC" })}</td><td className="px-4 py-4 font-semibold text-primary">{formatIdr(invoice.amount)}</td><td className="px-4 py-4"><span className="rounded-sm border border-border bg-surface px-2 py-1 text-xs font-semibold text-primary">{label[invoice.status]}</span></td></tr>)}</tbody></table></div>;
}
