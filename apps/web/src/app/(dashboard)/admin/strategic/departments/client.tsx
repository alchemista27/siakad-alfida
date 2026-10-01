"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createDepartment, updateDepartment, deleteDepartment } from '@/actions/strategic';

type User = { id: string; fullName: string; email: string };
type Department = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  leaderId: string | null;
  leader?: User | null;
};

export default function DepartmentsClient({ initialData, users }: { initialData: Department[], users: User[] }) {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', leaderId: '' });
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (dep: Department) => {
    setEditingId(dep.id);
    setFormData({ name: dep.name, description: dep.description || '', leaderId: dep.leaderId || '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        // Only update leaderId
        await updateDepartment(editingId, { leaderId: formData.leaderId || null });
      }
      setIsModalOpen(false);
      router.refresh();
      window.location.reload(); 
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan PIC bidang');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface rounded-md shadow-sm border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-primary">Daftar PIC Bidang (Strategic)</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-primary uppercase bg-neutral border-b border-border">
            <tr>
              <th className="px-6 py-3">Nama Bidang</th>
              <th className="px-6 py-3">Deskripsi</th>
              <th className="px-6 py-3">PIC / Pimpinan</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {departments.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">Belum ada data bidang. Silakan tambahkan di modul Manajemen Karyawan.</td>
              </tr>
            ) : (
              departments.map(dep => (
                <tr key={dep.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{dep.name}</td>
                  <td className="px-6 py-4">{dep.description || '-'}</td>
                  <td className="px-6 py-4">
                    {dep.leader ? (
                      <span className="font-semibold text-primary">{dep.leader.fullName}</span>
                    ) : (
                      <span className="text-gray-400 italic">Belum di-assign</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenModal(dep)} className="text-blue-600 hover:underline font-medium">Assign PIC</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">Assign PIC Bidang</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Bidang yang Dipilih</label>
                <div className="w-full bg-gray-50 border rounded p-2 text-gray-700 font-medium">
                  {formData.name}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pilih PIC Baru</label>
                <select required value={formData.leaderId} onChange={e => setFormData({...formData, leaderId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                  <option value="">-- Pilih PIC --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName}</option>
                  ))}
                </select>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-sm text-primary hover:bg-neutral">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-tertiary text-on-tertiary rounded-sm hover:opacity-90 disabled:opacity-50">
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
