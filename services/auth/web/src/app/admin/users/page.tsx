"use client";

import { useEffect } from "react";

/**
 * Manajemen pengguna dipusatkan di Service Admin.
 * Rute lama dipertahankan hanya sebagai kompatibilitas tautan lama.
 */
export default function LegacyAuthUsersRedirectPage() {
  useEffect(() => {
    window.location.replace("https://admin.alfida.or.id/users");
  }, []);

  return (
    <main className="min-h-screen bg-neutral text-primary flex items-center justify-center p-6 font-body">
      <section className="w-full max-w-md bg-surface border border-border rounded-lg p-5 text-center">
        <span className="material-symbols-rounded text-tertiary text-[36px]">manage_accounts</span>
        <h1 className="mt-3 font-heading font-bold text-xl">Mengalihkan ke Admin Yayasan</h1>
        <p className="mt-2 text-sm text-gray-500">
          Manajemen pengguna hanya tersedia pada Pusat Tata Kelola Yayasan.
        </p>
        <a
          href="https://admin.alfida.or.id/users"
          className="inline-flex mt-5 px-4 py-2 bg-tertiary text-on-tertiary rounded text-sm font-semibold hover:bg-[#0b6355]"
        >
          Buka Manajemen Pengguna
        </a>
      </section>
    </main>
  );
}
