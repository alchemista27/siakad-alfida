import { readFile } from "node:fs/promises";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function run() {
  const schema = await readFile(new URL("../prisma/schema.prisma", import.meta.url), "utf8");
  const migration = await readFile(
    new URL("../prisma/migrations/20261115_020000_add_dapodik_adaptive_fields/migration.sql", import.meta.url),
    "utf8",
  );

  for (const enumName of ["EducationLevel", "TkGroup", "ResidenceStatus", "ImmunizationStatus"]) {
    assert(new RegExp(`enum\\s+${enumName}\\s*\\{`).test(schema), `Prisma enum ${enumName} must exist`);
    assert(migration.includes(`CREATE TYPE "${enumName}"`), `migration must create ${enumName}`);
  }

  for (const field of ["educationLevel", "tkGroup"]) {
    assert(new RegExp(`${field}\\s+\\w+\\?`).test(schema), `AdmissionPeriod.${field} must be nullable for legacy periods`);
  }

  const fields = [
    "nik",
    "birthCertificateNumber",
    "familyCardNumber",
    "streetAddress",
    "rt",
    "rw",
    "hamlet",
    "village",
    "subdistrict",
    "city",
    "province",
    "postalCode",
    "residenceStatus",
    "specialNeeds",
    "pipEligible",
    "kipNumber",
    "previousSchoolName",
    "previousSchoolNpsn",
    "graduationDocumentNumber",
    "graduationYear",
    "heightCm",
    "weightKg",
    "headCircumferenceCm",
    "immunizationStatus",
  ];

  for (const field of fields) {
    assert(new RegExp(`${field}\\s+\\w+\\?`).test(schema), `StudentData.${field} must be nullable for legacy rows`);
  }

  assert(!/ADD COLUMN[^;]*(?:education_level|nik)[^;]*NOT NULL/i.test(migration), "migration must not add Dapodik columns as NOT NULL");
  assert(migration.includes('CREATE INDEX "student_data_nik_idx"'), "migration must add a NIK lookup index");
  assert(migration.includes('CREATE INDEX "student_data_previous_school_npsn_idx"'), "migration must add a previous-school NPSN lookup index");

  console.log("SPMB Dapodik migration contract passed");
}

void run().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
