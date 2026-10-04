import { PrismaClient, KPIDirection, KPIIndicatorType, KPIUpdateFrequency } from "@sim/database";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Mulai migrasi 113 Matriks KPI YAF PMS...");

  // Bikin program dummy untuk wadah KPI jika belum ada
  let globalProgram = await prisma.workProgram.findFirst({
    where: { title: "Indikator Mutu & Strategis Yayasan Alfida 2026" }
  });

  if (!globalProgram) {
    let dept = await prisma.department.findFirst();
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: "Yayasan Alfida",
          isActive: true
        }
      });
    }

    globalProgram = await prisma.workProgram.create({
      data: {
        departmentId: dept.id,
        title: "Indikator Mutu & Strategis Yayasan Alfida 2026",
        objective: "Mencapai standar pendidikan dan manajemen modern.",
        startDate: new Date("2026-07-01"),
        endDateRencana: new Date("2027-06-30"),
      }
    });
    console.log(`Program "${globalProgram.title}" berhasil dibuat.`);
  }

  // Load KPI JSON
  const kpisPath = path.join(__dirname, "data", "pms-kpis.json");
  const rawData = fs.readFileSync(kpisPath, "utf-8");
  const kpis = JSON.parse(rawData);

  console.log(`Ditemukan ${kpis.length} matriks KPI untuk dimigrasikan...`);

  let count = 0;
  for (const kpi of kpis) {
    await prisma.executionKPI.create({
      data: {
        programId: globalProgram.id,
        name: kpi.name,
        indicatorType: kpi.indicatorType as KPIIndicatorType,
        direction: kpi.direction as KPIDirection,
        unit: kpi.unit,
        weight: kpi.weight,
        updateFrequency: kpi.updateFrequency as KPIUpdateFrequency,
        dataSource: kpi.dataSource,
        baseline: 0,
        baselineStatus: "draft",
        target: 100, // asumsikan target awal 100 (atau sesuai file JSON asli)
      }
    });
    count++;
  }

  console.log(`✅ Berhasil memigrasikan ${count} matriks KPI ke dalam database Simalfida.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
