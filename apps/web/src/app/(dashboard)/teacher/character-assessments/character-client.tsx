"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { addCharacterAssessment } from "@/actions/teacher-monitoring";

export function CharacterAssessmentsClient({ homerooms, students, indicators }: any) {
  const [selectedClass, setSelectedClass] = useState(homerooms[0]?.classId || "");
  const [scores, setScores] = useState<Record<string, Record<string, number>>>({}); // { studentId: { indicatorId: score } }
  const [isPending, startTransition] = useTransition();

  const currentStudents = students.filter((s: any) => s.classId === selectedClass);
  const currentIndicators = indicators.filter((i: any) => i.unitId === homerooms.find((h:any) => h.classId === selectedClass)?.class.unitId);

  const handleScoreChange = (studentId: string, indicatorId: string, score: number) => {
    setScores(prev => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [indicatorId]: score
      }
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Flatten scores object into array
    const assessments: any[] = [];
    Object.entries(scores).forEach(([enrollmentId, indScores]) => {
      Object.entries(indScores).forEach(([indicatorId, score]) => {
        if (score > 0) {
          assessments.push({
            enrollmentId,
            indicatorId,
            score,
            notes: ""
          });
        }
      });
    });

    if (assessments.length === 0) return alert("Pilih minimal satu nilai untuk disimpan.");

    startTransition(async () => {
      await addCharacterAssessment(assessments);
      setScores({});
      alert("Penilaian berhasil disimpan!");
    });
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kelas</label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setScores({});
            }}
            className="w-full sm:w-64 px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            {homerooms.map((h: any) => (
              <option key={h.class.id} value={h.class.id}>{h.class.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="px-4 py-2 bg-tertiary text-white rounded-md text-sm font-semibold hover:bg-tertiary/90 disabled:opacity-50"
        >
          {isPending ? "Menyimpan..." : "Simpan Penilaian"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 border border-gray-200">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 bg-white sticky left-0 z-10 border-r min-w-[200px]">Nama Siswa</th>
              {currentIndicators.map((ind: any) => (
                <th key={ind.id} className="px-4 py-3 min-w-[150px] text-center" title={ind.description}>
                  {ind.name}
                  <p className="font-normal text-gray-400 text-[10px] lowercase capitalize-first mt-1">Skala 1-5</p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {currentStudents.length > 0 ? (
              currentStudents.map((s: any) => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 bg-white sticky left-0 z-10 border-r font-medium text-gray-900">
                    {s.studentData.fullName}
                  </td>
                  {currentIndicators.map((ind: any) => (
                    <td key={ind.id} className="px-4 py-3 text-center">
                      <select
                        value={scores[s.id]?.[ind.id] || ""}
                        onChange={(e) => handleScoreChange(s.id, ind.id, parseInt(e.target.value))}
                        className="px-2 py-1 border border-gray-300 rounded text-sm w-full"
                      >
                        <option value="">-</option>
                        <option value="1">1 - Sangat Kurang</option>
                        <option value="2">2 - Kurang</option>
                        <option value="3">3 - Cukup</option>
                        <option value="4">4 - Baik</option>
                        <option value="5">5 - Sangat Baik</option>
                      </select>
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={currentIndicators.length + 1} className="px-4 py-8 text-center text-gray-500">
                  Belum ada siswa di kelas ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
