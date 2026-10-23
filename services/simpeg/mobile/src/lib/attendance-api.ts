export type AttendanceContext = {
  date: string;
  unitName: string;
  workday: { required: boolean; reason: string };
  attendance: { checkInTime: string | null; checkOutTime: string | null; status: string } | null;
};

export type AttendanceAction = "check-in" | "check-out";

export function nextAttendanceAction(today: AttendanceContext): AttendanceAction | null {
  if (!today.workday.required || today.attendance?.checkOutTime) return null;
  return today.attendance?.checkInTime ? "check-out" : "check-in";
}

async function request<T>(apiUrl: string, token: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, "content-type": "application/json", ...(init?.headers || {}) } });
  const body = await response.json().catch(() => null) as T & { message?: string | string[] } | null;
  if (!response.ok) {
    const message = Array.isArray(body?.message) ? body.message.join(" ") : body?.message;
    throw new Error(message || `Permintaan absensi gagal (${response.status}).`);
  }
  return body as T;
}

export function getTodayAttendance(apiUrl: string, token: string) {
  return request<AttendanceContext>(apiUrl, token, "/attendance/context");
}

export function submitAttendance(apiUrl: string, token: string, action: AttendanceAction, location: { latitude: number; longitude: number }) {
  return request(apiUrl, token, `/attendance/${action}`, { method: "POST", body: JSON.stringify(location) });
}
