"use client";

export interface ObserverCandidateItem {
  id: string;
  registrationNumber: string;
  status: string;
  guardianName: string;
  guardianPhone: string;
  studentData: {
    fullName: string;
    gender: string;
    birthDate: string;
    nisn: string | null;
  } | null;
  observationBooking?: {
    observationSchedule: {
      date: string;
      startTime: string;
      endTime: string;
    };
  } | null;
  observationResult: {
    score: number;
    rank: number | null;
    notes: string | null;
  } | null;
}

export function ObserverWorklist({
  candidates,
  onSelectCandidate,
}: {
  candidates: ObserverCandidateItem[];
  onSelectCandidate: (candidate: ObserverCandidateItem) => void;
}) {
  if (candidates.length === 0) {
    return (
      <div className="bg-white border border-[#E3E8E7] rounded-lg p-8 text-center text-xs text-gray-500">
        Belum ada kandidat yang dijadwalkan untuk observasi pada gelombang ini.
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E3E8E7] rounded-lg overflow-hidden">
      <table className="w-full text-left text-xs">
        <thead className="bg-[#F7F8F8] border-b border-[#E3E8E7] text-[11px] uppercase text-gray-500">
          <tr>
            <th className="py-3 px-4">No. Registrasi</th>
            <th className="py-3 px-4">Calon Murid</th>
            <th className="py-3 px-4">Jadwal Sesi</th>
            <th className="py-3 px-4 text-center">Skor</th>
            <th className="py-3 px-4">Catatan</th>
            <th className="py-3 px-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E3E8E7]">
          {candidates.map((candidate) => (
            <tr key={candidate.id}>
              <td className="py-3 px-4 font-mono font-semibold">{candidate.registrationNumber}</td>
              <td className="py-3 px-4">
                <p className="font-semibold text-[#454545]">{candidate.studentData?.fullName || "Calon Murid"}</p>
                <p className="text-[11px] text-gray-500">Wali: {candidate.guardianName}</p>
              </td>
              <td className="py-3 px-4 text-gray-600">
                {candidate.observationBooking?.observationSchedule
                  ? `${new Date(candidate.observationBooking.observationSchedule.date).toLocaleDateString("id-ID")} (${candidate.observationBooking.observationSchedule.startTime}–${candidate.observationBooking.observationSchedule.endTime})`
                  : "Belum pilih sesi"}
              </td>
              <td className="py-3 px-4 text-center font-bold text-[#0f7f6d]">
                {candidate.observationResult ? candidate.observationResult.score : "-"}
              </td>
              <td className="py-3 px-4 text-gray-600">
                {candidate.observationResult?.notes || "-"}
              </td>
              <td className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={() => onSelectCandidate(candidate)}
                  className="px-3 py-1.5 rounded bg-[#0f7f6d] text-white font-semibold hover:bg-[#0b6355]"
                >
                  {candidate.observationResult ? "Edit Nilai" : "Input Nilai"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
