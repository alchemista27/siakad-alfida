export interface OverallUnitProgress {
  unitId: string;
  unitName: string;
  activeParticipants: number;
  iwr1Participants: number;
  iwr2Participants: number;
  tahsinParticipants: number;
  unclassifiedParticipants: number;
  averageVerifiedHafalanPages: number;
}

const segments = [
  { key: "iwr1Participants" as const, label: "IWR 1", className: "bg-secondary" },
  { key: "iwr2Participants" as const, label: "IWR 2", className: "bg-tertiary" },
  { key: "tahsinParticipants" as const, label: "Tahsin", className: "bg-primary" },
  { key: "unclassifiedParticipants" as const, label: "Belum tercatat", className: "bg-border" },
];

export function YmqUnitProgressBars({ units }: { units: OverallUnitProgress[] }) {
  return <section className="rounded-lg border border-border bg-surface p-5"><header><h2 className="font-heading text-xl font-bold">Pencapaian per unit kerja</h2><p className="mt-1 text-sm text-primary/65">Komposisi peserta berdasarkan progres terakhir dan rata-rata hafalan terverifikasi.</p></header><div className="mt-4 flex flex-wrap gap-3 text-xs text-primary/70">{segments.map((segment) => <span key={segment.key} className="inline-flex items-center gap-1.5"><span className={`h-3 w-3 rounded-sm ${segment.className}`} aria-hidden="true" />{segment.label}</span>)}</div>{units.length ? <div className="mt-5 space-y-5">{units.map((unit) => <section key={unit.unitId}><div className="flex flex-wrap items-baseline justify-between gap-2 text-sm"><h3 className="font-semibold">{unit.unitName}</h3><p className="text-primary/65">{unit.activeParticipants} peserta · Rata-rata hafalan {unit.averageVerifiedHafalanPages.toFixed(2)} halaman</p></div><div className="mt-2 flex h-5 overflow-hidden rounded-sm bg-neutral" aria-label={`${unit.unitName}: ${unit.activeParticipants} peserta`}>{segments.map((segment) => { const value = unit[segment.key]; return value ? <span key={segment.key} className={segment.className} style={{ width: `${(value / unit.activeParticipants) * 100}%` }} title={`${segment.label}: ${value}`} /> : null; })}</div></section>)}</div> : <p className="mt-5 text-sm text-primary/65">Belum ada peserta pada scope unit kerja ini.</p>}<table className="sr-only"><caption>Pencapaian per unit kerja</caption><thead><tr><th>Unit</th><th>Peserta</th><th>IWR 1</th><th>IWR 2</th><th>Tahsin</th><th>Belum tercatat</th><th>Rata-rata hafalan</th></tr></thead><tbody>{units.map((unit) => <tr key={unit.unitId}><td>{unit.unitName}</td><td>{unit.activeParticipants}</td><td>{unit.iwr1Participants}</td><td>{unit.iwr2Participants}</td><td>{unit.tahsinParticipants}</td><td>{unit.unclassifiedParticipants}</td><td>{unit.averageVerifiedHafalanPages.toFixed(2)}</td></tr>)}</tbody></table></section>;
}
