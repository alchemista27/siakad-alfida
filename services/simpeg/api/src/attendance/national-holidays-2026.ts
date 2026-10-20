import { utcDate } from "./workday-policy";

export const NATIONAL_HOLIDAYS_2026 = [
  { date: "2026-01-01", name: "Tahun Baru 2026 Masehi" },
  { date: "2026-01-16", name: "Isra Mikraj Nabi Muhammad SAW" },
  { date: "2026-02-17", name: "Tahun Baru Imlek 2577 Kongzili" },
  { date: "2026-03-19", name: "Hari Suci Nyepi Tahun Baru Saka 1948" },
  { date: "2026-03-21", name: "Idulfitri 1447 Hijriah" },
  { date: "2026-03-22", name: "Idulfitri 1447 Hijriah" },
  { date: "2026-04-03", name: "Wafat Yesus Kristus" },
  { date: "2026-04-05", name: "Kebangkitan Yesus Kristus (Paskah)" },
  { date: "2026-05-01", name: "Hari Buruh Internasional" },
  { date: "2026-05-14", name: "Kenaikan Yesus Kristus" },
  { date: "2026-05-27", name: "Iduladha 1447 Hijriah" },
  { date: "2026-05-31", name: "Hari Raya Waisak 2570 BE" },
  { date: "2026-06-01", name: "Hari Lahir Pancasila" },
  { date: "2026-06-16", name: "Tahun Baru Islam 1448 Hijriah" },
  { date: "2026-08-17", name: "Proklamasi Kemerdekaan" },
  { date: "2026-08-25", name: "Maulid Nabi Muhammad SAW" },
  { date: "2026-12-25", name: "Kelahiran Yesus Kristus" },
] as const;

type NationalHolidayStore = {
  holiday: {
    findFirst(input: { where: { unitId: null; date: Date } }): Promise<{ id: string } | null>;
    create(input: { data: { unitId: null; date: Date; name: string; description: string | null } }): Promise<unknown>;
    update(input: { where: { id: string }; data: { name: string; description: string | null } }): Promise<unknown>;
  };
};

export async function seedNationalHolidays2026(store: NationalHolidayStore): Promise<{ created: number; updated: number; total: number }> {
  let created = 0;
  let updated = 0;

  for (const holiday of NATIONAL_HOLIDAYS_2026) {
    const date = utcDate(holiday.date);
    const existing = await store.holiday.findFirst({ where: { unitId: null, date } });
    if (existing) {
      await store.holiday.update({
        where: { id: existing.id },
        data: { name: holiday.name, description: null },
      });
      updated += 1;
    } else {
      await store.holiday.create({
        data: { unitId: null, date, name: holiday.name, description: null },
      });
      created += 1;
    }
  }

  return { created, updated, total: NATIONAL_HOLIDAYS_2026.length };
}
