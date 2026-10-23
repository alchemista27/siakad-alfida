import type { FinanceSummary } from "@/lib/api";

function formatIdr(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export function FinanceSummaryCards({ summary }: { summary: FinanceSummary }) {
  const cards = [
    { label: "Tagihan Belum Lunas", value: summary.unpaid, icon: "pending_actions", tone: "text-amber-700" },
    { label: "Pembayaran Tercatat", value: summary.paid, icon: "task_alt", tone: "text-tertiary" },
    { label: "Jatuh Tempo", value: summary.overdue, icon: "warning", tone: "text-rose-700" },
  ];

  return <section className="grid gap-4 md:grid-cols-3">{cards.map((card) => <article key={card.label} className="rounded-lg border border-border bg-surface p-5"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary/60">{card.label}</p><p className="mt-3 font-heading text-2xl font-bold text-primary">{formatIdr(card.value.amount)}</p><p className="mt-1 text-sm text-primary/70">{card.value.count} tagihan</p></div><span className={`material-symbols-rounded ${card.tone}`} aria-hidden="true">{card.icon}</span></div></article>)}</section>;
}
