import { validateLearningProgressInput } from "../ymq/ymq-domain";

type GroupLevel = "pra_tahsin" | "tahsin" | "tahfiz";
type Track = "pra_tahsin" | "tahsin" | "ziyadah";

export interface LearningSessionPayloadInput {
  groupId: string;
  sessionDate: string;
  notes?: string | null;
  attendance: Array<{ memberId: string; status: string; note?: string | null }>;
  progress: Array<{
    memberId: string;
    track: Track;
    sequence: number;
    iwrCurriculumUnitId: string | null;
    surahNumber: number | null;
    ayahStart: number | null;
    ayahEnd: number | null;
    note?: string | null;
  }>;
}

export type SessionValidationResult = { valid: true } | { valid: false; reason: string };

export function validateLearningSessionPayload(
  payload: LearningSessionPayloadInput,
  activeMemberIds: Set<string>,
  groupLevel: GroupLevel,
): SessionValidationResult {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(payload.sessionDate)) return { valid: false, reason: "Tanggal sesi harus YYYY-MM-DD." };
  const attendanceIds = new Set<string>();
  for (const attendance of payload.attendance) {
    if (!activeMemberIds.has(attendance.memberId)) return { valid: false, reason: "Kehadiran berisi anggota di luar roster aktif." };
    if (attendanceIds.has(attendance.memberId)) return { valid: false, reason: "Kehadiran anggota tidak boleh duplikat." };
    attendanceIds.add(attendance.memberId);
  }
  if (attendanceIds.size !== activeMemberIds.size) return { valid: false, reason: "Semua anggota roster aktif wajib memiliki kehadiran." };

  const progressKeys = new Set<string>();
  for (const progress of payload.progress) {
    if (!activeMemberIds.has(progress.memberId)) return { valid: false, reason: "Progress berisi anggota di luar roster aktif." };
    if (!isTrackAllowedForLevel(groupLevel, progress.track)) return { valid: false, reason: "Track progress tidak sesuai level kelompok." };
    const key = `${progress.memberId}:${progress.track}:${progress.sequence}`;
    if (progressKeys.has(key)) return { valid: false, reason: "Progress per anggota, track, dan sequence tidak boleh duplikat." };
    progressKeys.add(key);
    const result = validateLearningProgressInput(progress);
    if (!result.valid) return { valid: false, reason: "Progress pembelajaran tidak valid." };
  }
  return { valid: true };
}

export function isTrackAllowedForLevel(level: GroupLevel, track: Track): boolean {
  return (level === "pra_tahsin" && track === "pra_tahsin")
    || (level === "tahsin" && track === "tahsin")
    || (level === "tahfiz" && track === "ziyadah");
}
