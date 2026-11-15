import { readFile } from "node:fs/promises";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const source = await readFile(new URL("../src/components/parent/student-registration-form.tsx", import.meta.url), "utf8");
  for (const label of ["NIK Murid", "Nomor Akta Kelahiran", "Nomor Kartu Keluarga", "Data Kependudukan & Domisili", "RT", "RW", "Kelurahan/Desa", "Kode Pos", "Layak PIP", "Nomor KIP"]) {
    assert(source.includes(label), `student form must render ${label}`);
  }
  assert(source.includes("registration.period.educationLevel"), "student form must branch from configured period level");
  assert(source.includes("buildStudentSubmissionPayload(form, level)"), "student form must omit TK-only data before shared validation for non-TK levels");
  assert(source.includes("Data Sekolah Asal & Kelulusan"), "student form must render prior-school section for SMP/SMA");
  assert(!source.toLowerCase().includes("calistung"), "student form must not introduce calistung selection fields");

  console.log("SPMB adaptive student form UI contract passed");
}

void run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
