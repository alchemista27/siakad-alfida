import React from "react";

interface ServicePlaceholderProps {
  title?: string;
  description?: string;
}

export function ServicePlaceholder({
  title = "Sistem Informasi Akademik (SIAKAD)",
  description = "Layanan terpadu operasional kurikulum, presensi, penilaian, jurnal mengajar, dan LHBS Yayasan Alfida.",
}: ServicePlaceholderProps) {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-lg w-full bg-white border border-[#E3E8E7] rounded-xl p-8 shadow-sm text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0f7f6d]/10 flex items-center justify-center text-[#0f7f6d]">
          <span className="material-symbols-rounded text-3xl">school</span>
        </div>
        <h1 className="font-heading text-2xl font-bold text-[#454545] mb-2">{title}</h1>
        <p className="text-sm text-[#454545]/80 leading-relaxed mb-6">{description}</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F7F8F8] border border-[#E3E8E7] text-xs text-[#0f7f6d] font-medium">
          <span className="w-2 h-2 rounded-full bg-[#0f7f6d] animate-pulse" />
          Layanan Akademik Aktif
        </div>
      </div>
    </main>
  );
}
