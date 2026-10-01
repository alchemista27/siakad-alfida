"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLog, updateLog, deleteLog } from '@/actions/strategic';

type User = { id: string; fullName: string; };
type Program = { title: string; };
type Milestone = { name: string; program?: Program; };
type Task = { id: string; name: string; milestone?: Milestone; };
type Log = {
  id: string;
  taskId: string;
  authorId: string;
  logDate: string;
  hoursSpent: number | null;
  description: string;
  statusUpdate: string;
  task?: Task;
  author?: User;
};

export default function LogsClient({ initialData, tasks, users }: { initialData: Log[], tasks: Task[], users: User[] }) {
  const router = useRouter();
  const [logs, setLogs] = useState<Log[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialForm = { taskId: tasks[0]?.id || '', authorId: '', logDate: new Date().toISOString().split('T')[0], hoursSpent: 0, description: '', statusUpdate: 'on_track' };
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);

  const handleOpenModal = (l?: Log) => {
    if (l) {
      setEditingId(l.id);
      setFormData({ 
        taskId: l.taskId, 
        authorId: l.authorId, 
        logDate: l.logDate.split('T')[0], 
        hoursSpent: l.hoursSpent || 0,
        description: l.description,
        statusUpdate: l.statusUpdate
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
        taskId: formData.taskId,
        authorId: formData.authorId,
        logDate: new Date(formData.logDate).toISOString(),
        hoursSpent: Number(formData.hoursSpent) || null,
        description: formData.description,
        statusUpdate: formData.statusUpdate
      };

      if (editingId) {
        await updateLog(editingId, payload);
      } else {
        await createLog(payload);
      }
      setIsModalOpen(false);
      router.refresh();
      window.location.reload(); 
    } catch (err) {
      alert('Terjadi kesalahan saat menyimpan log');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus log realisasi ini?')) return;
    try {
      await deleteLog(id);
      router.refresh();
      window.location.reload();
    } catch (err) {
      alert('Gagal menghapus log');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Daftar Log Realisasi</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-sm px-4 py-2">
          Catat Log Baru
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Tanggal & Penulis</th>
              <th className="px-6 py-3">Terkait Task</th>
              <th className="px-6 py-3">Keterangan / Aktivitas</th>
              <th className="px-6 py-3">Waktu (Jam)</th>
              <th className="px-6 py-3">Status Pencapaian</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500 italic">Belum ada data log realisasi</td>
              </tr>
            ) : (
              logs.map(l => (
                <tr key={l.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800">{new Date(l.logDate).toLocaleDateString('id-ID')}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{l.author?.fullName}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-blue-700">{l.task?.name}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase max-w-[200px] truncate">{l.task?.milestone?.program?.title}</p>
                  </td>
                  <td className="px-6 py-4 max-w-sm whitespace-pre-wrap">{l.description}</td>
                  <td className="px-6 py-4">{l.hoursSpent ? `${l.hoursSpent} jam` : '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs ${l.statusUpdate === 'on_track' ? 'bg-green-100 text-green-800' : l.statusUpdate === 'at_risk' ? 'bg-red-100 text-red-800' : l.statusUpdate === 'delayed' ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-800'}`}>
                      {l.statusUpdate.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleOpenModal(l)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(l.id)} className="text-red-600 hover:underline">Hapus</button>
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
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Log Realisasi' : 'Catat Log Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terkait Task / Pekerjaan</label>
                  <select required value={formData.taskId} onChange={e => setFormData({...formData, taskId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="" disabled>Pilih Task</option>
                    {tasks.map(t => <option key={t.id} value={t.id}>{t.name} ({t.milestone?.program?.title})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penulis Log (Pelaksana)</label>
                  <select required value={formData.authorId} onChange={e => setFormData({...formData, authorId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="" disabled>Pilih Pekerja</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Eksekusi</label>
                  <input required type="date" value={formData.logDate} onChange={e => setFormData({...formData, logDate: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan / Aktivitas yang Dilakukan</label>
                  <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" rows={4} placeholder="Jelaskan secara ringkas apa saja yang dikerjakan hari ini..."></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Dihabiskan (Jam)</label>
                  <input type="number" step="0.5" min="0" value={formData.hoursSpent} onChange={e => setFormData({...formData, hoursSpent: Number(e.target.value)})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" placeholder="Opsional" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Pencapaian Tugas</label>
                  <select value={formData.statusUpdate} onChange={e => setFormData({...formData, statusUpdate: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="on_track">On Track (Sesuai Rencana)</option>
                    <option value="delayed">Delayed (Tertunda)</option>
                    <option value="at_risk">At Risk (Beresiko Gagal/Mundur)</option>
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
