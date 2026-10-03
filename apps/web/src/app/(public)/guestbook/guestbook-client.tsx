"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { submitGuestbook } from "@/actions/guestbook";

export default function GuestbookClient() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    institution: "",
    purpose: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await submitGuestbook(formData);
      if (res.success) {
        setSuccess(true);
      } else {
        alert(res.error || "Gagal mengirim data. Silakan coba lagi.");
      }
    } catch (err) {
      alert("Terjadi kesalahan.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-neutral">
      <div className="bg-white rounded-xl shadow-md w-full max-w-md overflow-hidden">
        <div className="bg-primary p-6 text-white text-center">
          <Icon name="menu_book" className="text-4xl mb-2" />
          <h1 className="font-heading font-bold text-2xl">Buku Tamu Online</h1>
          <p className="text-sm text-gray-300 mt-1">Yayasan Alfida</p>
        </div>
        
        <div className="p-6">
          {success ? (
            <div className="text-center py-6">
              <Icon name="check_circle" className="text-5xl text-green-500 mb-2" />
              <h4 className="font-semibold text-lg mb-2">Terima Kasih!</h4>
              <p className="text-gray-600 text-sm mb-6">Data kunjungan Anda telah berhasil dicatat.</p>
              <Button onClick={() => setSuccess(false)} className="w-full mb-2">
                Isi Data Lagi
              </Button>
              <a href="https://al-fida.org/" className="block text-center text-sm text-tertiary hover:underline">
                Kembali ke Beranda Yayasan
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <p className="text-sm text-gray-600 mb-2 text-center">
                Selamat datang! Silakan isi form di bawah ini sebagai pencatatan kunjungan.
              </p>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Nama Lengkap <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  required 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full p-2 border border-border rounded-md focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all"
                  placeholder="Masukkan nama lengkap Anda"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Asal Instansi / Keterangan</label>
                <input 
                  type="text" 
                  value={formData.institution}
                  onChange={(e) => setFormData({...formData, institution: e.target.value})}
                  className="w-full p-2 border border-border rounded-md focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all"
                  placeholder="Contoh: PT ABC, Dinas Pendidikan, Pribadi"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Tanggal Kunjungan</label>
                <input 
                  type="text" 
                  readOnly
                  value={new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  className="w-full p-2 border border-border rounded-md bg-gray-50 text-gray-500"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Keperluan <span className="text-red-500">*</span></label>
                <textarea 
                  required 
                  rows={3}
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  className="w-full p-2 border border-border rounded-md focus:border-tertiary focus:ring-1 focus:ring-tertiary outline-none transition-all resize-none"
                  placeholder="Tuliskan tujuan / keperluan Anda"
                ></textarea>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                  {loading ? 'Mengirim Data...' : 'Kirim Data Kunjungan'}
                </Button>
              </div>

              <div className="text-center mt-4 pt-4 border-t border-border">
                <a href="https://al-fida.org/" className="text-xs text-gray-500 hover:text-primary">
                  Kembali ke Beranda Yayasan
                </a>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
