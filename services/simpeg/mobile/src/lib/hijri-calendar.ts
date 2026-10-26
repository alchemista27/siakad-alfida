import { CalendarDate, fromDate, getDayOfWeek, GregorianCalendar, IslamicUmalquraCalendar, toCalendar, toCalendarDate } from "@internationalized/date";

const HIJRI = new IslamicUmalquraCalendar();
const GREGORIAN = new GregorianCalendar();
const MONTHS = ["Muharam", "Safar", "Rabiulawal", "Rabiulakhir", "Jumadilawal", "Jumadilakhir", "Rajab", "Syakban", "Ramadan", "Syawal", "Zulkaidah", "Zulhijah"] as const;

export type HijriCell = { key: string; hijri: CalendarDate; gregorian: CalendarDate; weekday: number; inMonth: boolean };

/** Convert an instant using the caller's explicitly supplied civil time zone. */
export function hijriAt(instant: Date, timeZone: string) {
  if (!Number.isFinite(instant.getTime())) throw new Error("Tanggal kalender tidak valid.");
  if (!timeZone?.trim()) throw new Error("Zona waktu kalender tidak tersedia.");
  let result: CalendarDate;
  try {
    // Validate even when the library would take a local-zone fast path.
    new Intl.DateTimeFormat("en-US", { timeZone });
    result = toCalendar(toCalendarDate(fromDate(instant, timeZone)), HIJRI);
  } catch {
    throw new Error("Zona waktu kalender tidak valid.");
  }
  // The library silently falls back to tabular civil dates outside its Umm al-Qura table.
  if (result.year < 1300 || result.year >= 1600) {
    throw new Error("Kalender Umm al-Qura tidak tersedia untuk tanggal ini.");
  }
  return result;
}

export function hijriMonth(date: CalendarDate): { title: string; daysInMonth: number; cells: HijriCell[] } {
  if (date.calendar.identifier !== HIJRI.identifier || date.year < 1300 || date.year >= 1600) {
    throw new Error("Kalender Umm al-Qura tidak tersedia untuk tanggal ini.");
  }
  const first = new CalendarDate(HIJRI, date.year, date.month, 1);
  const daysInMonth = HIJRI.getDaysInMonth(first);
  const leading = getDayOfWeek(first, "id-ID", "sun");
  const count = Math.ceil((leading + daysInMonth) / 7) * 7;
  const cells = Array.from({ length: count }, (_, index): HijriCell => {
    const hijri = first.add({ days: index - leading });
    const gregorian = toCalendar(hijri, GREGORIAN);
    return {
      key: `${gregorian.year}-${gregorian.month}-${gregorian.day}`,
      hijri, gregorian, weekday: index % 7,
      inMonth: hijri.year === first.year && hijri.month === first.month,
    };
  });
  return { title: `${MONTHS[first.month - 1]} ${first.year} H`, daysInMonth, cells };
}
