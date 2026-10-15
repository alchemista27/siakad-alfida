import { PrismaClient as SimakinPrisma } from "../src/generated/prisma";
import { ExecutionDashboardService } from "../src/strategic/execution-dashboard/execution-dashboard.service";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

async function main() {
  console.log("=== Memulai Uji Otomatis Endpoint Ranking Biro (SIMAKIN API) ===\n");

  const envPath = path.resolve(__dirname, "../../../../.env.production.local");
  const envContent = fs.readFileSync(envPath, "utf-8");
  const simakinMatch = envContent.match(/DATABASE_URL=postgresql:\/\/[^@]+@bkoopidoln9uolhwy3zillrd:5432\/alfida_simakin\?schema=public/);
  if (!simakinMatch) {
    throw new Error("Could not find simakin DATABASE_URL in .env.production.local");
  }
  const dbUrl = simakinMatch[0].replace("DATABASE_URL=", "").replace("bkoopidoln9uolhwy3zillrd", "localhost");

  const prisma = new SimakinPrisma({ datasources: { db: { url: dbUrl } } });
  const service = new ExecutionDashboardService(prisma as any);

  let passed = 0;
  let failed = 0;

  const dept1Id = randomUUID();
  const dept2Id = randomUUID();
  const prog1Id = randomUUID();
  const prog2Id = randomUUID();

  try {
    // 1. Setup sample testing data
    // Biro A: 2 KPI Hijau
    await prisma.department.create({
      data: {
        id: dept1Id,
        name: "Biro Mutu & Kurikulum (Testing)",
        workPrograms: {
          create: {
            id: prog1Id,
            title: "Program Standardisasi Mutu",
            status: "ongoing",
            kpis: {
              create: [
                {
                  id: randomUUID(),
                  name: "Sertifikasi Guru",
                  indicatorType: "output",
                  target: 100,
                  realization: 100, // 100% -> Hijau
                  unit: "persen",
                  direction: "higher_is_better",
                },
                {
                  id: randomUUID(),
                  name: "Kelulusan Siswa Tahfidz",
                  indicatorType: "output",
                  target: 50,
                  realization: 48, // 96% -> Hijau
                  unit: "santri",
                  direction: "higher_is_better",
                },
              ],
            },
          },
        },
      },
    });

    // Biro B: 1 KPI Hijau, 1 KPI Merah
    await prisma.department.create({
      data: {
        id: dept2Id,
        name: "Biro Sarana Prasarana (Testing)",
        workPrograms: {
          create: {
            id: prog2Id,
            title: "Program Pemeliharaan Gedung",
            status: "ongoing",
            kpis: {
              create: [
                {
                  id: randomUUID(),
                  name: "Peremajaan AC Kelas",
                  indicatorType: "output",
                  target: 20,
                  realization: 20, // 100% -> Hijau
                  unit: "unit",
                  direction: "higher_is_better",
                },
                {
                  id: randomUUID(),
                  name: "Insiden Kerusakan Listrik",
                  indicatorType: "output",
                  target: 0,
                  realization: 5, // 0 target, 5 real -> Merah
                  unit: "kejadian",
                  direction: "lower_is_better",
                },
              ],
            },
          },
        },
      },
    });

    // 2. Test getBureauRankings
    const rankings = await service.getBureauRankings();

    if (Array.isArray(rankings) && rankings.length >= 2) {
      console.log(`[PASS] getBureauRankings() mengembalikan ${rankings.length} biro`);
      passed++;
    } else {
      throw new Error("getBureauRankings() gagal mengembalikan array yang cukup");
    }

    const biroA = rankings.find((r) => r.departmentId === dept1Id);
    const biroB = rankings.find((r) => r.departmentId === dept2Id);

    if (biroA && biroA.greenCount === 2 && biroB && biroB.greenCount === 1) {
      console.log(`[PASS] Penghitungan KPI Hijau akurat: Biro A = ${biroA.greenCount}, Biro B = ${biroB.greenCount}`);
      passed++;
    } else {
      throw new Error("Penghitungan greenCount tidak akurat");
    }

    // Verifikasi urutan: Biro A (2 hijau) harus berada di atas Biro B (1 hijau)
    const indexA = rankings.findIndex((r) => r.departmentId === dept1Id);
    const indexB = rankings.findIndex((r) => r.departmentId === dept2Id);

    if (indexA < indexB) {
      console.log(`[PASS] Urutan peringkat benar: Biro A (peringkat ${indexA + 1}) di atas Biro B (peringkat ${indexB + 1})`);
      passed++;
    } else {
      throw new Error(`Urutan salah: indexA (${indexA}) >= indexB (${indexB})`);
    }
  } catch (err: any) {
    console.error("[FAIL] Error saat pengujian:", err.message);
    failed++;
  } finally {
    // Cleanup sample data
    await prisma.executionKPI.deleteMany({
      where: { programId: { in: [prog1Id, prog2Id] } },
    });
    await prisma.workProgram.deleteMany({
      where: { id: { in: [prog1Id, prog2Id] } },
    });
    await prisma.department.deleteMany({
      where: { id: { in: [dept1Id, dept2Id] } },
    });
    await prisma.$disconnect();
  }

  console.log(`\n=== Hasil Akhir Uji Ranking Biro: ${passed} LULUS, ${failed} GAGAL ===`);
  if (failed > 0) process.exit(1);
}

main().catch(console.error);
