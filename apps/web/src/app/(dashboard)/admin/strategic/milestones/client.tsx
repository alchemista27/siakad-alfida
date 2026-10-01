"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createMilestone, updateMilestone, deleteMilestone } from '@/actions/strategic';

type Program = { id: string; title: string; };
type Milestone = {
  id: string;
  programId: string;
  order: number;
  name: string;
  output: string | null;
  program?: Program;
};

export default function MilestonesClient({ initialData, programs }: { initialData: Milestone[], programs: Program[] }) {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialForm = { programId: programs[0]?.id || '', order: 1, name: '', output: '' };
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (m?: Milestone) => {
    if (m) {
      setEditingId(m.id);
      setFormData({ 
        programId: m.programId, 
        order: m.order, 
        name: m.name, 
        output: m.output || ''
      });
    } else {
      setEditingId(null);
      setFormData(initialForm);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        programId: formData.programId,
        order: Number(formData.order),
        name: formData.name,
        output: formData.output || null
      };

      if (editingId) {
        await updateMilestone(editingId, payload);
      } else {
        await createMilestone(payload);
      }
      setIsModalOpen(false);
      router.refresh();
      window.location.reload(); 
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan milestone');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus milestone ini?')) return;
    try {
      await deleteMilestone(id);
      router.refresh();
      window.location.reload();
    } catch (err) {
      alert('Gagal menghapus milestone');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Daftar Milestone</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-sm px-4 py-2">
          Tambah Milestone
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">No. Urut</th>
              <th className="px-6 py-3">Nama Fase / Milestone</th>
              <th className="px-6 py-3">Program Kerja</th>
              <th className="px-6 py-3">Output yang Diharapkan</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {milestones.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Belum ada data milestone</td>
              </tr>
            ) : (
              milestones.map(m => (
                <tr key={m.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-700">{m.order}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{m.name}</td>
                  <td className="px-6 py-4">{m.program?.title}</td>
                  <td className="px-6 py-4">{m.output || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleOpenModal(m)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(m.id)} className="text-red-600 hover:underline">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Milestone' : 'Tambah Milestone Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Kerja Induk</label>
                <select required value={formData.programId} onChange={e => setFormData({...formData, programId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                  <option value="" disabled>Pilih Program</option>
                  {programs.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan ke-</label>
                  <input required type="number" min="1" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Fase / Milestone</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" placeholder="Misal: Perancangan Draft Awal" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Output yang Diharapkan</label>
                <textarea value={formData.output} onChange={e => setFormData({...formData, output: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" rows={3}></textarea>
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
    </div>
  );
}
