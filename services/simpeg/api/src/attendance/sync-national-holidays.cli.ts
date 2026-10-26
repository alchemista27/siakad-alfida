import "dotenv/config";
import { PrismaClient } from "../generated/prisma";
import { fetchApiIndonesiaHolidays } from "./holiday-provider.client";
import { runNationalHolidaySync } from "./national-holiday-runner";
import { syncNationalHolidays } from "./national-holiday-sync";

async function main() {
  if (!process.env.API_INDONESIA_API_KEY?.trim()) throw new Error("API_INDONESIA_API_KEY belum dikonfigurasi.");
  const year = Number(new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", year: "numeric" }).format(new Date()));
  const prisma = new PrismaClient();
  try {
    const result = await runNationalHolidaySync([year, year + 1], fetchApiIndonesiaHolidays, async (holidays) =>
      prisma.$transaction(async (tx) => {
        const lock = await tx.$queryRaw<Array<{ acquired: boolean }>>`
          SELECT pg_try_advisory_xact_lock(7063081462::bigint) AS acquired
        `;
        if (!lock[0]?.acquired) throw new Error("Sinkronisasi hari libur sedang berjalan di instance lain.");
        return syncNationalHolidays(tx as unknown as Parameters<typeof syncNationalHolidays>[0], holidays);
      }, { timeout: 120_000 }),
    );
    console.log("National holiday sync:", JSON.stringify(result));
    if (result.conflicts > 0) process.exitCode = 2;
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((error: unknown) => {
  // Do not log provider credentials or connection strings from transport exceptions.
  console.error("Sinkronisasi hari libur gagal:", error instanceof Error ? error.name : "UnknownError");
  process.exitCode = 1;
});
