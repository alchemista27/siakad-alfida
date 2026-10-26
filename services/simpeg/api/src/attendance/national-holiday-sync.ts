import type { ProviderHoliday } from "./holiday-provider.client";

export type HolidayRow = {
  id: string;
  unitId: string | null;
  date: Date;
  name: string;
  source: string;
  providerKey: string | null;
};

type HolidayStore = {
  holiday: {
    findFirst(input: { where: { unitId?: null; date?: Date; providerKey?: string } }): Promise<HolidayRow | null>;
    create(input: { data: {
      unitId: null; date: Date; name: string; description: null;
      source: "provider"; providerKey: string; providerSyncedAt: Date;
    } }): Promise<unknown>;
    updateMany(input: {
      where: { id: string; source: "provider"; providerKey: string };
      data: { name: string; providerSyncedAt: Date };
    }): Promise<{ count: number }>;
  };
};

export type HolidaySyncResult = {
  created: number;
  updated: number;
  unchanged: number;
  conflicts: number;
  total: number;
};

/** Only the verified national feed may create global effective holidays. */
export async function syncNationalHolidays(
  store: HolidayStore,
  holidays: ProviderHoliday[],
  now = new Date(),
): Promise<HolidaySyncResult> {
  const result: HolidaySyncResult = { created: 0, updated: 0, unchanged: 0, conflicts: 0, total: holidays.length };
  const dates = new Set<string>();
  const keys = new Set<string>();
  for (const holiday of holidays) {
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(holiday.date) ? new Date(`${holiday.date}T00:00:00.000Z`) : new Date(NaN);
    if (holiday.kind !== "national" || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== holiday.date ||
      !holiday.key.trim() || !holiday.name.trim() || holiday.name.length > 100 || dates.has(holiday.date) || keys.has(holiday.key)) {
      throw new Error("Data hari libur nasional tidak valid.");
    }
    dates.add(holiday.date);
    keys.add(holiday.key);
  }

  for (const holiday of holidays) {
    const date = new Date(`${holiday.date}T00:00:00.000Z`);
    const existing = await store.holiday.findFirst({ where: { unitId: null, date } });
    if (existing) {
      if (existing.source !== "provider" || existing.providerKey !== holiday.key) {
        result.conflicts++;
      } else if (existing.name === holiday.name) {
        result.unchanged++;
      } else {
        const updated = await store.holiday.updateMany({
          where: { id: existing.id, source: "provider", providerKey: holiday.key },
          data: { name: holiday.name, providerSyncedAt: now },
        });
        if (updated.count === 1) result.updated++;
        else result.conflicts++;
      }
      continue;
    }
    const duplicateKey = await store.holiday.findFirst({ where: { providerKey: holiday.key } });
    if (duplicateKey) { result.conflicts++; continue; }
    // The CLI serializes provider writers with a PostgreSQL advisory lock.
    // A unique violation inside a PostgreSQL transaction aborts that transaction;
    // never try to query again from a catch block within the same transaction.
    await store.holiday.create({ data: {
      unitId: null, date, name: holiday.name, description: null,
      source: "provider", providerKey: holiday.key, providerSyncedAt: now,
    } });
    const saved = await store.holiday.findFirst({ where: { unitId: null, date } });
    if (!saved || saved.providerKey !== holiday.key) throw new Error("Hari libur gagal diverifikasi setelah sinkronisasi.");
    result.created++;
  }
  return result;
}
