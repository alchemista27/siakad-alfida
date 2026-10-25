"use client";

import React, { useEffect, useState } from "react";
import { useFoundationBranding } from "@/components/foundation-branding-provider";
import { SpmbBrandMark } from "@/components/spmb-brand-mark";
import { getCurrentSsoUser } from "@/lib/sso-client";

export function SpmbNavbar() {
  const { foundationName } = useFoundationBranding();
  const [user, setUser] = useState<{ fullName?: string; email?: string } | null>(null);
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || "https://auth.alfida.or.id";
  const parentPortalUrl = process.env.NEXT_PUBLIC_SPMB_PARENT_URL || "https://spmb.alfida.or.id/parent";

  useEffect(() => {
    async function checkAuth() {
      try {
        const currentUser = await getCurrentSsoUser();
        setUser(currentUser);
      } catch {
        // Navigation remains available when identity lookup is temporarily unavailable.
      }
    }
    void checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch(`${authUrl}/api/auth/logout`, { credentials: "include", method: "POST" });
    } catch {}
    window.location.href = `${authUrl}/login`;
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E3E8E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-decoration-none">
            <SpmbBrandMark surface="topbar" />
            <div>
              <span className="font-bold text-lg text-gray-900 tracking-tight block leading-tight">
                SPMB {foundationName}
              </span>
              <span className="text-xs text-gray-500 font-medium block">
                Penerimaan Peserta Didik Baru
              </span>
            </div>
          </a>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="/"
            className="text-sm font-medium text-gray-700 hover:text-[#06bfa2] transition-colors"
          >
            Beranda
          </a>
          <a
            href="/parent"
            className="text-sm font-medium text-gray-700 hover:text-[#06bfa2] transition-colors"
          >
            Portal Orang Tua
          </a>
          <a
            href="/parent"
            className="text-sm font-medium text-gray-700 hover:text-[#06bfa2] transition-colors"
          >
            Status Pendaftaran
          </a>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-[#454545] hidden sm:inline">
                {user.fullName || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="spmb-button-secondary text-xs"
              >
                Keluar
              </button>
            </div>
          ) : (
            <>
              <a
                href={`${authUrl}/login?return_to=${encodeURIComponent(parentPortalUrl)}`}
                className="spmb-button-secondary text-xs"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                  />
                </svg>
                Masuk Akun
              </a>
              <a
                href={`${authUrl}/register?return_to=${encodeURIComponent(parentPortalUrl)}`}
                className="spmb-button-primary text-xs"
              >
                Daftar Sekarang
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
