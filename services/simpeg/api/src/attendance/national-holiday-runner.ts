import type { ProviderHoliday } from "./holiday-provider.client";
import type { HolidaySyncResult } from "./national-holiday-sync";

/** Fetch and validate every target year before opening a DB transaction. */
export async function runNationalHolidaySync(
  years: number[],
  fetchYear: (year: number) => Promise<ProviderHoliday[]>,
  persist: (rows: ProviderHoliday[]) => Promise<HolidaySyncResult>,
): Promise<HolidaySyncResult> {
  const all: ProviderHoliday[] = [];
  for (const year of [...new Set(years)]) all.push(...await fetchYear(year));
  const dates = new Set<string>();
  const keys = new Set<string>();
  for (const row of all) {
    if (dates.has(row.date) || keys.has(row.key)) throw new Error("Duplikasi lintas tahun pada data hari libur.");
    dates.add(row.date);
    keys.add(row.key);
  }
  return persist(all);
}
