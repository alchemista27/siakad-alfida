"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTask, updateTask, deleteTask } from '@/actions/strategic';

type User = { id: string; fullName: string; };
type Program = { id: string; title: string; };
type Milestone = { id: string; name: string; program?: Program; };
type Task = {
  id: string;
  milestoneId: string;
  assigneeId: string | null;
  name: string;
  description: string | null;
  status: string;
  priority: string;
  deadline: string | null;
  milestone?: Milestone;
  assignee?: User;
};

export default function TasksClient({ initialData, milestones, users }: { initialData: Task[], milestones: Milestone[], users: User[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialForm = { milestoneId: milestones[0]?.id || '', assigneeId: '', name: '', description: '', status: 'todo', priority: 'medium', deadline: '' };
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (t?: Task) => {
    if (t) {
      setEditingId(t.id);
      setFormData({ 
        milestoneId: t.milestoneId, 
        assigneeId: t.assigneeId || '', 
        name: t.name, 
        description: t.description || '',
        status: t.status,
        priority: t.priority,
        deadline: t.deadline ? t.deadline.split('T')[0] : ''
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
        milestoneId: formData.milestoneId,
        assigneeId: formData.assigneeId || null,
        name: formData.name,
        description: formData.description || null,
        status: formData.status,
        priority: formData.priority,
        deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
      };

      if (editingId) {
        await updateTask(editingId, payload);
      } else {
        await createTask(payload);
      }
      setIsModalOpen(false);
      router.refresh();
      window.location.reload(); 
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus task ini?')) return;
    try {
      await deleteTask(id);
      router.refresh();
      window.location.reload();
    } catch (err) {
      alert('Gagal menghapus task');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Daftar Task / Pekerjaan</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-sm px-4 py-2">
          Buat Task
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Task & Deskripsi</th>
              <th className="px-6 py-3">Fase & Program</th>
              <th className="px-6 py-3">Pekerja (Assignee)</th>
              <th className="px-6 py-3">Deadline</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">Belum ada data pekerjaan</td>
              </tr>
            ) : (
              tasks.map(t => (
                <tr key={t.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{t.name}</p>
                    {t.priority === 'high' && <span className="inline-block mt-1 px-2 py-0.5 text-[10px] bg-red-100 text-red-800 rounded">PRIORITAS TINGGI</span>}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium">{t.milestone?.name}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[150px]">{t.milestone?.program?.title}</p>
                  </td>
                  <td className="px-6 py-4">{t.assignee ? t.assignee.fullName : <span className="text-gray-400">Belum Ada</span>}</td>
                  <td className="px-6 py-4">{t.deadline ? new Date(t.deadline).toLocaleDateString('id-ID') : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${t.status === 'done' ? 'bg-green-100 text-green-800' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                      {t.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleOpenModal(t)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:underline">Hapus</button>
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
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Task' : 'Tambah Pekerjaan Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Tugas / Aktivitas</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterkaitan (Milestone & Program)</label>
                  <select required value={formData.milestoneId} onChange={e => setFormData({...formData, milestoneId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="" disabled>Pilih Fase/Milestone</option>
                    {milestones.map(m => <option key={m.id} value={m.id}>{m.name} — {m.program?.title}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Detail</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" rows={3}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pekerja / Assignee</label>
                  <select value={formData.assigneeId} onChange={e => setFormData({...formData, assigneeId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="">Belum Ditugaskan</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batas Waktu (Deadline)</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prioritas</label>
                  <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="low">Rendah</option>
                    <option value="medium">Menengah</option>
                    <option value="high">Tinggi</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Pekerjaan</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="todo">To Do (Akan Dikerjakan)</option>
                    <option value="in_progress">In Progress (Sedang Dikerjakan)</option>
                    <option value="under_review">Under Review (Menunggu Validasi)</option>
                    <option value="done">Done (Selesai)</option>
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
