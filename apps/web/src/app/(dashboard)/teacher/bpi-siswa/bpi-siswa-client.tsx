"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { addBpiReport } from "@/actions/teacher-monitoring";
import { Icon } from "@/components/ui/icon";

export function BpiSiswaClient({ homerooms, students, recentReports }: any) {
  const [selectedClass, setSelectedClass] = useState(homerooms[0]?.classId || "");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [activity, setActivity] = useState("");
  const [notes, setNotes] = useState("");
  const [isPending, startTransition] = useTransition();

  const currentStudents = students.filter((s: any) => s.classId === selectedClass);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !activity) return;

    startTransition(async () => {
      await addBpiReport(selectedStudent, activity, notes);
      setActivity("");
      setNotes("");
      setSelectedStudent("");
      alert("Laporan BPI Siswa berhasil dicatat!");
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Buat Catatan BPI</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value);
                  setSelectedStudent("");
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              >
                {homerooms.map((h: any) => (
                  <option key={h.class.id} value={h.class.id}>{h.class.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Siswa</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                required
              >
                <option value="" disabled>-- Pilih Siswa --</option>
                {currentStudents.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.studentData.fullName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Aktivitas BPI</label>
              <input
                type="text"
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Misal: Mentoring Mingguan"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Catatan Khusus (Opsional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Perkembangan spiritual anak..."
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isPending || !selectedStudent || !activity}
              className="w-full py-2 bg-tertiary text-white rounded-md text-sm font-semibold hover:bg-tertiary/90 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan Laporan"}
            </button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Riwayat Catatan BPI Kelas</h2>
          
          <div className="space-y-4">
            {recentReports.length > 0 ? (
              recentReports.map((r: any) => (
                <div key={r.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Icon name="groups" className="text-xl" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-semibold text-gray-800">{r.studentName}</h3>
                      <p className="text-xs text-gray-500">
                        {new Date(r.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{r.className}</p>
                    <p className="text-sm font-medium text-gray-700">{r.activity}</p>
                    {r.notes && <p className="text-sm text-gray-600 italic mt-1">&quot;{r.notes}&quot;</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Belum ada laporan BPI siswa.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
