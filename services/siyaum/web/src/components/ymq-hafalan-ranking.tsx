export interface OverallHafalan {
  totalVerifiedPages: number;
  averageVerifiedPages: number;
  rankings: Array<{ userId: string; fullName: string; unitName: string | null; verifiedPages: number; latestVerifiedDate: string | null }>;
}

function formatDate(value: string | null) {
  return value ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(value)) : "—";
}

export function YmqHafalanRanking({ hafalan }: { hafalan: OverallHafalan }) {
  return <section className="overflow-hidden rounded-lg border border-border bg-surface"><header className="border-b border-border px-5 py-4"><h2 className="font-heading text-xl font-bold">Top 20 hafalan terbanyak</h2><p className="mt-1 text-sm text-primary/65">Berdasarkan setoran ziyadah yang sudah diverifikasi.</p></header><div className="grid gap-3 border-b border-border bg-neutral p-5 sm:grid-cols-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary/60">Rata-rata hafalan</p><p className="mt-1 text-2xl font-bold">{hafalan.averageVerifiedPages.toFixed(2)} halaman</p></div><div><p className="text-xs font-semibold uppercase tracking-wide text-primary/60">Total terverifikasi</p><p className="mt-1 text-2xl font-bold">{hafalan.totalVerifiedPages} halaman</p></div></div>{hafalan.rankings.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="bg-neutral text-xs uppercase tracking-wide text-primary/60"><tr><th className="px-4 py-3">#</th><th className="px-4 py-3">Peserta</th><th className="px-4 py-3">Halaman hafalan terverifikasi</th><th className="px-4 py-3">Verifikasi terakhir</th></tr></thead><tbody>{hafalan.rankings.map((row, index) => <tr key={row.userId} className="border-t border-border"><td className="px-4 py-3 font-semibold">{index + 1}</td><td className="px-4 py-3"><span className="block font-medium">{row.fullName}</span><small className="text-primary/60">{row.unitName || "Unit belum tersedia"}</small></td><td className="px-4 py-3 font-semibold">{row.verifiedPages}</td><td className="px-4 py-3 text-primary/70">{formatDate(row.latestVerifiedDate)}</td></tr>)}</tbody></table></div> : <p className="p-5 text-sm text-primary/65">Belum ada setoran hafalan terverifikasi pada scope ini.</p>}</section>;
}
