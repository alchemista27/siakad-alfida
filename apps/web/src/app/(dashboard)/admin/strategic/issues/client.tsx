"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useState } from "react";
import { Icon } from "@/components/ui/icon";

export default function IssuesClient({ issues, tasks, users }: any) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', severity: 'Medium', deadline: '', assignedToId: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // TODO: Connect to actions/strategic createExecutionIssue
    setTimeout(() => {
      setLoading(false);
      setIsModalOpen(false);
    }, 500);
  };
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold font-heading text-primary">Risk & Issue Register</h1>
          <p className="text-sm text-gray-500">Manajemen risiko dan kendala eksekusi program</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-tertiary text-on-tertiary px-4 py-2 rounded text-sm font-semibold hover:bg-tertiary/90 transition-colors flex items-center gap-2">
          <Icon name="add" className="text-sm" />
          <span>Lapor Isu Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {issues.length === 0 ? (
          <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-border">
            Belum ada isu yang dilaporkan.
          </div>
        ) : (
          issues.map((i: any) => (
            <Card key={i.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between">
                  <span>{i.title}</span>
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">{i.severity}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{i.description}</p>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Dilaporkan oleh: {i.reportedBy?.fullName || '-'}</span>
                  <span>Ditugaskan ke: {i.assignedTo?.fullName || '-'}</span>
                  <span>Status: {i.status}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-surface rounded-lg border-hairline w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-bold font-heading">Laporkan Isu / Risiko Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Judul Isu / Risiko</label>
                <input required type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" placeholder="Contoh: Kendala Vendor IT" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Dampak</label>
                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" rows={3}></textarea>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Keparahan</label>
                  <select value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20">
                    <option value="Low">Low (Rendah)</option>
                    <option value="Medium">Medium (Sedang)</option>
                    <option value="High">High (Tinggi)</option>
                    <option value="Critical">Critical (Kritis)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tenggat Eskalasi</label>
                  <input type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="w-full border rounded p-2 focus:ring focus:ring-primary/20" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50 text-sm font-medium">Batal</button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 text-sm font-medium disabled:opacity-50">
                  {loading ? 'Menyimpan...' : 'Simpan Isu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
