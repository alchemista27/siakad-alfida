"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { addInfraction } from "@/actions/teacher-monitoring";

export function InfractionsClient({ homerooms, students, recentInfractions }: any) {
  const [selectedClass, setSelectedClass] = useState(homerooms[0]?.classId || "");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();

  const currentStudents = students.filter((s: any) => s.classId === selectedClass);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !description) return;

    startTransition(async () => {
      await addInfraction(selectedStudent, description);
      setDescription("");
      setSelectedStudent("");
      alert("Pelanggaran berhasil dicatat!");
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Catat Pelanggaran Baru</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Pelanggaran</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                placeholder="Misal: Terlambat datang ke sekolah 15 menit..."
                required
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={isPending || !selectedStudent || !description}
              className="w-full py-2 bg-red-600 text-white rounded-md text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              {isPending ? "Menyimpan..." : "Simpan Catatan"}
            </button>
          </form>
        </Card>
      </div>

      <div className="lg:col-span-2">
        <Card className="p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Riwayat Pelanggaran Kelas Anda</h2>
          
          <div className="space-y-4">
            {recentInfractions.length > 0 ? (
              recentInfractions.map((i: any) => (
                <div key={i.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-800">{i.studentName}</h3>
                    <p className="text-xs text-gray-500 mb-2">{i.className}</p>
                    <p className="text-sm text-gray-700">{i.description}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium mb-1">
                      Pelanggaran
                    </span>
                    <p className="text-xs text-gray-500 block">
                      {new Date(i.date).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">Belum ada catatan pelanggaran.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
