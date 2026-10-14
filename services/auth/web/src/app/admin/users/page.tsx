"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@alfida/ui";

interface UserItem {
  id: string;
  email: string;
  fullName: string;
  username: string | null;
  phone: string | null;
  isActive: boolean;
  roles: Array<{
    id: string;
    app: string;
    role: string;
    unitId: string | null;
  }>;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<{ fullName: string; roles?: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedApp, setSelectedApp] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (selectedApp) params.set("app", selectedApp);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("Akses terbatas untuk Super Admin");
        }
        throw new Error("Gagal mengambil data pengguna");
      }
      const data = await res.json();
      setUsers(data.items || []);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat memuat data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function loadCurrentUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
        }
      } catch (e) {
        // Abaikan jika gagal
      }
    }
    loadCurrentUser();
    fetchUsers();
  }, [selectedApp]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      if (!res.ok) throw new Error("Gagal memperbarui status pengguna");
      // Update state
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isActive: !currentStatus } : u))
      );
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      window.location.href = "/login";
    }
  };

  const sidebarGroups = [
    {
      title: "Pengguna",
      items: [
        {
          label: "Daftar Pengguna",
          href: "/admin/users",
          icon: "group",
          active: true,
        },
      ],
    },
    {
      title: "Sistem & Modul",
      items: [
        {
          label: "Portal Modul",
          href: "/modules",
          icon: "apps",
        },
        {
          label: "SPMB (Siswa Baru)",
          href: "https://spmb.alfida.or.id",
          icon: "school",
        },
        {
          label: "SIMAKIN (Kinerja)",
          href: "https://simakin.alfida.or.id",
          icon: "trending_up",
        },
        {
          label: "SIMPEG (Kepegawaian)",
          href: "https://simpeg.alfida.or.id",
          icon: "badge",
        },
        {
          label: "SIYAUM (Tilawah Quran)",
          href: "https://siyaum.alfida.or.id",
          icon: "menu_book",
        },
        {
          label: "SIAKAD (Akademik)",
          href: "https://sim.alfida.or.id",
          icon: "auto_stories",
        },
      ],
    },
  ];

  return (
    <AppShell
      serviceName="Alfida ID"
      userName={currentUser?.fullName || "Super Admin"}
      userRole="SUPER ADMIN"
      onLogout={handleLogout}
      sidebarGroups={sidebarGroups}
      topbarActions={
        <Link
          href="/modules"
          className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#e6f4f1]"
        >
          <span className="material-symbols-rounded text-[16px]">apps</span>
          <span className="hidden sm:inline">Pilih Modul</span>
        </Link>
      }
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Manajemen Pengguna & Peran
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Kelola hak akses pengguna lintas aplikasi Yayasan Alfida
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Link
              href="/modules"
              className="text-xs text-tertiary hover:bg-[#e6f4f1] font-semibold px-3 py-1.5 rounded border border-tertiary inline-flex items-center gap-1 transition-colors"
            >
              <span className="material-symbols-rounded text-[16px]">arrow_back</span>
              <span>Kembali ke Portal Modul</span>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              placeholder="Cari nama, email, atau username..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3.5 py-2 border border-border rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-rounded text-[16px]">search</span>
              <span>Cari</span>
            </button>
          </form>

          <select
            value={selectedApp}
            onChange={(e) => setSelectedApp(e.target.value)}
            className="px-3.5 py-2 border border-border rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0f7f6d] bg-white text-primary"
          >
            <option value="">Semua Aplikasi</option>
            <option value="auth">Auth</option>
            <option value="simakin">Simakin</option>
            <option value="simpeg">Simpeg</option>
            <option value="siyaum">Siyaum</option>
            <option value="siakad">Siakad</option>
            <option value="spmb">SPMB</option>
          </select>
        </div>

        {/* Data Table */}
        <div className="mt-6 bg-white border border-border rounded-lg overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-gray-500">
              <span className="material-symbols-rounded animate-spin text-tertiary text-[28px] mx-auto mb-2 block">
                progress_activity
              </span>
              <span>Memuat daftar pengguna...</span>
            </div>
          ) : error ? (
            <div className="p-8 text-center">
              <p className="text-xs text-red-600 font-medium mb-3">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded"
              >
                Coba Lagi
              </button>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-500">
              Tidak ada data pengguna yang sesuai dengan kriteria pencarian.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border text-xs text-left">
                <thead className="bg-[#F7F8F8] text-gray-600 font-semibold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">Nama & Identitas</th>
                    <th scope="col" className="px-6 py-3.5">Email / Kontak</th>
                    <th scope="col" className="px-6 py-3.5">Peran Aktif</th>
                    <th scope="col" className="px-6 py-3.5">Status</th>
                    <th scope="col" className="px-6 py-3.5 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#fafbfb] transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-primary">{user.fullName}</div>
                        {user.username && (
                          <div className="text-[11px] text-gray-400 font-mono">@{user.username}</div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-primary">{user.email}</div>
                        {user.phone && <div className="text-[11px] text-gray-400">{user.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {user.roles.length > 0 ? (
                            user.roles.map((r) => (
                              <span
                                key={r.id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#e6f4f1] text-tertiary border border-emerald-100"
                              >
                                {r.app !== "*" ? `${r.app}: ` : ""}{r.role}
                              </span>
                            ))
                          ) : (
                            <span className="text-[11px] text-gray-400 italic">Tanpa peran</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            user.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {user.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(user.id, user.isActive)}
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded border transition-colors ${
                            user.isActive
                              ? "border-red-200 text-red-700 hover:bg-red-50"
                              : "border-green-200 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          {user.isActive ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
