"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Badge, Button, Card, EmptyState, ErrorState, LoadingState } from "@alfida/ui";
import { NotificationModal } from "@/components/notification-modal";
import { SiyaumAppShell } from "@/components/siyaum-app-shell";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, hasSiyaumRole, type CurrentUser } from "@/lib/current-user";

interface SetoranItem {
  id: string;
  userId: string;
  date: string;
  jenis: string;
  surahMulai: string;
  ayatMulai: number;
  surahSelesai: string;
  ayatSelesai: number;
  jumlahHalaman: number;
  statusVerifikasi: "pending" | "verified" | "revision";
  catatanMusyrif?: string | null;
  user?: { fullName: string; unitName?: string | null };
}

interface Metrics {
  totalGroups: number;
  totalMembers: number;
  totalSetoran: number;
  totalHalaman: number;
  verifiedCount: number;
}

interface Group {
  id: string;
  name: string;
  description?: string | null;
  scheduleDay?: string | null;
  scheduleTime?: string | null;
  musyrif?: { fullName: string } | null;
  _count?: { members: number };
}

type Tab = "input" | "history" | "verify" | "groups";
type Notice = { title: string; message: string; tone: "success" | "error" };

const inputClassName = "mt-1 w-full rounded-sm border border-border bg-surface px-3 py-2 text-sm text-primary";
const range = (item: SetoranItem) => `QS. ${item.surahMulai} : ${item.ayatMulai} — QS. ${item.surahSelesai} : ${item.ayatSelesai}`;

export default function SiyaumTilawahClient() {
  const [activeTab, setActiveTab] = useState<Tab>("input");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [mySetoran, setMySetoran] = useState<SetoranItem[]>([]);
  const [pendingSetoran, setPendingSetoran] = useState<SetoranItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<Notice | null>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    jenis: "tilawah",
    surahMulai: "Al-Baqarah",
    ayatMulai: 1,
    surahSelesai: "Al-Baqarah",
    ayatSelesai: 25,
    jumlahHalaman: 2,
    catatan: "",
  });

  const canReadGlobalMetrics = hasSiyaumRole(
    currentUser,
    "admin_ymq",
    "pembina_ymq",
    "admin_kelompok",
    "pengawas",
    "pimpinan",
  );
  const canVerifyLegacySetoran = hasSiyaumRole(currentUser, "admin_ymq", "musyrif");
  const personalSummary = useMemo(() => ({
    totalHalaman: mySetoran.reduce((total, item) => total + item.jumlahHalaman, 0),
    verifiedCount: mySetoran.filter((item) => item.statusVerifikasi === "verified").length,
    pendingCount: mySetoran.filter((item) => item.statusVerifikasi === "pending").length,
  }), [mySetoran]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const user = await getCurrentUser();
      const canReadGlobalMetrics = hasSiyaumRole(
        user,
        "admin_ymq",
        "pembina_ymq",
        "admin_kelompok",
        "pengawas",
        "pimpinan",
      );
      const canVerifyLegacySetoran = hasSiyaumRole(user, "admin_ymq", "musyrif");
      const [mySetoran, groups, metrics, pendingSetoran] = await Promise.all([
        apiFetch<SetoranItem[]>("/setoran/my"),
        apiFetch<Group[]>("/groups"),
        canReadGlobalMetrics ? apiFetch<Metrics>("/dashboard/metrics") : Promise.resolve(null),
        canVerifyLegacySetoran ? apiFetch<SetoranItem[]>("/setoran/pending") : Promise.resolve([]),
      ]);
      setCurrentUser(user);
      setMySetoran(mySetoran);
      setGroups(groups);
      setMetrics(metrics);
      setPendingSetoran(pendingSetoran);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Gagal memuat data SIYAUM.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadData(); }, []);

  const handleSubmitSetoran = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch("/setoran/my", { method: "POST", body: JSON.stringify(form) });
      await loadData();
      setForm((current) => ({ ...current, catatan: "" }));
      setActiveTab("history");
      setNotification({ title: "Setoran terkirim", message: "Setoran harian berhasil dikirim untuk verifikasi musyrif.", tone: "success" });
    } catch (reason) {
      setNotification({ title: "Setoran belum terkirim", message: reason instanceof Error ? reason.message : "Gagal mencatat setoran.", tone: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id: string, status: "verified" | "revision") => {
    setIsSubmitting(true);
    try {
      await apiFetch(`/setoran/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({ status, catatanMusyrif: status === "verified" ? "Mumtaz, barakallahu fiik." : "Mohon diulang kembali." }),
      });
      await loadData();
      setNotification({
        title: status === "verified" ? "Setoran diverifikasi" : "Revisi diminta",
        message: status === "verified" ? "Setoran peserta telah disahkan." : "Peserta akan melihat catatan revisi pada riwayat setorannya.",
        tone: "success",
      });
    } catch (reason) {
      setNotification({ title: "Verifikasi belum diproses", message: reason instanceof Error ? reason.message : "Gagal memproses verifikasi.", tone: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tabs: Array<{ id: Tab; label: string; visible: boolean }> = [
    { id: "input", label: "Input setoran", visible: true },
    { id: "history", label: `Riwayat saya (${mySetoran.length})`, visible: true },
    { id: "verify", label: `Verifikasi (${pendingSetoran.length})`, visible: canVerifyLegacySetoran },
    { id: "groups", label: `Kelompok (${groups.length})`, visible: true },
  ];
  const summaryCards = metrics
    ? [
      { label: "Total halaman", value: metrics.totalHalaman, note: "Seluruh pegawai yayasan" },
      { label: "Setoran terverifikasi", value: metrics.verifiedCount, note: `Dari ${metrics.totalSetoran} catatan` },
      { label: "Kelompok halaqah", value: metrics.totalGroups, note: `${metrics.totalMembers} peserta aktif` },
    ]
    : [
      { label: "Halaman saya", value: personalSummary.totalHalaman, note: "Dari seluruh setoran Anda" },
      { label: "Terverifikasi", value: personalSummary.verifiedCount, note: `Dari ${mySetoran.length} catatan` },
      { label: "Menunggu verifikasi", value: personalSummary.pendingCount, note: "Setoran yang masih ditinjau" },
    ];

  return (
    <SiyaumAppShell user={currentUser} active="tilawah">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-border pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-tertiary">Tilawah personal</p>
            <h1 className="mt-1 font-heading text-4xl font-bold text-primary">Catatan tilawah harian</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-primary/70">Catat bacaan dan hafalan Anda; status verifikasi akan diperbarui oleh musyrif yang berwenang.</p>
          </div>
          <Button disabled={loading || isSubmitting} onClick={loadData} size="sm" variant="secondary">Segarkan data</Button>
        </header>

        {loading ? <LoadingState message="Memuat catatan tilawah..." /> : error ? <ErrorState message={error} onRetry={loadData} /> : (
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              {summaryCards.map((item) => <Card className="border border-border bg-surface p-5 shadow-none" key={item.label}><p className="text-xs font-semibold uppercase tracking-wide text-primary/60">{item.label}</p><p className="mt-2 text-3xl font-bold text-tertiary">{item.value.toLocaleString()}</p><p className="mt-1 text-xs text-primary/65">{item.note}</p></Card>)}
            </section>

            <nav aria-label="Pilihan tilawah" className="flex flex-wrap gap-x-5 border-b border-border text-sm font-medium">
              {tabs.filter((tab) => tab.visible).map((tab) => <button className={`border-b-2 px-1 pb-3 transition-colors ${activeTab === tab.id ? "border-tertiary text-tertiary" : "border-transparent text-primary/65 hover:text-primary"}`} key={tab.id} onClick={() => setActiveTab(tab.id)} type="button">{tab.label}</button>)}
            </nav>

            {activeTab === "input" && <Card className="mx-auto max-w-2xl border border-border bg-surface p-6 shadow-none"><div className="border-b border-border pb-4"><h2 className="font-heading text-2xl font-bold text-primary">Catat setoran hari ini</h2><p className="mt-1 text-sm text-primary/70">Masukkan rincian tilawah, ziyadah, atau murojaah yang telah Anda selesaikan.</p></div><form className="mt-5 space-y-4" onSubmit={handleSubmitSetoran}><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-primary">Tanggal setoran<input className={inputClassName} onChange={(event) => setForm({ ...form, date: event.target.value })} required type="date" value={form.date} /></label><label className="text-sm font-medium text-primary">Jenis kegiatan<select className={inputClassName} onChange={(event) => setForm({ ...form, jenis: event.target.value })} value={form.jenis}><option value="tilawah">Tilawah harian</option><option value="ziyadah">Ziyadah</option><option value="murojaah">Murojaah</option></select></label></div><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-primary">Surah mulai<input className={inputClassName} onChange={(event) => setForm({ ...form, surahMulai: event.target.value })} placeholder="Contoh: Al-Baqarah" required value={form.surahMulai} /></label><label className="text-sm font-medium text-primary">Ayat mulai<input className={inputClassName} min={1} onChange={(event) => setForm({ ...form, ayatMulai: Number(event.target.value) })} required type="number" value={form.ayatMulai} /></label></div><div className="grid gap-4 md:grid-cols-2"><label className="text-sm font-medium text-primary">Surah selesai<input className={inputClassName} onChange={(event) => setForm({ ...form, surahSelesai: event.target.value })} placeholder="Contoh: Al-Baqarah" required value={form.surahSelesai} /></label><label className="text-sm font-medium text-primary">Ayat selesai<input className={inputClassName} min={1} onChange={(event) => setForm({ ...form, ayatSelesai: Number(event.target.value) })} required type="number" value={form.ayatSelesai} /></label></div><label className="text-sm font-medium text-primary">Jumlah halaman mushaf<input className={inputClassName} min={1} onChange={(event) => setForm({ ...form, jumlahHalaman: Number(event.target.value) })} required type="number" value={form.jumlahHalaman} /></label><label className="text-sm font-medium text-primary">Catatan atau kendala <span className="font-normal text-primary/60">(opsional)</span><textarea className={`${inputClassName} min-h-24`} onChange={(event) => setForm({ ...form, catatan: event.target.value })} placeholder="Tuliskan jika ada kendala kelancaran atau tajwid..." rows={3} value={form.catatan} /></label><Button className="w-full" disabled={isSubmitting} loading={isSubmitting} type="submit" variant="primary">Kirim catatan setoran</Button></form></Card>}

            {activeTab === "history" && (mySetoran.length === 0 ? <EmptyState actionLabel="Catat setoran" description="Anda belum mencatat setoran tilawah atau hafalan." onAction={() => setActiveTab("input")} title="Belum ada catatan setoran" /> : <div className="overflow-x-auto rounded-md border border-border bg-surface"><table className="w-full min-w-[760px] text-left text-sm text-primary"><thead className="border-b border-border bg-neutral text-xs font-semibold uppercase tracking-wide text-primary/65"><tr><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Jenis</th><th className="px-5 py-3">Cakupan bacaan</th><th className="px-5 py-3">Halaman</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Catatan musyrif</th></tr></thead><tbody className="divide-y divide-border">{mySetoran.map((item) => <tr className="hover:bg-neutral" key={item.id}><td className="px-5 py-4 text-xs font-medium">{new Date(item.date).toLocaleDateString("id-ID")}</td><td className="px-5 py-4 text-xs font-semibold uppercase">{item.jenis}</td><td className="px-5 py-4 text-xs">{range(item)}</td><td className="px-5 py-4 font-semibold">{item.jumlahHalaman} hlm.</td><td className="px-5 py-4">{item.statusVerifikasi === "verified" ? <Badge variant="success">Terverifikasi</Badge> : item.statusVerifikasi === "revision" ? <Badge variant="danger">Perlu revisi</Badge> : <Badge variant="warning">Menunggu musyrif</Badge>}</td><td className="px-5 py-4 text-xs text-primary/70">{item.catatanMusyrif || "—"}</td></tr>)}</tbody></table></div>)}

            {activeTab === "verify" && canVerifyLegacySetoran && <section className="space-y-4"><div className="border-b border-border pb-3"><h2 className="font-heading text-2xl font-bold text-primary">Antrean verifikasi</h2><p className="mt-1 text-sm text-primary/70">Tinjau setoran peserta dalam kelompok legacy yang menjadi kewenangan Anda.</p></div>{pendingSetoran.length === 0 ? <EmptyState description="Seluruh setoran anggota telah diverifikasi atau belum ada setoran baru." title="Tidak ada antrean verifikasi" /> : <div className="overflow-x-auto rounded-md border border-border bg-surface"><table className="w-full min-w-[840px] text-left text-sm text-primary"><thead className="border-b border-border bg-neutral text-xs font-semibold uppercase tracking-wide text-primary/65"><tr><th className="px-5 py-3">Peserta</th><th className="px-5 py-3">Tanggal</th><th className="px-5 py-3">Jenis</th><th className="px-5 py-3">Cakupan</th><th className="px-5 py-3">Halaman</th><th className="px-5 py-3 text-right">Tindakan</th></tr></thead><tbody className="divide-y divide-border">{pendingSetoran.map((item) => <tr className="hover:bg-neutral" key={item.id}><td className="px-5 py-4 font-medium">{item.user?.fullName || "Peserta"}<p className="mt-1 text-xs font-normal text-primary/60">{item.user?.unitName || "Yayasan"}</p></td><td className="px-5 py-4 text-xs">{new Date(item.date).toLocaleDateString("id-ID")}</td><td className="px-5 py-4 text-xs font-semibold uppercase">{item.jenis}</td><td className="px-5 py-4 text-xs">{range(item)}</td><td className="px-5 py-4 font-semibold">{item.jumlahHalaman} hlm.</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Button disabled={isSubmitting} onClick={() => void handleVerify(item.id, "verified")} size="sm" variant="primary">Sahkan</Button><Button disabled={isSubmitting} onClick={() => void handleVerify(item.id, "revision")} size="sm" variant="danger">Minta revisi</Button></div></td></tr>)}</tbody></table></div>}</section>}

            {activeTab === "groups" && (groups.length === 0 ? <EmptyState description="Kelompok halaqah yang dapat Anda lihat belum tersedia." title="Belum ada kelompok halaqah" /> : <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{groups.map((group) => <Card className="space-y-3 border border-border bg-surface p-5 shadow-none" key={group.id}><div className="flex items-start justify-between gap-3"><h2 className="font-heading text-xl font-bold text-primary">{group.name}</h2><Badge variant="neutral">{group._count?.members || 0} anggota</Badge></div><p className="text-xs text-primary/70">Musyrif: <span className="font-semibold text-primary">{group.musyrif?.fullName || "Belum ditetapkan"}</span></p><div className="rounded-sm bg-neutral p-3 text-xs leading-5 text-primary/70"><p>Jadwal: {group.scheduleDay || "Pekanan"} {group.scheduleTime || ""}</p>{group.description && <p className="mt-1">Keterangan: {group.description}</p>}</div></Card>)}</section>)}
          </>
        )}
      </div>
      <NotificationModal message={notification?.message || ""} onClose={() => setNotification(null)} open={Boolean(notification)} title={notification?.title || ""} tone={notification?.tone} />
    </SiyaumAppShell>
  );
}
