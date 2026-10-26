import type { ValidatedLocation } from "./location-policy";

export type WorkSchedule = {
  startTime: string | null;
  lateGraceMinutes: number | null;
  endTime: string | null;
  overtimeStartTime: string | null;
  timezone?: string;
};
export type AttendanceRecord = {
  date?: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status?: string;
  overtimeMinutes?: number;
  workScheduleSnapshot?: WorkSchedule | null;
};
export type AttendanceContext = {
  date: string;
  unitName: string;
  workday: { required: boolean; reason: string };
  workSchedule?: WorkSchedule | null;
  config?: { radiusMeters: number } | null;
  attendance: AttendanceRecord | null;
  /** Only displayed when supplied by the server; never inferred from device history. */
  previousAttendance?: AttendanceRecord | null;
};

export type AttendanceAction = "check-in" | "check-out";

export function overtimeStatus(today: AttendanceContext): string {
  if (today.attendance?.checkOutTime) return `Lembur ${today.attendance.overtimeMinutes ?? 0} menit`;
  if (today.attendance?.checkInTime) return "Lembur belum dihitung—clock out hari ini.";
  if (today.previousAttendance?.checkInTime && !today.previousAttendance.checkOutTime &&
      today.previousAttendance.date && today.previousAttendance.date < today.date) {
    return "Lupa clock out—lembur 0 menit.";
  }
  return "Lembur 0 menit.";
}

export function nextAttendanceAction(today: AttendanceContext): AttendanceAction | null {
  if (!today.workday.required) return null;
  if (today.attendance?.date && today.attendance.date.slice(0, 10) !== today.date) return "check-in";
  if (today.attendance?.checkOutTime) return null;
  return today.attendance?.checkInTime ? "check-out" : "check-in";
}

export class AttendanceApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = "AttendanceApiError"; }
}

async function request<T>(apiUrl: string, token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, "content-type": "application/json", ...(init?.headers || {}) } });
  const body = await response.json().catch(() => null) as T & { message?: string | string[] } | null;
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
    throw new AttendanceApiError(message || `Permintaan absensi gagal (${response.status}).`, response.status);
  }
  return body as T;
}

export async function getTodayAttendance(apiUrl: string, token: string): Promise<AttendanceContext> {
  const today = await request<AttendanceContext>(apiUrl, token, "/attendance/context");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today.date)) return today;
  const previous = new Date(`${today.date}T00:00:00.000Z`);
  if (!Number.isFinite(previous.getTime())) return today;
  previous.setUTCDate(previous.getUTCDate() - 1);
  const yesterday = previous.toISOString().slice(0, 10);
  const [year, month] = yesterday.split("-");
  const history = await request<AttendanceRecord[]>(apiUrl, token, `/attendance/my-history?month=${Number(month)}&year=${year}`);
  if (!Array.isArray(history)) throw new Error("Riwayat absensi tidak valid. Coba lagi.");
  const missed = history.find(row => row.date?.slice(0, 10) === yesterday && row.checkInTime && !row.checkOutTime);
  return { ...today, previousAttendance: missed ? { ...missed, date: yesterday } : null };
}

export function submitAttendance(apiUrl: string, token: string, action: AttendanceAction, location: Omit<ValidatedLocation, "mockStatus">) {
  return request(apiUrl, token, `/attendance/${action}`, { method: "POST", body: JSON.stringify(location) });
}
