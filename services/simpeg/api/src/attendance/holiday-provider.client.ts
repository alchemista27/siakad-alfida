export type ProviderHoliday = {
  key: string;
  date: string;
  name: string;
  kind: "national";
};

type HolidayRecord = {
  id: string;
  date: string;
  name: string;
  type: string;
  is_joint_leave: number;
  is_active: number;
  year: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dateIsValid(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

/** The provider's documented GET /api/v1/libur?tahun=YYYY response. */
export function parseApiIndonesiaHolidays(payload: unknown, year: number): ProviderHoliday[] {
  if (!Number.isInteger(year) || year < 2000 || year > 2100 || !isRecord(payload) || !Array.isArray(payload.data)) {
    throw new Error("Format data hari libur provider tidak valid.");
  }
  const result: ProviderHoliday[] = [];
  const seenDates = new Set<string>();
  const seenKeys = new Set<string>();
  for (const value of payload.data) {
    if (!isRecord(value) || typeof value.id !== "string" || !/^[A-Za-z0-9_-]{1,145}$/.test(value.id) ||
      typeof value.date !== "string" || !dateIsValid(value.date) || typeof value.name !== "string" ||
      !value.name.trim() || value.name.trim().length > 100 || typeof value.type !== "string" ||
      typeof value.year !== "number" || value.year !== Number(value.date.slice(0, 4)) ||
      ![0, 1].includes(value.is_joint_leave as number) || ![0, 1].includes(value.is_active as number)) {
      throw new Error("Baris data hari libur provider tidak valid.");
    }
    const row = value as HolidayRecord;
    if (row.year !== year) throw new Error("Tahun data hari libur provider tidak sesuai permintaan.");
    if (row.is_active === 0 || row.is_joint_leave === 1 || row.type !== "nasional") continue;
    const key = `apiindonesia:${row.id}`;
    if (seenDates.has(row.date) || seenKeys.has(key)) throw new Error("Data hari libur nasional provider duplikat.");
    seenDates.add(row.date);
    seenKeys.add(key);
    result.push({ key, date: row.date, name: row.name.trim(), kind: "national" });
  }
  return result;
}

export async function fetchApiIndonesiaHolidays(year: number, options: {
  apiKey?: string;
  fetchImplementation?: typeof fetch;
} = {}): Promise<ProviderHoliday[]> {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new Error("Tahun hari libur tidak valid.");
  const apiKey = options.apiKey ?? process.env.API_INDONESIA_API_KEY;
  if (!apiKey?.trim()) throw new Error("API_INDONESIA_API_KEY belum dikonfigurasi.");
  const fetchImplementation = options.fetchImplementation ?? fetch;
  const url = new URL("https://use.apiindonesia.id/api/v1/libur");
  url.searchParams.set("tahun", String(year));
  const response = await fetchImplementation(url, {
    headers: { "x-api-key": apiKey, accept: "application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Provider hari libur gagal (${response.status}).`);
  return parseApiIndonesiaHolidays(await response.json(), year);
}
