import { PrismaClient } from "../src/generated/prisma";

const units = [
  {
    id: "0f3505db-ba0b-48e3-a500-2de9790bdd63",
    name: "TK Islam Terpadu Auladuna 1",
    slug: "tk-auladuna-1",
    quota: 50,
    fee: 250000,
  },
  {
    id: "9fe99902-40e0-48dd-9275-d73531584365",
    name: "TK Islam Terpadu Auladuna 2",
    slug: "tk-auladuna-2",
    quota: 50,
    fee: 250000,
  },
  {
    id: "dcaa14b2-b20c-416a-ba90-9367016ce295",
    name: "SD Islam Terpadu Iqra 1",
    slug: "sd-iqra-1",
    quota: 120,
    fee: 300000,
  },
  {
    id: "c09fb430-b5d3-4ae2-a6cc-2220430da453",
    name: "SD Islam Terpadu Iqra 2",
    slug: "sd-iqra-2",
    quota: 120,
    fee: 300000,
  },
  {
    id: "5edd8be0-86ac-406b-b23c-418b3e387528",
    name: "SD Islam Terpadu Iqra 3",
    slug: "sd-iqra-3",
    quota: 120,
    fee: 300000,
  },
  {
    id: "a09edaf4-c656-4632-abf1-4c0a25150c98",
    name: "SMP Islam Terpadu Iqra",
    slug: "smp-iqra",
    quota: 150,
    fee: 350000,
  },
  {
    id: "28225003-d1d3-4276-901c-f9a42a7cac69",
    name: "SMA Islam Terpadu Iqra",
    slug: "sma-iqra",
    quota: 120,
    fee: 350000,
  },
  {
    id: "18d0d36c-aea5-4ba6-a89b-320f9a4f240d",
    name: "Pesantren Quran Alfida",
    slug: "pesantren-alfida",
    quota: 80,
    fee: 350000,
  },
];

async function seedPeriods() {
  console.log("=== Menginisialisasi Periode Pendaftaran SPMB 2026/2027 ===");

  const prisma = new PrismaClient({
    datasources: process.env.DATABASE_URL
      ? { db: { url: process.env.DATABASE_URL } }
      : undefined,
  });

  try {
    for (const u of units) {
      await prisma.admissionPeriod.upsert({
        where: {
          unitId_label: {
            unitId: u.id,
            label: "2026/2027",
          },
        },
        update: {
          unitName: u.name,
          unitSlug: u.slug,
          isOpen: true,
          quota: u.quota,
          fee: u.fee,
          bankName: "Bank Syariah Indonesia (BSI)",
          bankNumber: "7123456789",
          bankHolder: "Yayasan Al-Fida PPDB",
        },
        create: {
          unitId: u.id,
          unitName: u.name,
          unitSlug: u.slug,
          label: "2026/2027",
          isOpen: true,
          quota: u.quota,
          fee: u.fee,
          bankName: "Bank Syariah Indonesia (BSI)",
          bankNumber: "7123456789",
          bankHolder: "Yayasan Al-Fida PPDB",
        },
      });
      console.log(`Periode pendaftaran aktif: ${u.name} (2026/2027) - Kuota: ${u.quota}`);
    }

    console.log("Inisialisasi periode pendaftaran SPMB selesai!");
  } catch (error) {
    console.error("Gagal melakukan seeding periode SPMB:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedPeriods();
