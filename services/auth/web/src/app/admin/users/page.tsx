"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Pengguna & Peran</h1>
          <p className="text-sm text-gray-600 mt-1">
            Kelola hak akses pengguna lintas aplikasi Yayasan Alfida
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            href="/login"
            className="text-xs text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded border border-gray-300"
          >
            Halaman Login
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
            className="flex-1 px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Cari
          </button>
        </form>

        <select
          value={selectedApp}
          onChange={(e) => setSelectedApp(e.target.value)}
          className="px-3.5 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
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
      <div className="mt-6 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            <svg
              className="animate-spin h-6 w-6 text-emerald-600 mx-auto mb-2"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8H4z"
              />
            </svg>
            Memuat daftar pengguna...
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium rounded-lg"
            >
              Coba Lagi
            </button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Tidak ada data pengguna yang sesuai dengan kriteria pencarian.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
              <thead className="bg-gray-50 text-gray-700 font-medium">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Nama & Identitas</th>
                  <th scope="col" className="px-6 py-3.5">Email / Kontak</th>
                  <th scope="col" className="px-6 py-3.5">Peran Aktif</th>
                  <th scope="col" className="px-6 py-3.5">Status</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{user.fullName}</div>
                      {user.username && (
                        <div className="text-xs text-gray-500 font-mono">@{user.username}</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900">{user.email}</div>
                      {user.phone && <div className="text-xs text-gray-500">{user.phone}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.length > 0 ? (
                          user.roles.map((r) => (
                            <span
                              key={r.id}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200"
                            >
                              {r.app !== "*" ? `${r.app}: ` : ""}{r.role}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Tanpa peran</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
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
                        className={`text-xs font-medium px-2.5 py-1 rounded border transition-colors ${
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
  );
}
