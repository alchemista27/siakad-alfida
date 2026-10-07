"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { createExecutionMeeting } from "@/actions/strategic";
import { useRouter } from "next/navigation";
import { NotificationModal } from "@/components/ui/notification-modal";

export default function MeetingsClient({ meetings, users }: any) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', meetingDate: '', agenda: '', attendees: [] as string[] });
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState({ isOpen: false, title: '', message: '', type: 'info' as 'success' | 'error' | 'info' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createExecutionMeeting('dummy-token-unused', {
        title: formData.title,
        meetingDate: formData.meetingDate ? new Date(formData.meetingDate).toISOString() : new Date().toISOString(),
        agenda: formData.agenda,
        attendees: formData.attendees,
        programId: '00000000-0000-0000-0000-000000000000' // requires a valid programId based on schema, needs refactoring to dropdown
      });
      setIsModalOpen(false);
      setFormData({ title: '', meetingDate: '', agenda: '', attendees: [] });
      router.refresh();
      setNotif({ isOpen: true, title: 'Sukses', message: 'Jadwal meeting berhasil ditambahkan.', type: 'success' });
    } catch (error: any) {
      setNotif({ isOpen: true, title: 'Gagal', message: error.message || 'Gagal menambahkan meeting.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-primary">Rapat Pimpinan</h1>
          <p className="text-sm text-gray-500">Notulensi dan Tindak Lanjut Rapat Strategis</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-tertiary text-on-tertiary px-4 py-2 rounded text-sm font-semibold hover:bg-tertiary/90 transition-colors flex items-center gap-2">
          <Icon name="add" className="text-sm" />
          <span>Tambah Notulensi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {meetings.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-border">
            Belum ada data rapat pimpinan.
          </div>
        ) : (
          meetings.map((m: any) => (
            <Card key={m.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <span>{m.title}</span>
                  <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full mt-2 sm:mt-0">
                    {new Date(m.meetingDate).toLocaleDateString("id-ID")}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">
                  <span className="font-semibold text-gray-700">Agenda:</span> {m.agenda}
                </div>
                
                {m.decisions && m.decisions.length > 0 && (
                  <div className="mt-4 border-t pt-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Tindak Lanjut / Keputusan:</h4>
                    <ul className="list-disc pl-5 space-y-2">
                      {m.decisions.map((d: any) => (
                        <li key={d.id} className="text-sm">
                          <span className={d.isDone ? "line-through text-gray-400" : "text-gray-800"}>
                            {d.decision}
                          </span>
                          <span className="text-xs text-gray-500 ml-2">
                            (PIC: {d.pic?.fullName || 'Belum ditugaskan'})
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg border-hairline w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold font-heading">Tambah Notulensi Rapat</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Judul Rapat</label>
                  <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" placeholder="Contoh: Rapat Evaluasi Q1" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Rapat</label>
                  <input required type="date" value={formData.meetingDate} onChange={e => setFormData({...formData, meetingDate: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penyelenggara / Unit</label>
                  <input type="text" placeholder="BPH Yayasan" className="w-full border rounded p-2 focus:ring focus:ring-primary/20 bg-gray-50" disabled />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Agenda & Pembahasan</label>
                  <textarea required value={formData.agenda} onChange={e => setFormData({...formData, agenda: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20 min-h-[100px]" placeholder="Tulis rincian pembahasan rapat..."></textarea>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm font-medium">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm font-medium disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Notulensi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
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
