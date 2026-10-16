"use client";

import React, { useState, useEffect } from "react";
import { SimakinShell } from "@/components/simakin-shell";
import { ConfirmModal } from "@/components/confirm-modal";
import {
  getMeetings,
  createMeeting,
  deleteMeeting,
  createActionItem,
  updateActionItemStatus,
} from "@/actions/strategic";
import { Badge, EmptyState, LoadingState, ErrorState } from "@alfida/ui";

interface ActionItem {
  id: string;
  title: string;
  picId?: string | null;
  status: "pending" | "in_progress" | "completed";
  dueDate?: string | null;
  pic?: { fullName: string };
}

interface MeetingItem {
  id: string;
  departmentId: string;
  title: string;
  meetingDate: string;
  location?: string | null;
  notes?: string | null;
  department?: { name: string };
  actionItems?: ActionItem[];
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal Buat Rapat
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingForm, setMeetingForm] = useState({
    departmentId: "",
    title: "",
    meetingDate: new Date().toISOString().slice(0, 16),
    location: "Ruang Rapat Yayasan Alfida",
    notes: "",
  });

  // Modal Action Item
  const [activeMeetingIdForAction, setActiveMeetingIdForAction] = useState<string | null>(null);
  const [actionItemForm, setActionItemForm] = useState({
    title: "",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });

  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMeetings();
      setMeetings(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat notulensi rapat");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingForm.title.trim()) return;

    setSubmitting(true);
    try {
      await createMeeting(meetingForm);
      setIsMeetingModalOpen(false);
      setMeetingForm({
        departmentId: "",
        title: "",
        meetingDate: new Date().toISOString().slice(0, 16),
        location: "Ruang Rapat Yayasan Alfida",
        notes: "",
      });
      fetchData();
    } catch (err: any) {
      setFeedback(err.message || "Gagal membuat rapat");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateActionItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeMeetingIdForAction || !actionItemForm.title.trim()) return;

    setSubmitting(true);
    try {
      await createActionItem({
        meetingId: activeMeetingIdForAction,
        title: actionItemForm.title.trim(),
        dueDate: actionItemForm.dueDate ? new Date(actionItemForm.dueDate).toISOString() : undefined,
      });
      setActiveMeetingIdForAction(null);
      setActionItemForm({
        title: "",
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      });
      fetchData();
    } catch (err: any) {
      setFeedback(err.message || "Gagal menambahkan tindak lanjut");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActionStatus = async (item: ActionItem) => {
    const nextStatus = item.status === "completed" ? "pending" : "completed";
    try {
      await updateActionItemStatus(item.id, { status: nextStatus });
      fetchData();
    } catch (err: any) {
      setFeedback(err.message || "Gagal memperbarui status tindak lanjut");
    }
  };

  const handleDeleteMeetingConfirm = async () => {
    if (!deletingId) return;
    setSubmitting(true);
    try {
      await deleteMeeting(deletingId);
      setDeletingId(null);
      fetchData();
    } catch (err: any) {
      setFeedback(err.message || "Gagal menghapus rapat");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SimakinShell activePath="/meetings">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-border gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-primary">
              Notulensi Rapat & Tindak Lanjut (Action Items)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Dokumentasi agenda rapat koordinasi bidang, keputusan pimpinan, dan pemantauan penugasan PIC
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsMeetingModalOpen(true)}
            className="px-4 py-2 bg-tertiary hover:bg-[#0b6355] text-white rounded text-xs font-semibold shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <span className="material-symbols-rounded text-[18px]">add</span>
            <span>+ Catat Rapat Baru</span>
          </button>
        </div>
        {feedback && <p className="mt-4 rounded-sm border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900" role="status">{feedback}</p>}

        {/* Content */}
        <div className="mt-6">
          {loading ? (
            <LoadingState message="Memuat notulensi rapat..." />
          ) : error ? (
            <ErrorState
              title="Gagal Memuat Rapat"
              message={error}
              onRetry={fetchData}
            />
          ) : meetings.length === 0 ? (
            <EmptyState
              title="Belum Ada Rekam Rapat"
              description="Belum ada notulensi rapat koordinasi yang dicatatkan."
            />
          ) : (
            <div className="space-y-5">
              {meetings.map((m) => (
                <div
                  key={m.id}
                  className="bg-surface border border-border rounded-lg p-5 hover:border-emerald-200 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
                    <div>
                      <h3 className="text-base font-bold font-heading text-primary flex items-center gap-2">
                        <span className="material-symbols-rounded text-tertiary text-[20px]">
                          meeting_room
                        </span>
                        <span>{m.title}</span>
                      </h3>
                      <div className="text-xs text-gray-500 mt-1 flex flex-wrap items-center gap-3">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-rounded text-[14px]">event</span>
                          <span>{new Date(m.meetingDate).toLocaleString("id-ID")}</span>
                        </span>
                        {m.location && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-rounded text-[14px]">location_on</span>
                            <span>{m.location}</span>
                          </span>
                        )}
                        {m.department && (
                          <span className="font-semibold text-tertiary bg-emerald-50 px-2 py-0.5 rounded">
                            {m.department.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setActiveMeetingIdForAction(m.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-tertiary hover:bg-[#e6f4f1] rounded border border-emerald-200 transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-rounded text-[14px]">add_task</span>
                        <span>+ Action Item</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(m.id)}
                        className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        title="Hapus Rapat"
                      >
                        <span className="material-symbols-rounded text-[18px]">delete</span>
                      </button>
                    </div>
                  </div>

                  {/* Catatan / Resume Rapat */}
                  {m.notes && (
                    <div className="my-3 p-3 bg-gray-50 rounded-lg text-xs text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {m.notes}
                    </div>
                  )}

                  {/* Daftar Action Items */}
                  <div className="mt-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-rounded text-[16px]">task_alt</span>
                      <span>Tindak Lanjut & Penugasan ({m.actionItems?.length || 0})</span>
                    </h4>

                    {(!m.actionItems || m.actionItems.length === 0) ? (
                      <p className="text-xs text-gray-400 italic">Belum ada action item untuk rapat ini.</p>
                    ) : (
                      <div className="space-y-1.5">
                        {m.actionItems.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50 text-xs transition-colors"
                          >
                            <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                              <input
                                type="checkbox"
                                checked={item.status === "completed"}
                                onChange={() => handleToggleActionStatus(item)}
                                className="w-4 h-4 text-tertiary rounded focus:ring-[#0f7f6d] cursor-pointer"
                              />
                              <span
                                className={
                                  item.status === "completed"
                                    ? "line-through text-gray-400"
                                    : "font-medium text-primary"
                                }
                              >
                                {item.title}
                              </span>
                            </label>

                            <div className="flex items-center gap-3">
                              {item.dueDate && (
                                <span className="text-[11px] text-gray-500">
                                  Deadline: {new Date(item.dueDate).toLocaleDateString("id-ID")}
                                </span>
                              )}
                              <Badge
                                variant={
                                  item.status === "completed"
                                    ? "success"
                                    : item.status === "in_progress"
                                    ? "info"
                                    : "neutral"
                                }
                              >
                                {item.status === "completed"
                                  ? "Selesai"
                                  : item.status === "in_progress"
                                  ? "Proses"
                                  : "Tertunda"}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Catat Rapat Baru */}
        {isMeetingModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg max-w-lg w-full p-6 border border-border">
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <h3 className="text-base font-bold font-heading text-primary">
                  Catat Agenda & Notulensi Rapat
                </h3>
                <button
                  type="button"
                  onClick={() => setIsMeetingModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="material-symbols-rounded text-[20px]">close</span>
                </button>
              </div>

              <form onSubmit={handleCreateMeeting} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Judul / Agenda Rapat *
                  </label>
                  <input
                    type="text"
                    required
                    value={meetingForm.title}
                    onChange={(e) => setMeetingForm({ ...meetingForm, title: e.target.value })}
                    placeholder="Contoh: Rapat Koordinasi Evaluasi KPI Triwulan I"
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Waktu & Tanggal Rapat
                    </label>
                    <input
                      type="datetime-local"
                      required
                      value={meetingForm.meetingDate}
                      onChange={(e) => setMeetingForm({ ...meetingForm, meetingDate: e.target.value })}
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-primary mb-1">
                      Lokasi / Tautan Meeting
                    </label>
                    <input
                      type="text"
                      value={meetingForm.location}
                      onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                      placeholder="Ruang Rapat / Google Meet"
                      className="w-full px-3 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Resume Keputusan & Poin Pembahasan
                  </label>
                  <textarea
                    rows={4}
                    value={meetingForm.notes}
                    onChange={(e) => setMeetingForm({ ...meetingForm, notes: e.target.value })}
                    placeholder="Tuliskan butir-butir kesepakatan dan notulensi rapat..."
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setIsMeetingModalOpen(false)}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded border border-border"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-tertiary hover:bg-[#0b6355] rounded shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Notulensi"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Tambah Action Item */}
        {activeMeetingIdForAction && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-surface rounded-lg max-w-md w-full p-6 border border-border">
              <h3 className="text-base font-bold font-heading text-primary mb-1">
                Tambah Tindak Lanjut (Action Item)
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Tugaskan aksi tindak lanjut hasil keputusan rapat.
              </p>

              <form onSubmit={handleCreateActionItem} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Uraian Tugas / Aksi *
                  </label>
                  <input
                    type="text"
                    required
                    value={actionItemForm.title}
                    onChange={(e) => setActionItemForm({ ...actionItemForm, title: e.target.value })}
                    placeholder="Contoh: Menyiapkan instrumen asesmen silabus guru"
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-primary mb-1">
                    Tenggat Waktu (Deadline)
                  </label>
                  <input
                    type="date"
                    value={actionItemForm.dueDate}
                    onChange={(e) => setActionItemForm({ ...actionItemForm, dueDate: e.target.value })}
                    className="w-full px-3.5 py-2 border border-border rounded text-xs focus:outline-none focus:ring-2 focus:ring-[#0f7f6d]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                  <button
                    type="button"
                    onClick={() => setActiveMeetingIdForAction(null)}
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded border border-border"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-tertiary hover:bg-[#0b6355] rounded shadow-sm disabled:opacity-50"
                  >
                    {submitting ? "Menyimpan..." : "Tambahkan Tugas"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Konfirmasi Hapus */}
        <ConfirmModal
          isOpen={!!deletingId}
          title="Konfirmasi Hapus Notulensi"
          message="Yakin ingin menghapus notulensi rapat ini beserta seluruh action item di dalamnya?"
          confirmLabel="Hapus Rapat"
          loading={submitting}
          onConfirm={handleDeleteMeetingConfirm}
          onCancel={() => setDeletingId(null)}
        />
      </div>
    </SimakinShell>
  );
}
