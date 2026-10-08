"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createEvidence, updateEvidence, deleteEvidence } from '@/actions/strategic';
import { NotificationModal } from '@/components/ui/notification-modal';
import { CloudinaryUpload } from '@/components/ui/cloudinary-upload';

type User = { id: string; fullName: string; };
type Program = { title: string; };
type Milestone = { name: string; program?: Program; };
type Task = { id: string; name: string; milestone?: Milestone; };
type Evidence = {
  id: string;
  taskId: string;
  name: string;
  digitalLink: string | null;
  type: string;
  ownerId: string | null;
  verificationStatus: string;
  verifierId: string | null;
  task?: Task;
  owner?: User;
  verifier?: User;
};

export default function EvidenceClient({ initialData, tasks, users }: { initialData: Evidence[], tasks: Task[], users: User[] }) {
  const router = useRouter();
  const [evidences, setEvidences] = useState<Evidence[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const initialForm = { taskId: '', name: '', digitalLink: '', type: 'document', ownerId: '', verificationStatus: 'unverified', verifierId: '' };
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });

  // Sinkronisasi data ke client state setiap router.refresh() ditarik
  React.useEffect(() => {
    setEvidences(initialData);
  }, [initialData]);

  const handleOpenModal = (e?: Evidence) => {
    if (e) {
      setEditingId(e.id);
      setFormData({ 
        taskId: e.taskId, 
        name: e.name, 
        digitalLink: e.digitalLink || '',
        type: e.type,
        ownerId: e.ownerId || '',
        verificationStatus: e.verificationStatus,
        verifierId: e.verifierId || ''
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
      const selectedTask = tasks.find(t => t.id === formData.taskId) as any;
      const payload = {
        taskId: formData.taskId,
        programId: selectedTask?.programId,
        name: formData.name,
        digitalLink: formData.digitalLink || null,
        type: formData.type,
        verificationStatus: formData.verificationStatus,
        verifierId: formData.verificationStatus !== 'unverified' ? (formData.verifierId || null) : null
      };

      if (editingId) {
        await updateEvidence(editingId, payload);
        setNotif({ isOpen: true, title: 'Berhasil', message: 'Bukti kinerja berhasil diperbarui.', type: 'success' });
      } else {
        await createEvidence(payload);
        setNotif({ isOpen: true, title: 'Berhasil', message: 'Bukti kinerja berhasil ditambahkan.', type: 'success' });
      }
      setIsModalOpen(false);
      router.refresh();
    } catch (err: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: err?.message || 'Terjadi kesalahan saat menyimpan data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus dokumen ini?')) return;
    try {
      await deleteEvidence(id);
      router.refresh();
      setNotif({ isOpen: true, title: 'Berhasil', message: 'Dokumen berhasil dihapus.', type: 'success' });
    } catch (err: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: err?.message || 'Gagal menghapus dokumen', type: 'error' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-800">Daftar Berkas Evidence</h2>
        <button onClick={() => handleOpenModal()} className="btn btn-primary text-sm px-4 py-2">
          Unggah Evidence Baru
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Dokumen</th>
              <th className="px-6 py-3">Terkait Task</th>
              <th className="px-6 py-3">Pengunggah</th>
              <th className="px-6 py-3">Status Verifikasi</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {evidences.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500 italic">Belum ada dokumen yang diunggah</td>
              </tr>
            ) : (
              evidences.map(ev => (
                <tr key={ev.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900">{ev.name}</p>
                    {ev.digitalLink && (
                      <a href={ev.digitalLink} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline inline-flex items-center mt-1">
                        Lihat Berkas ({ev.type})
                      </a>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-700">{ev.task?.name}</p>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase max-w-[200px] truncate">{ev.task?.milestone?.program?.title}</p>
                  </td>
                  <td className="px-6 py-4">{ev.owner?.fullName}</td>
                  <td className="px-6 py-4">
                    {ev.verificationStatus !== 'unverified' ? (
                      <div>
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${ev.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {ev.verificationStatus.toUpperCase()}
                        </span>
                        <p className="text-[10px] text-gray-500 mt-1">Oleh: {ev.verifier?.fullName}</p>
                      </div>
                    ) : (
                      <span className="px-2 py-1 rounded text-[10px] font-bold bg-yellow-100 text-yellow-800">UNVERIFIED</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleOpenModal(ev)} className="text-blue-600 hover:underline">Edit</button>
                    <button onClick={() => handleDelete(ev.id)} className="text-red-600 hover:underline">Hapus</button>
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
              <h3 className="text-lg font-semibold">{editingId ? 'Edit Evidence' : 'Unggah Evidence Baru'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama / Judul Dokumen</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" placeholder="Misal: Laporan Pelaksanaan Rapat" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Terkait Task / Pekerjaan</label>
                  <select required value={formData.taskId} onChange={e => setFormData({...formData, taskId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="" disabled>Pilih Task</option>
                    {tasks.map(t => <option key={t.id} value={t.id}>{t.name} ({t.milestone?.program?.title})</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Dokumen/File (Cloudinary)</label>
                  <CloudinaryUpload 
                    onUploadSuccess={(url) => setFormData({...formData, digitalLink: url})} 
                    buttonText={formData.digitalLink ? "Ganti Dokumen" : "Pilih Dokumen"} 
                  />
                  {formData.digitalLink && (
                    <div className="mt-2 text-sm">
                      Tautan tersimpan: <a href={formData.digitalLink} target="_blank" className="text-blue-600 underline truncate">{formData.digitalLink}</a>
                    </div>
                  )}
                  <input type="hidden" value={formData.digitalLink} name="digitalLink" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipe Bukti</label>
                  <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="document">Dokumen / PDF</option>
                    <option value="photo">Foto / Gambar</option>
                    <option value="video">Video</option>
                    <option value="link">Tautan / Link</option>
                  </select>
                </div>
                <div className="hidden">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pengunggah (Owner)</label>
                  <select value={formData.ownerId} onChange={e => setFormData({...formData, ownerId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="">Pilih Staf</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                  </select>
                </div>
                <div className="col-span-2 border-t pt-4 mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Verifikasi</label>
                  <select value={formData.verificationStatus} onChange={e => setFormData({...formData, verificationStatus: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="unverified">Unverified (Belum Diverifikasi)</option>
                    <option value="verified">Verified (Disetujui)</option>
                    <option value="rejected">Rejected (Ditolak / Perlu Perbaikan)</option>
                  </select>
                </div>
                {formData.verificationStatus !== 'unverified' && (
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Diverifikasi Oleh (Atasan/Koordinator)</label>
                    <select required value={formData.verifierId} onChange={e => setFormData({...formData, verifierId: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                      <option value="" disabled>Pilih Verifikator</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.fullName}</option>)}
                    </select>
                  </div>
                )}
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
