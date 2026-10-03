"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProgram, updateProgram, deleteProgram } from '@/actions/strategic';

type User = { id: string; fullName: string; email: string };
type Department = { id: string; name: string; };
type Program = {
  id: string;
  departmentId: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  coordinatorId: string | null;
  department?: Department;
  coordinator?: User;
};

export default function ProgramsClient({ initialData, departments, users }: { initialData: Program[], departments: Department[], users: User[] }) {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ departmentId: '', title: '', description: '', coordinatorId: '', priority: 'medium', status: 'planned' });
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (prog?: Program) => {
    if (prog) {
      setEditingId(prog.id);
      setFormData({ 
        departmentId: prog.departmentId, 
        title: prog.title, 
        description: prog.description || '', 
        coordinatorId: prog.coordinatorId || '',
        priority: prog.priority || 'medium',
        status: prog.status || 'planned'
      });
    } else {
      setEditingId(null);
      setFormData({ departmentId: departments[0]?.id || '', title: '', description: '', coordinatorId: '', priority: 'medium', status: 'planned' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        departmentId: formData.departmentId,
        title: formData.title,
        description: formData.description,
        coordinatorId: formData.coordinatorId || null,
        priority: formData.priority,
        status: formData.status
      };

      if (editingId) {
        await updateProgram(editingId, payload);
      } else {
        await createProgram(payload);
      }
      setIsModalOpen(false);
      router.refresh();
      window.location.reload(); 
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan program');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus program ini?')) return;
    try {
      await deleteProgram(id);
      router.refresh();
      window.location.reload();
    } catch (err) {
      alert('Gagal menghapus program');
    }
  };

  return (
    <div className="bg-surface rounded-lg border border-hairline p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Daftar Program Kerja</h2>
        <button onClick={() => handleOpenModal()} className="bg-tertiary text-on-tertiary hover:bg-tertiary/90 px-4 py-2 rounded text-sm font-semibold transition-colors">
          Tambah Program
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Program</th>
              <th className="px-6 py-3">Bidang</th>
              <th className="px-6 py-3">PIC / Koord</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {programs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Belum ada data program</td>
              </tr>
            ) : (
              programs.map(prog => (
                <tr key={prog.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{prog.title}</p>
                    <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">{prog.description}</p>
                  </td>
                  <td className="px-6 py-4">{prog.department?.name}</td>
                  <td className="px-6 py-4">{prog.coordinator ? prog.coordinator.fullName : <span className="text-gray-400">-</span>}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${prog.status === 'completed' ? 'bg-green-100 text-green-800' : prog.status === 'ongoing' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {prog.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleOpenModal(prog)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(prog.id)} className="text-red-600 hover:underline">Hapus</button>
                  </td>
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
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Program' : 'Tambah Program Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Program</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bidang / Biro</label>
                  <select required value={formData.departmentId} onChange={e => setFormData({...formData, departmentId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="" disabled>Pilih Bidang</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" rows={2}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Koordinator / PIC</label>
                  <select value={formData.coordinatorId} onChange={e => setFormData({...formData, coordinatorId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="">Pilih PIC (Opsional)</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="planned">Planned (Direncanakan)</option>
                    <option value="ongoing">Ongoing (Berjalan)</option>
                    <option value="completed">Completed (Selesai)</option>
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
    </div>
  );
}
