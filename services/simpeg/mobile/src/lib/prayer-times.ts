import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from "adhan";

export type PrayerKey = "subuh" | "zuhur" | "asar" | "magrib" | "isya";
export type PrayerSlot = { key: PrayerKey; label: string; at: Date };
export type PrayerCoordinates = { latitude: number; longitude: number };
export const PRAYER_METHOD = "Muslim World League (perkiraan, bukan jadwal resmi Kemenag)";

/** Local astronomical estimate, not an official Indonesian prayer timetable. */
export function prayerTimesFor(location: PrayerCoordinates, date: Date): PrayerSlot[] {
  const { latitude, longitude } = location;
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    throw new Error("Koordinat jadwal salat tidak valid.");
  }
  if (!Number.isFinite(date.getTime())) throw new Error("Tanggal jadwal salat tidak valid.");

  const parameters = CalculationMethod.MuslimWorldLeague();
  parameters.madhab = Madhab.Shafi;
  const times = new PrayerTimes(new Coordinates(latitude, longitude), date, parameters);
  const slots: PrayerSlot[] = [
    { key: "subuh", label: "Subuh", at: times.fajr },
    { key: "zuhur", label: "Zuhur", at: times.dhuhr },
    { key: "asar", label: "Asar", at: times.asr },
    { key: "magrib", label: "Magrib", at: times.maghrib },
    { key: "isya", label: "Isya", at: times.isha },
  ];
  if (slots.some(slot => !Number.isFinite(slot.at.getTime()))) {
    throw new Error("Jadwal salat tidak tersedia di koordinat ini.");
  }
  return slots;
}
