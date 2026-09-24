"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { academicYearSchema, AcademicYearInput } from "@/lib/validations/unit";
import { createAcademicYearAction, togglePpdbActiveAction, updateAcademicYearAction, deleteAcademicYearAction } from "@/actions/unit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icon } from "@/components/ui/icon";
import { useRouter } from "next/navigation";

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  quota: number;
  registered: number;
  ppdbActive: boolean;
}

interface PpdbOverviewClientProps {
  unitId: string;
  unitName: string;
  activeYear: AcademicYear | null;
  pastYears: AcademicYear[];
}

export function PpdbOverviewClient({
  unitId,
  unitName,
  activeYear,
  pastYears,
}: PpdbOverviewClientProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AcademicYearInput>({
    resolver: zodResolver(academicYearSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
      quota: 30,
      ppdbActive: false,
    },
  });

  const onSubmit = async (data: AcademicYearInput) => {
    setServerError(null);
    try {
      if (editingId) {
        await updateAcademicYearAction(unitId, editingId, data);
      } else {
        await createAcademicYearAction(unitId, data);
      }
      setShowModal(false);
      setEditingId(null);
      reset();
      router.refresh();
    } catch (error: any) {
      setServerError(error.message || "Terjadi kesalahan.");
    }
  };

  const handleToggle = async (ayId: string, activate: boolean) => {
    if (activate && !confirm("Aktifkan PPDB untuk tahun ini? PPDB yang sedang aktif (jika ada) otomatis dinonaktifkan.")) return;
    setIsToggling(true);
    try {
      await togglePpdbActiveAction(unitId, ayId, activate);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Gagal mengubah status.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleEdit = (ay: AcademicYear) => {
    setEditingId(ay.id);
    reset({
      name: ay.name,
      startDate: new Date(ay.startDate).toISOString().split('T')[0],
      endDate: new Date(ay.endDate).toISOString().split('T')[0],
      quota: ay.quota,
      ppdbActive: ay.ppdbActive
    });
    setShowModal(true);
  };

  const handleDelete = async (ayId: string) => {
    if (!confirm("Yakin ingin menghapus tahun ajaran ini?")) return;
    setIsDeleting(ayId);
    try {
      await deleteAcademicYearAction(unitId, ayId);
      router.refresh();
    } catch (error: any) {
      alert(error.message || "Gagal menghapus.");
    } finally {
      setIsDeleting(null);
    }
  };

  const fmt = (d: string) => {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Panel */}
      <div className="bg-surface rounded-2xl shadow-sm border border-border p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-tertiary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <h1 className="font-heading font-bold text-2xl text-primary relative z-10">
          Overview PPDB: {unitName}
        </h1>
        <p className="text-gray-500 mt-1 relative z-10">
          Ringkasan status penerimaan peserta didik baru dan riwayat tahun ajaran.
        </p>

        {activeYear ? (
          <div className="mt-6 bg-gradient-to-r from-tertiary/10 to-transparent p-6 rounded-xl border border-tertiary/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <Badge variant="teal" className="animate-pulse">PPDB BERJALAN</Badge>
                  <h3 className="font-heading font-bold text-xl text-primary">
                    T.A. {activeYear.name}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-semibold text-tertiary">{activeYear.registered}</span> pendaftar dari kuota <span className="font-semibold">{activeYear.quota}</span> siswa.
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Periode: {fmt(activeYear.startDate)} - {fmt(activeYear.endDate)}
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                disabled={isToggling}
                onClick={() => handleToggle(activeYear.id, false)}
              >
                <Icon name="pause_circle" className="mr-1" />
                Nonaktifkan PPDB
              </Button>
            </div>
            {/* Progress bar */}
            <div className="mt-4 w-full bg-white/60 rounded-full h-2.5">
              <div
                className="h-full rounded-full bg-tertiary transition-all"
                style={{
                  width: `${Math.min(
                    Math.round((activeYear.registered / activeYear.quota) * 100),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-500 bg-neutral/30 mt-6">
            <Icon name="event_busy" className="text-4xl mb-2 text-gray-300" />
            <p className="text-sm font-medium">Belum ada PPDB aktif untuk {unitName}.</p>
            <p className="text-xs mt-1">
              Buat tahun ajaran baru dan aktifkan PPDB-nya.
            </p>
          </div>
        )}
      </div>

      {/* Past Years Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-semibold text-xl text-primary">
            Riwayat Tahun Ajaran
          </h2>
          <Button variant="primary" size="sm" onClick={() => { setEditingId(null); reset(); setShowModal(true); }}>
            <Icon name="add" className="mr-1" />
            Tambah Tahun Ajaran
          </Button>
        </div>

        <div className="bg-surface rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm text-left text-gray-600">
            <thead className="text-xs text-gray-500 uppercase bg-neutral/50 border-b border-border">
              <tr>
                <th className="px-5 py-3 font-semibold">Tahun Ajaran</th>
                <th className="px-5 py-3 font-semibold">Mulai</th>
                <th className="px-5 py-3 font-semibold">Selesai</th>
                <th className="px-5 py-3 font-semibold">Kuota</th>
                <th className="px-5 py-3 font-semibold">Terdaftar</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {[...(activeYear ? [activeYear] : []), ...pastYears].map((ay) => {
                const canEditDelete = new Date() <= new Date(ay.endDate) && ay.registered < ay.quota;
                
                return (
                  <tr key={ay.id} className="hover:bg-neutral/30 transition-colors">
                    <td className="px-5 py-3 font-medium text-primary">{ay.name}</td>
                    <td className="px-5 py-3">{fmt(ay.startDate)}</td>
                    <td className="px-5 py-3">{fmt(ay.endDate)}</td>
                    <td className="px-5 py-3">{ay.quota}</td>
                    <td className="px-5 py-3">{ay.registered}</td>
                    <td className="px-5 py-3">
                      {ay.ppdbActive ? (
                        <Badge variant="green">Aktif</Badge>
                      ) : (
                        <Badge variant="gray">Nonaktif</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {!ay.ppdbActive ? (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={isToggling}
                          onClick={() => handleToggle(ay.id, true)}
                        >
                          Aktifkan
                        </Button>
                      ) : canEditDelete ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(ay)}
                            title="Ubah Tahun Ajaran"
                          >
                            <Icon name="edit" className="text-sm" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            disabled={isDeleting === ay.id}
                            onClick={() => handleDelete(ay.id)}
                            title="Hapus Tahun Ajaran"
                          >
                            <Icon name="delete" className="text-sm" />
                          </Button>
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {!activeYear && pastYears.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-gray-400 text-sm">
                    Belum ada tahun ajaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface w-full max-w-md rounded-xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-primary mb-4">
              {editingId ? "Ubah Tahun Ajaran" : "Tambah Tahun Ajaran Baru"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {serverError && (
                <div className="p-3 bg-red-50 text-red-600 rounded text-sm">{serverError}</div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Tahun Ajaran <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("name")}
                  placeholder="Contoh: 2027/2028"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none"
                />
                {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                  <input type="date" {...register("startDate")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
                  {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Selesai</label>
                  <input type="date" {...register("endDate")} className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none" />
                  {errors.endDate && <p className="mt-1 text-xs text-red-500">{errors.endDate.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kuota Siswa
                </label>
                <input
                  type="number"
                  {...register("quota", { valueAsNumber: true })}
                  min={1}
                  max={500}
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:ring-1 focus:ring-tertiary focus:outline-none"
                />
                {errors.quota && <p className="mt-1 text-xs text-red-500">{errors.quota.message}</p>}
              </div>
              {!editingId && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="ppdbActive"
                    {...register("ppdbActive")}
                    className="rounded border-gray-300 text-tertiary"
                  />
                  <label htmlFor="ppdbActive" className="text-sm font-medium text-gray-700">
                    Langsung aktifkan PPDB
                  </label>
                </div>
              )}
              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => { setShowModal(false); setEditingId(null); reset(); }}
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
