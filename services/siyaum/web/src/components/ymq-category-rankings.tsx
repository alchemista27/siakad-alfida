export interface OverallCategoryRanking {
  key: "iwr_1" | "iwr_2" | "tahsin";
  label: string;
  metricLabel: string;
  rankings: Array<{ userId: string; fullName: string; unitName: string | null; metricValue: number; latestActivityDate: string | null }>;
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value)) : "—";
}

export function YmqCategoryRankings({ rankings }: { rankings: OverallCategoryRanking[] }) {
  return <section className="grid gap-5 xl:grid-cols-3">{rankings.map((category) => <section key={category.key} className="overflow-hidden rounded-lg border border-border bg-surface"><header className="border-b border-border px-5 py-4"><h2 className="font-heading text-xl font-bold">Top 20 {category.label}</h2><p className="mt-1 text-sm text-primary/65">Peringkat berdasarkan {category.metricLabel.toLowerCase()}.</p></header>{category.rankings.length ? <div className="overflow-x-auto"><table className="w-full min-w-[460px] text-left text-sm"><thead className="bg-neutral text-xs uppercase tracking-wide text-primary/60"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Peserta</th><th className="px-4 py-3">Nilai</th><th className="px-4 py-3">Aktivitas</th></tr></thead><tbody>{category.rankings.map((row, index) => <tr key={row.userId} className="border-t border-border"><td className="px-4 py-3 font-semibold">{index + 1}</td><td className="px-4 py-3"><span className="block font-medium">{row.fullName}</span><small className="text-primary/60">{row.unitName || "Unit belum tersedia"}</small></td><td className="px-4 py-3">{row.metricValue} {category.metricLabel.toLowerCase()}</td><td className="px-4 py-3 text-primary/70">{formatDate(row.latestActivityDate)}</td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-primary/65">Belum ada materi tercatat pada kategori ini.</p>}</section>)}</section>;
}
