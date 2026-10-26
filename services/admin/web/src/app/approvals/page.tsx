"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin-shell";
import { ConfirmActionModal } from "@/components/confirm-action-modal";

interface PendingUser {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  createdAt: string;
  roles: Array<{
    id: string;
    app: string;
    role: string;
    unitId?: string;
  }>;
}

type UnitOption = { id: string; name: string };

type ConfirmAction = {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => Promise<void>;
};

export default function ApprovalsPage() {
  const [users, setUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [unitNames, setUnitNames] = useState<Record<string, string>>({});
  const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users/pending", {
        credentials: "include",
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setUsers(data);
        }
      }
    } catch (e) {
      setMessage({ text: "Gagal memuat antrean persetujuan.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    let active = true;
    fetch("/api/admin/users/units", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active || !Array.isArray(payload?.data)) return;
        setUnitNames(Object.fromEntries(
          (payload.data as UnitOption[]).map((unit) => [unit.id, unit.name]),
        ));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const handleApprove = async (id: string, name: string) => {
    setProcessingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/approve`, {
        method: "PATCH",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal menyetujui akun.");

      setMessage({ text: `Akun ${name} berhasil disetujui & diaktifkan!`, type: "success" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      setMessage({ text: err.message || "Gagal memproses persetujuan.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string, name: string) => {
    setProcessingId(id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${id}/reject`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal menolak akun.");

      setMessage({ text: `Pendaftaran ${name} telah ditolak dan data dihapus.`, type: "success" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      setMessage({ text: err.message || "Gagal memproses penolakan.", type: "error" });
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <AdminShell activePath="/approvals">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading text-primary">
                Persetujuan Pendaftaran Staf Baru
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                {users.length} Menunggu
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Antrean pendaftaran calon guru & karyawan dari formulir registrasi mandiri yang memerlukan verifikasi.
            </p>
          </div>
          <button
            onClick={fetchPending}
            disabled={loading}
            className="px-3 py-1.5 rounded border border-border bg-white hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 self-start md:self-auto text-gray-600"
          >
            <span className="material-symbols-rounded text-[16px]">refresh</span>
            <span>Muat Ulang</span>
          </button>
        </div>

        {/* Feedback Alert */}
        {message && (
          <div
            className={`p-4 rounded text-xs flex items-center gap-2 shadow-sm ${
              message.type === "success"
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            <span className="material-symbols-rounded text-[20px]">
              {message.type === "success" ? "check_circle" : "error"}
            </span>
            <span>{message.text}</span>
          </div>
        )}

        {/* Konten Utama */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-border">
            <span className="material-symbols-rounded animate-spin text-[32px] text-tertiary mb-2 block mx-auto">
              progress_activity
            </span>
            <p className="text-xs">Memuat antrean pendaftaran...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-xl border border-border shadow-sm">
            <span className="material-symbols-rounded text-emerald-600 text-[56px] mb-3 block mx-auto">
              task_alt
            </span>
            <h3 className="font-heading font-bold text-lg text-primary">
              Semua Bersih!
            </h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1">
              Tidak ada antrean pendaftaran staf yang menunggu persetujuan saat ini. Akun baru akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F8F8] border-b border-border text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Lengkap & Kontak</th>
                    <th className="py-3 px-4">Penugasan Unit</th>
                    <th className="py-3 px-4">Peran Diminta</th>
                    <th className="py-3 px-4">Waktu Daftar</th>
                    <th className="py-3 px-4 text-right">Tindakan Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {users.map((u) => {
                    const unitId = u.roles.find((r) => r.unitId)?.unitId;
                    const unitName = unitId ? unitNames[unitId] || "Unit Belum Ditentukan" : "-";
                    const isGuru = u.roles.some((r) => r.role === "guru");

                    return (
                      <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-primary">{u.fullName}</div>
                          <div className="text-[11px] text-gray-500">{u.email}</div>
                          {u.phone && (
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                              <span className="material-symbols-rounded text-[12px]">call</span>
                              <span>{u.phone}</span>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-[11px] font-medium border border-gray-200">
                            {unitName}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                              isGuru
                                ? "bg-teal-50 text-[#0f7f6d] border border-teal-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {isGuru ? "Guru (Pengajar)" : "Staf Karyawan"}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                          {new Date(u.createdAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setConfirmAction({
                                title: "Setujui Penugasan",
                                description: `Setujui ${u.fullName} sebagai ${isGuru ? "guru" : "karyawan"} di ${unitName}, buat penugasan awal di SIMPEG, lalu aktifkan akunnya?`,
                                confirmLabel: "Setujui Penugasan",
                                onConfirm: async () => { await handleApprove(u.id, u.fullName); },
                              })}
                              disabled={processingId === u.id}
                              className="px-3 py-1.5 rounded bg-tertiary hover:bg-[#0b6355] text-white font-semibold text-[11px] transition-colors flex items-center gap-1 shadow-sm disabled:opacity-50"
                            >
                              <span className="material-symbols-rounded text-[14px]">
                                check
                              </span>
                              <span>Setujui Penugasan</span>
                            </button>
                            <button
                              onClick={() => setConfirmAction({
                                title: "Tolak Pendaftaran",
                                description: `Tolak dan hapus pendaftaran ${u.fullName}? Tindakan ini tidak dapat dibatalkan.`,
                                confirmLabel: "Tolak Pendaftaran",
                                danger: true,
                                onConfirm: async () => { await handleReject(u.id, u.fullName); },
                              })}
                              disabled={processingId === u.id}
                              className="px-3 py-1.5 rounded border border-red-200 text-red-600 hover:bg-red-50 font-semibold text-[11px] transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                              <span className="material-symbols-rounded text-[14px]">
                                close
                              </span>
                              <span>Tolak</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {confirmAction && <ConfirmActionModal
          title={confirmAction.title}
          description={confirmAction.description}
          confirmLabel={confirmAction.confirmLabel}
          danger={confirmAction.danger}
          onClose={() => setConfirmAction(null)}
          onConfirm={async () => {
            await confirmAction.onConfirm();
            setConfirmAction(null);
          }}
        />}
      </div>
    </AdminShell>
  );
}
