"use client";

import React from "react";

export function SpmbNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-[#E3E8E7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-decoration-none">
            <div className="w-9 h-9 rounded-lg bg-[#06bfa2] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900 tracking-tight block leading-tight">
                SPMB Alfida
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
          <a
            href="/admin"
            className="text-sm font-semibold text-[#0f7f6d] bg-teal-50 px-3 py-1.5 rounded-md hover:bg-teal-100 transition-colors"
          >
            Portal Panitia / Admin
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="https://auth.alfida.or.id/login?return_to=https%3A%2F%2Fspmb.alfida.or.id%2Fparent"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
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
            href="/register"
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-lg bg-[#06bfa2] text-white hover:bg-[#05a88e] shadow-sm transition-all"
          >
            Daftar Sekarang
          </a>
        </div>
      </div>
    </header>
  );
}
