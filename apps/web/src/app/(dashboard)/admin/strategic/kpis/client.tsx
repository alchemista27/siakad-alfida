"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createKPI, updateKPI, deleteKPI } from '@/actions/strategic';

import { NotificationModal } from '@/components/ui/notification-modal';

type User = { id: string; fullName: string; email: string };
type Program = { id: string; title: string; };
type KPI = {
  id: string;
  programId: string;
  name: string;
  indicatorType: string;
  direction: string;
  target: number;
  unit: string;
  weight: number;
  picId: string | null;
  program?: Program;
  pic?: User;
};

export default function KPIsClient({ initialData, programs, users, isPengawas }: { initialData: KPI[], programs: Program[], users: User[], isPengawas?: boolean }) {
  const router = useRouter();
  const [kpis, setKpis] = useState<KPI[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialForm = { programId: programs[0]?.id || '', name: '', indicatorType: 'output', direction: 'higher_is_better', target: 100, unit: '%', weight: 10, picId: '' };
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });

  // Sinkronisasi data dari server ke client state setiap kali props initialData berubah (akibat router.refresh())
  useEffect(() => {
    setKpis(initialData);
  }, [initialData]);

  const handleOpenModal = (kpi?: KPI) => {
    if (isPengawas) return;
    if (kpi) {
      setEditingId(kpi.id);
      setFormData({ 
        programId: kpi.programId, 
        name: kpi.name, 
        indicatorType: kpi.indicatorType, 
        direction: kpi.direction,
        target: kpi.target,
        unit: kpi.unit,
        weight: kpi.weight,
        picId: kpi.picId || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPengawas) return;
    setLoading(true);
    try {
      const payload = {
        programId: formData.programId,
        name: formData.name,
        indicatorType: formData.indicatorType,
        direction: formData.direction,
        target: Number(formData.target),
        unit: formData.unit,
        weight: Number(formData.weight),
        picId: formData.picId || null
      };

      if (editingId) {
        await updateKPI(editingId, payload);
        setNotif({ isOpen: true, title: 'Berhasil', message: 'KPI berhasil diperbarui.', type: 'success' });
      } else {
        await createKPI(payload);
        setNotif({ isOpen: true, title: 'Berhasil', message: 'KPI baru berhasil ditambahkan.', type: 'success' });
      }
      setIsModalOpen(false);
      router.refresh();
      // window.location.reload(); // Biarkan Next.js router.refresh() yang menangani hydration 
    } catch (err: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: err?.message || 'Terjadi kesalahan saat menyimpan KPI', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (isPengawas) return;
    if (!confirm('Yakin ingin menghapus KPI ini?')) return;
    try {
      await deleteKPI(id);
      router.refresh();
      setNotif({ isOpen: true, title: 'Berhasil', message: 'KPI berhasil dihapus.', type: 'success' });
    } catch (err: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: err?.message || 'Gagal menghapus KPI', type: 'error' });
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-hairline p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Daftar KPI</h2>
        {!isPengawas && (
          <button onClick={() => handleOpenModal()} className="bg-tertiary text-on-tertiary hover:bg-tertiary/90 px-4 py-2 rounded text-sm font-semibold transition-colors">
            Tambah KPI
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Indikator KPI</th>
              <th className="px-6 py-3">Program Induk</th>
              <th className="px-6 py-3">Target</th>
              <th className="px-6 py-3">Bobot</th>
              {!isPengawas && <th className="px-6 py-3 text-right">Aksi</th>}
            </tr>
          </thead>
          <tbody>
            {kpis.length === 0 ? (
              <tr>
                <td colSpan={isPengawas ? 4 : 5} className="px-6 py-8 text-center text-gray-500 italic">Belum ada data KPI</td>
              </tr>
            ) : (
              kpis.map(kpi => (
                <tr key={kpi.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{kpi.name}</p>
                    <p className="text-xs text-gray-500">PIC: {kpi.pic ? kpi.pic.fullName : '-'}</p>
                  </td>
                  <td className="px-6 py-4">{kpi.program?.title}</td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-gray-800">{kpi.target}</span> {kpi.unit}
                    <div className="text-xs text-gray-400 mt-1">
                      ({kpi.direction === 'higher_is_better' ? 'Semakin Tinggi Baik' : kpi.direction === 'lower_is_better' ? 'Semakin Rendah Baik' : 'Harus Tepat'})
                    </div>
                  </td>
                  <td className="px-6 py-4">{kpi.weight}%</td>
                  {!isPengawas && (
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleOpenModal(kpi)} className="text-blue-600 hover:underline">Edit</button>
                      <button onClick={() => handleDelete(kpi.id)} className="text-red-600 hover:underline">Hapus</button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit KPI' : 'Tambah KPI Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Indikator (KPI)</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program Induk</label>
                  <select required value={formData.programId} onChange={e => setFormData({...formData, programId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="" disabled>Pilih Program Kerja</option>
                    {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Indikator</label>
                  <select value={formData.indicatorType} onChange={e => setFormData({...formData, indicatorType: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="input">Input (Masukan)</option>
                    <option value="process">Process (Proses)</option>
                    <option value="output">Output (Keluaran)</option>
                    <option value="outcome">Outcome (Dampak/Hasil)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arah Kinerja (Direction)</label>
                  <select value={formData.direction} onChange={e => setFormData({...formData, direction: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="higher_is_better">Semakin Tinggi Semakin Baik (Meningkatkan)</option>
                    <option value="lower_is_better">Semakin Rendah Semakin Baik (Menurunkan)</option>
                    <option value="exact_match">Sesuai Target Aktual (Tepat)</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Angka</label>
                    <input required type="number" step="0.01" value={formData.target} onChange={e => setFormData({...formData, target: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Satuan (Unit)</label>
                    <input required type="text" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" placeholder="Misal: %, Kali, Rupiah" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bobot KPI (%)</label>
                  <input required type="number" min="0" max="100" value={formData.weight} onChange={e => setFormData({...formData, weight: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIC (Penanggung Jawab Metrik)</label>
                  <select value={formData.picId} onChange={e => setFormData({...formData, picId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="">Pilih PIC (Opsional)</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Komponen Notifikasi Modal yang Menggantikan Alert Biasa */}
      <NotificationModal 
        isOpen={notif.isOpen} 
        onClose={() => setNotif({ ...notif, isOpen: false })} 
        title={notif.title} 
        message={notif.message} 
        type={notif.type} 
      />
    </div>
  );
}
