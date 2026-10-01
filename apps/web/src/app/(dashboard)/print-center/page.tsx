'use client';

import React, { useState } from 'react';

export default function PrintCenterPage() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    // Simulate generation time
    setTimeout(() => {
      setIsGenerating(false);
      alert('PDF berhasil di-generate! (Simulasi: File siap didownload)');
    }, 2000);
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4 mb-12">
        <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center mx-auto text-secondary">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
        </div>
        <h1 className="text-3xl font-heading font-bold text-primary">Print Center Yayasan</h1>
        <p className="text-gray-500 font-body max-w-xl mx-auto">Generate laporan manajerial, rekapan KPI, dan status program eksekusi dalam bentuk PDF resmi secara instan.</p>
      </div>

      <div className="bg-white border border-border rounded-3xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Laporan</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20">
                <option>Laporan Kinerja Eksekutif (Bulanan)</option>
                <option>Rekapitulasi Issue & Risiko</option>
                <option>Laporan Progress per Bidang</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bulan</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20">
                  <option>September</option>
                  <option>Agustus</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tahun</label>
                <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20">
                  <option>2026</option>
                  <option>2025</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bidang (Opsional)</label>
              <select className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20">
                <option>Semua Bidang</option>
                <option>Akademik</option>
                <option>Bina Pribadi Islam</option>
              </select>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col justify-between">
            <div>
              <h3 className="font-heading font-semibold text-lg text-primary mb-2">Preview Konfigurasi</h3>
              <ul className="space-y-3 text-sm text-gray-600 font-body mt-4">
                <li className="flex justify-between border-b pb-2"><span>Format:</span> <span className="font-medium text-gray-900">PDF Document (A4)</span></li>
                <li className="flex justify-between border-b pb-2"><span>Orientasi:</span> <span className="font-medium text-gray-900">Portrait</span></li>
                <li className="flex justify-between border-b pb-2"><span>Tanda Tangan:</span> <span className="font-medium text-gray-900">Ketua Yayasan</span></li>
              </ul>
            </div>
            
            <button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className={`w-full py-4 mt-6 rounded-xl font-semibold text-white shadow-lg transition-all flex items-center justify-center gap-2 ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-secondary to-tertiary hover:opacity-90 shadow-secondary/30'}`}
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating PDF...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Generate & Download Laporan
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
