"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/admin-shell";
import * as XLSX from "xlsx";

interface UserItem {
  id: string;
  email: string;
  username?: string;
  fullName: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  roles: Array<{
    id: string;
    app: string;
    role: string;
    unitId?: string;
  }>;
}

const APPS_LIST = [
  "auth",
  "simakin",
  "simpeg",
  "siyaum",
  "spmb",
  "siakad",
  "siskeu",
  "sisarpras",
  "sisurat",
  "core",
];

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [appFilter, setAppFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals & States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState<{ id: string; name: string } | null>(null);

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Add User Form
  const [newUserData, setNewUserData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    app: "simpeg",
    role: "pegawai",
  });

  // Reset Password Form
  const [newPassword, setNewPassword] = useState("");

  // Batch Import
  const [importing, setImporting] = useState(false);
  const [importStats, setImportStats] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (appFilter) query.set("app", appFilter);
      if (statusFilter) query.set("isActive", statusFilter);
      query.set("page", page.toString());
      query.set("limit", limit.toString());

      const res = await fetch(`/api/admin/users?${query.toString()}`, {
        credentials: "include",
      });

      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
        setTotal(json.meta?.total || 0);
      }
    } catch (e) {
      setMessage({ text: "Gagal memuat data pengguna.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, appFilter, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleStatus = async (user: UserItem) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ isActive: !user.isActive }),
      });
      if (res.ok) {
        setMessage({
          text: `Status akun ${user.fullName} berhasil diubah menjadi ${!user.isActive ? "Aktif" : "Nonaktif"}`,
          type: "success",
        });
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: !user.isActive } : u))
        );
      }
    } catch (err) {
      setMessage({ text: "Gagal mengubah status akun.", type: "error" });
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showPasswordModal || !newPassword) return;

    try {
      const res = await fetch(`/api/admin/users/${showPasswordModal.id}/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal mengatur ulang kata sandi");

      setMessage({ text: `Kata sandi untuk ${showPasswordModal.name} berhasil diperbarui!`, type: "success" });
      setShowPasswordModal(null);
      setNewPassword("");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteUser = async (user: UserItem) => {
    if (!confirm(`Hapus permanen akun pengguna ${user.fullName} (${user.email})? Tindakan ini tidak dapat dibatalkan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        setMessage({ text: `Pengguna ${user.fullName} berhasil dihapus.`, type: "success" });
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      setMessage({ text: "Gagal menghapus pengguna.", type: "error" });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: newUserData.fullName,
          email: newUserData.email,
          phone: newUserData.phone || undefined,
          password: newUserData.password,
          roles: [
            {
              app: newUserData.app,
              role: newUserData.role,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Gagal membuat pengguna");

      setMessage({ text: "Pengguna berhasil ditambahkan!", type: "success" });
      setShowAddModal(false);
      setNewUserData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        app: "simpeg",
        role: "pegawai",
      });
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportStats(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          throw new Error("File Excel kosong atau format tidak sesuai.");
        }

        const formattedUsers = data.map((row) => ({
          fullName: row["Nama"] || row["Nama Lengkap"] || row["fullName"] || "Pengguna Baru",
          email: row["Email"] || row["email"],
          phone: row["No HP"] || row["No Telepon"] || row["phone"] || null,
          role: row["Peran"] || row["Role"] || row["role"] || "pegawai",
          app: row["Aplikasi"] || row["App"] || row["app"] || "simpeg",
          password: row["Password"] || row["password"] || "Password123!",
        })).filter((u) => u.email && u.email.includes("@"));

        const res = await fetch("/api/admin/users/batch-import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ users: formattedUsers }),
        });

        const resJson = await res.json();
        if (!res.ok) throw new Error(resJson?.message || "Gagal memproses batch import");

        setImportStats(`Berhasil: ${resJson.successCount}, Gagal: ${resJson.failedCount}`);
        setMessage({ text: resJson.message, type: "success" });
        fetchUsers();
      } catch (err: any) {
        alert(err.message || "Gagal membaca file spreadsheet");
      } finally {
        setImporting(false);
        e.target.value = "";
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <AdminShell activePath="/users">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-heading text-primary">
                Manajemen Pengguna & Hak Akses
              </h1>
              <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                {total} Akun
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Kelola seluruh akun pengguna SSO Yayasan Alfida, status keaktifan, multi-peran, dan impor massal.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setShowImportModal(true)}
              className="px-3.5 py-2 rounded border border-border bg-white hover:bg-gray-50 text-xs font-semibold flex items-center gap-1.5 text-gray-700 shadow-sm"
            >
              <span className="material-symbols-rounded text-[18px] text-emerald-700">
                table_view
              </span>
              <span>Impor Excel</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-2 rounded bg-tertiary hover:bg-[#0b6355] text-white font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-rounded text-[18px]">person_add</span>
              <span>Tambah User</span>
            </button>
          </div>
        </div>

        {/* Feedback Message */}
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

        {/* Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-border shadow-sm flex flex-col md:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <span className="material-symbols-rounded absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama lengkap atau email..."
                className="w-full pl-9 pr-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-xs font-semibold text-gray-700"
            >
              Cari
            </button>
          </form>

          <div className="flex gap-2">
            <select
              value={appFilter}
              onChange={(e) => {
                setAppFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded border border-border bg-white focus:ring-2 focus:ring-[#0f7f6d] outline-none"
            >
              <option value="">Semua Aplikasi</option>
              {APPS_LIST.map((app) => (
                <option key={app} value={app}>
                  {app.toUpperCase()}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs rounded border border-border bg-white focus:ring-2 focus:ring-[#0f7f6d] outline-none"
            >
              <option value="">Semua Status</option>
              <option value="true">Aktif</option>
              <option value="false">Nonaktif</option>
            </select>
          </div>
        </div>

        {/* Tabel Pengguna */}
        {loading ? (
          <div className="p-12 text-center text-gray-500 bg-white rounded-xl border border-border">
            <span className="material-symbols-rounded animate-spin text-[32px] text-tertiary mb-2 block mx-auto">
              progress_activity
            </span>
            <p className="text-xs">Memuat data pengguna...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-xl border border-border shadow-sm">
            <span className="material-symbols-rounded text-gray-400 text-[48px] mb-2 block mx-auto">
              person_off
            </span>
            <p className="text-xs text-gray-500">Tidak ada pengguna yang cocok dengan filter pencarian.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F8F8] border-b border-border text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="py-3 px-4">Nama Lengkap & Kontak</th>
                    <th className="py-3 px-4">Peran & Lingkup Aplikasi</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Terdaftar</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-primary">{u.fullName}</div>
                        <div className="text-[11px] text-gray-500">{u.email}</div>
                        {u.phone && <div className="text-[10px] text-gray-400">{u.phone}</div>}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.roles.length > 0 ? (
                            u.roles.map((r) => (
                              <span
                                key={r.id}
                                className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200"
                              >
                                <strong>{r.app}:</strong> {r.role}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Tanpa Peran</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-colors ${
                            u.isActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                          }`}
                        >
                          {u.isActive ? "Aktif" : "Nonaktif"}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-[11px] text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString("id-ID")}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setShowPasswordModal({ id: u.id, name: u.fullName })}
                            className="p-1 rounded text-gray-500 hover:text-primary hover:bg-gray-100"
                            title="Reset Kata Sandi"
                          >
                            <span className="material-symbols-rounded text-[18px]">key</span>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="p-1 rounded text-red-500 hover:text-red-700 hover:bg-red-50"
                            title="Hapus Pengguna"
                          >
                            <span className="material-symbols-rounded text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-3 border-t border-border bg-[#F7F8F8] flex items-center justify-between text-xs text-gray-500">
              <div>
                Menampilkan {(page - 1) * limit + 1} - {Math.min(page * limit, total)} dari {total} pengguna
              </div>
              <div className="flex gap-1">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="px-2.5 py-1 rounded border border-border bg-white disabled:opacity-50"
                >
                  Sebelumnya
                </button>
                <button
                  disabled={page * limit >= total}
                  onClick={() => setPage(page + 1)}
                  className="px-2.5 py-1 rounded border border-border bg-white disabled:opacity-50"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Tambah Pengguna Manual */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-primary">
                  Tambah Pengguna Manual
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({ ...newUserData, fullName: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Contoh: Ahmad Fauzi, S.Pd"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Alamat Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="nama@alfida.or.id"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    No WhatsApp / Telepon
                  </label>
                  <input
                    type="tel"
                    value={newUserData.phone}
                    onChange={(e) => setNewUserData({ ...newUserData, phone: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Kata Sandi Awal *
                  </label>
                  <input
                    type="password"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                    placeholder="Minimal 8 karakter"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Aplikasi *
                    </label>
                    <select
                      value={newUserData.app}
                      onChange={(e) => setNewUserData({ ...newUserData, app: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border bg-white"
                    >
                      {APPS_LIST.map((app) => (
                        <option key={app} value={app}>
                          {app}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Peran (Role) *
                    </label>
                    <input
                      type="text"
                      required
                      value={newUserData.role}
                      onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                      className="w-full px-2 py-1.5 text-xs rounded border border-border"
                      placeholder="Contoh: pegawai / guru"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-3 py-1.5 rounded border border-border text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-tertiary hover:bg-[#0b6355] text-white text-xs font-semibold"
                  >
                    Simpan Pengguna
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Batch Import Excel */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-primary">
                  Impor Massal Pengguna (Spreadsheet)
                </h3>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <p>
                  Unggah berkas spreadsheet <code>.xlsx</code> atau <code>.csv</code> dengan kolom:
                </p>
                <div className="bg-gray-50 p-3 rounded border border-gray-200 font-mono text-[11px] text-gray-700">
                  Nama Lengkap | Email | No HP | Peran | Aplikasi
                </div>
                <p className="text-[11px] text-gray-400">
                  Password bawaan jika dikosongkan adalah <code>Password123!</code>.
                </p>

                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <span className="material-symbols-rounded text-[36px] text-gray-400 mb-2 block mx-auto">
                    upload_file
                  </span>
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    onChange={handleFileUpload}
                    disabled={importing}
                    className="text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-tertiary file:text-white hover:file:bg-[#0b6355]"
                  />
                  {importing && (
                    <p className="text-xs text-tertiary font-semibold mt-2 animate-pulse">
                      Sedang memproses spreadsheet...
                    </p>
                  )}
                  {importStats && (
                    <p className="text-xs text-emerald-800 font-semibold mt-2">
                      {importStats}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-2 border-t border-border">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-xs font-semibold text-gray-700"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Reset Password */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-heading font-bold text-base text-primary">
                  Reset Kata Sandi
                </h3>
                <button
                  onClick={() => setShowPasswordModal(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3">
                <p className="text-xs text-gray-600">
                  Masukkan kata sandi baru untuk <strong>{showPasswordModal.name}</strong>:
                </p>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full px-3 py-2 text-xs rounded border border-border focus:ring-2 focus:ring-[#0f7f6d] outline-none"
                />

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(null)}
                    className="px-3 py-1.5 rounded border border-border text-xs text-gray-600 hover:bg-gray-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded bg-tertiary hover:bg-[#0b6355] text-white text-xs font-semibold"
                  >
                    Perbarui Kata Sandi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
