"use client";

import React, { useState, useEffect } from "react";
import { AppShell, Card, Badge, Button, EmptyState, LoadingState, ErrorState } from "@alfida/ui";
import { NotificationModal } from "@/components/notification-modal";
import { apiFetch } from "@/lib/api";
import { getCurrentUser, roleLabel } from "@/lib/current-user";

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
  catatan?: string | null;
  statusVerifikasi: "pending" | "verified" | "revision";
  catatanMusyrif?: string | null;
  user?: {
    fullName: string;
    unitName?: string;
  };
}

interface Metrics {
  totalGroups: number;
  totalMembers: number;
  totalSetoran: number;
  totalHalaman: number;
  totalKhatamEstimasi: number;
  verifiedCount: number;
  pendingCount: number;
}

export default function SiyaumDashboard() {
  const [activeTab, setActiveTab] = useState<"input" | "history" | "verify" | "groups">("input");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [mySetoran, setMySetoran] = useState<SetoranItem[]>([]);
  const [pendingSetoran, setPendingSetoran] = useState<SetoranItem[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ title: string; message: string; tone: "success" | "error" } | null>(null);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; role: string } | null>(null);

  // Form State
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

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMetrics, resMySetoran, resPending, resGroups] = await Promise.all([
        apiFetch<Metrics>("/dashboard/metrics"),
        apiFetch<SetoranItem[]>("/setoran/my"),
        apiFetch<SetoranItem[]>("/setoran/pending").catch(() => []),
        apiFetch<any[]>("/groups"),
      ]);

      setMetrics(resMetrics);
      setMySetoran(resMySetoran);
      setPendingSetoran(resPending);
      setGroups(resGroups);
    } catch (err: any) {
      setError(err?.message || "Gagal memuat data SIYAUM.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser()
      .then((data) => setCurrentUser({ fullName: data.fullName, role: roleLabel(data) }))
      .catch(() => undefined);
    void fetchData();
  }, []);

  const handleSubmitSetoran = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiFetch("/setoran/my", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setActionSuccess("Setoran harian berhasil dikirim untuk verifikasi musyrif.");
      setTimeout(() => setActionSuccess(null), 4000);
      setForm({
        ...form,
        catatan: "",
      });
      fetchData();
      setActiveTab("history");
    } catch (err: any) {
      setNotification({ title: "Setoran belum terkirim", message: err?.message || "Gagal mencatat setoran.", tone: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (id: string, status: "verified" | "revision") => {
    try {
      await apiFetch(`/setoran/${id}/verify`, {
        method: "POST",
        body: JSON.stringify({
          status,
          catatanMusyrif: status === "verified" ? "Mumtaz, barakallahu fiik." : "Mohon diulang kembali.",
        }),
      });

      setActionSuccess(`Setoran berhasil ${status === "verified" ? "diverifikasi" : "diminta revisi"}.`);
      setTimeout(() => setActionSuccess(null), 4000);
      fetchData();
    } catch (err: any) {
      setNotification({ title: "Verifikasi belum diproses", message: err?.message || "Gagal memproses verifikasi.", tone: "error" });
    }
  };

  const sidebarGroups = [
    {
      title: "Tilawah Harian",
      items: [
        {
          label: "Input Setoran",
          href: "#input",
          icon: "menu_book",
          active: activeTab === "input",
          onClick: () => setActiveTab("input"),
        },
        {
          label: "Riwayat Tilawah",
          href: "#history",
          icon: "history",
          active: activeTab === "history",
          onClick: () => setActiveTab("history"),
        },
      ],
    },
    {
      title: "Halaqah Quran",
      items: [
        {
          label: "Verifikasi Musyrif",
          href: "#verify",
          icon: "fact_check",
          active: activeTab === "verify",
          onClick: () => setActiveTab("verify"),
        },
        {
          label: "Grup Halaqah",
          href: "#groups",
          icon: "groups",
          active: activeTab === "groups",
          onClick: () => setActiveTab("groups"),
        },
      ],
    },
    {
      title: "Sistem",
      items: [
        {
          label: "Portal Modul",
          href: "https://auth.alfida.or.id/modules",
          icon: "apps",
        },
      ],
    },
  ];

  return (
    <AppShell
      serviceName="SIYAUM"
      userName={currentUser?.fullName || "Memuat..."}
      userRole={currentUser?.role || ""}
      sidebarGroups={sidebarGroups}
      onLogout={() => {
        window.location.href = "https://auth.alfida.or.id/login";
      }}
      topbarActions={
        <a
          href="https://auth.alfida.or.id/modules"
          className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e6f4f1]"
        >
          <span className="material-symbols-rounded text-[16px]">apps</span>
          <span className="hidden sm:inline">Pilih Modul</span>
        </a>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Yaum Ma&apos;al Quran (SIYAUM)
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Monitoring setoran tilawah harian, ziyadah hafalan, dan pembinaan Al-Quran terpadu keluarga besar Yayasan Alfida.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={fetchData}
              disabled={loading}
            >
              Segarkan Data
            </Button>
          </div>
        </div>

        {/* Feedback Alert */}
        {actionSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center justify-between">
            <span>{actionSuccess}</span>
            <button
              onClick={() => setActionSuccess(null)}
              className="text-emerald-600 hover:text-emerald-900 font-semibold"
            >
              Tutup
            </button>
          </div>
        )}

        {/* KPI Summary Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4 bg-white border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-medium">Total Halaman Terbaca</p>
              <p className="text-2xl font-bold text-emerald-700 mt-1">
                {metrics.totalHalaman.toLocaleString()}
              </p>
              <p className="text-xs text-slate-400 mt-1">Seluruh pegawai yayasan</p>
            </Card>

            <Card className="p-4 bg-white border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-medium">Estimasi Khatam Quran</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {metrics.totalKhatamEstimasi} kali
              </p>
              <p className="text-xs text-slate-400 mt-1">Basis 604 halaman mushaf</p>
            </Card>

            <Card className="p-4 bg-white border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-medium">Setoran Terverifikasi</p>
              <p className="text-2xl font-bold text-teal-600 mt-1">
                {metrics.verifiedCount}
              </p>
              <p className="text-xs text-slate-400 mt-1">Dari {metrics.totalSetoran} catatan</p>
            </Card>

            <Card className="p-4 bg-white border border-slate-200">
              <p className="text-xs text-slate-500 uppercase font-medium">Kelompok Halaqah</p>
              <p className="text-2xl font-bold text-amber-600 mt-1">
                {metrics.totalGroups}
              </p>
              <p className="text-xs text-slate-400 mt-1">Dengan {metrics.totalMembers} peserta</p>
            </Card>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 gap-6 text-sm font-medium">
          <button
            onClick={() => setActiveTab("input")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "input"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Form Setoran Harian
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "history"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Riwayat Setoran Saya ({mySetoran.length})
          </button>
          <button
            onClick={() => setActiveTab("verify")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "verify"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Verifikasi Musyrif ({pendingSetoran.length})
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`pb-3 border-b-2 transition-colors ${
              activeTab === "groups"
                ? "border-emerald-600 text-emerald-700 font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Kelompok Halaqah ({groups.length})
          </button>
        </div>

        {/* Content Section */}
        {loading ? (
          <LoadingState message="Memuat data Yaum Ma'al Quran..." />
        ) : error ? (
          <ErrorState message={error} onRetry={fetchData} />
        ) : (
          <div>
            {/* TAB 1: FORM INPUT SETORAN */}
            {activeTab === "input" && (
              <Card className="p-6 bg-white border border-slate-200 max-w-2xl mx-auto space-y-5">
                <div className="border-b pb-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    Catat Setoran Bacaan atau Hafalan Hari Ini
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Silakan isi rincian tilawah atau hafalan yang telah Anda selesaikan hari ini.
                  </p>
                </div>

                <form onSubmit={handleSubmitSetoran} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Tanggal Setoran
                      </label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Jenis Kegiatan
                      </label>
                      <select
                        value={form.jenis}
                        onChange={(e) => setForm({ ...form, jenis: e.target.value })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2 bg-white"
                      >
                        <option value="tilawah">Tilawah Harian</option>
                        <option value="ziyadah">Ziyadah (Tambah Hafalan Baru)</option>
                        <option value="murojaah">Muroja&apos;ah (Mengulang Hafalan)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Surah Mulai
                      </label>
                      <input
                        type="text"
                        value={form.surahMulai}
                        onChange={(e) => setForm({ ...form, surahMulai: e.target.value })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                        placeholder="Contoh: Al-Baqarah"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Ayat Mulai
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form.ayatMulai}
                        onChange={(e) => setForm({ ...form, ayatMulai: parseInt(e.target.value, 10) })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Surah Selesai
                      </label>
                      <input
                        type="text"
                        value={form.surahSelesai}
                        onChange={(e) => setForm({ ...form, surahSelesai: e.target.value })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                        placeholder="Contoh: Al-Baqarah"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">
                        Ayat Selesai
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={form.ayatSelesai}
                        onChange={(e) => setForm({ ...form, ayatSelesai: parseInt(e.target.value, 10) })}
                        className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Jumlah Halaman Mushaf
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={form.jumlahHalaman}
                      onChange={(e) => setForm({ ...form, jumlahHalaman: parseInt(e.target.value, 10) })}
                      className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      Catatan atau Kendala (Opsional)
                    </label>
                    <textarea
                      rows={2}
                      value={form.catatan}
                      onChange={(e) => setForm({ ...form, catatan: e.target.value })}
                      className="w-full text-sm border border-slate-300 rounded px-3 py-2"
                      placeholder="Tuliskan jika ada kendala kelancaran atau tajwid..."
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    Kirim Catatan Setoran
                  </Button>
                </form>
              </Card>
            )}

            {/* TAB 2: RIWAYAT SETORAN SAYA */}
            {activeTab === "history" && (
              <div className="space-y-4">
                {mySetoran.length === 0 ? (
                  <EmptyState
                    title="Belum ada catatan setoran"
                    description="Anda belum mencatat setoran tilawah atau hafalan pada periode ini."
                    actionLabel="Catat Setoran Sekarang"
                    onAction={() => setActiveTab("input")}
                  />
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3">Tanggal</th>
                          <th className="px-6 py-3">Jenis</th>
                          <th className="px-6 py-3">Cakupan Bacaan</th>
                          <th className="px-6 py-3">Jumlah Halaman</th>
                          <th className="px-6 py-3">Status Verifikasi</th>
                          <th className="px-6 py-3">Catatan Musyrif</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {mySetoran.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 text-xs font-medium text-slate-900">
                              {new Date(item.date).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-6 py-4 uppercase text-xs font-semibold text-slate-600">
                              {item.jenis}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-800">
                              QS. {item.surahMulai} : {item.ayatMulai} - QS. {item.surahSelesai} : {item.ayatSelesai}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {item.jumlahHalaman} Hal
                            </td>
                            <td className="px-6 py-4">
                              {item.statusVerifikasi === "verified" ? (
                                <Badge variant="success">Terverifikasi</Badge>
                              ) : item.statusVerifikasi === "revision" ? (
                                <Badge variant="danger">Perlu Revisi</Badge>
                              ) : (
                                <Badge variant="warning">Menunggu Musyrif</Badge>
                              )}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-500 italic">
                              {item.catatanMusyrif || "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: VERIFIKASI MUSYRIF */}
            {activeTab === "verify" && (
              <div className="space-y-4">
                <div className="border-b pb-2">
                  <h3 className="text-md font-semibold text-slate-900">
                    Antrean Verifikasi Setoran Anggota Halaqah
                  </h3>
                  <p className="text-xs text-slate-500">
                    Musyrif dapat menelaah dan mengonfirmasi capaian tilawah serta hafalan peserta.
                  </p>
                </div>

                {pendingSetoran.length === 0 ? (
                  <EmptyState
                    title="Tidak ada antrean verifikasi"
                    description="Seluruh setoran anggota telah diverifikasi atau belum ada setoran baru yang masuk."
                  />
                ) : (
                  <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm text-slate-700">
                      <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                        <tr>
                          <th className="px-6 py-3">Nama Pegawai</th>
                          <th className="px-6 py-3">Tanggal</th>
                          <th className="px-6 py-3">Jenis</th>
                          <th className="px-6 py-3">Cakupan</th>
                          <th className="px-6 py-3">Halaman</th>
                          <th className="px-6 py-3 text-right">Aksi Verifikasi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {pendingSetoran.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50">
                            <td className="px-6 py-4 font-medium text-slate-900">
                              {item.user?.fullName || "Peserta"}
                              <div className="text-xs text-slate-400 font-normal">
                                {item.user?.unitName || "Yayasan"}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-600">
                              {new Date(item.date).toLocaleDateString("id-ID")}
                            </td>
                            <td className="px-6 py-4 uppercase text-xs font-semibold">
                              {item.jenis}
                            </td>
                            <td className="px-6 py-4 text-xs text-slate-800">
                              QS. {item.surahMulai} : {item.ayatMulai} - QS. {item.surahSelesai} : {item.ayatSelesai}
                            </td>
                            <td className="px-6 py-4 font-semibold text-slate-700">
                              {item.jumlahHalaman} Hal
                            </td>
                            <td className="px-6 py-4 text-right space-x-2">
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => handleVerify(item.id, "verified")}
                              >
                                Sahkan (Verifikasi)
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => handleVerify(item.id, "revision")}
                              >
                                Minta Revisi
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: KELOMPOK HALAQAH */}
            {activeTab === "groups" && (
              <div className="space-y-4">
                {groups.length === 0 ? (
                  <EmptyState
                    title="Belum ada kelompok halaqah"
                    description="Kelompok halaqah YMQ belum didaftarkan di dalam sistem."
                  />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groups.map((g) => (
                      <Card key={g.id} className="p-5 bg-white border border-slate-200 space-y-3">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-slate-900">{g.name}</h4>
                          <Badge variant="neutral">{g._count?.members || 0} Anggota</Badge>
                        </div>
                        <p className="text-xs text-slate-500">
                          Musyrif: <strong className="text-slate-700">{g.musyrif?.fullName || "-"}</strong>
                        </p>
                        <div className="text-xs text-slate-600 space-y-1 bg-slate-50 p-3 rounded">
                          <div>Jadwal: {g.scheduleDay || "Pekanan"} {g.scheduleTime || ""}</div>
                          {g.description && <div>Keterangan: {g.description}</div>}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <NotificationModal
        open={Boolean(notification)}
        title={notification?.title || ""}
        message={notification?.message || ""}
        tone={notification?.tone}
        onClose={() => setNotification(null)}
      />
    </AppShell>
  );
}
