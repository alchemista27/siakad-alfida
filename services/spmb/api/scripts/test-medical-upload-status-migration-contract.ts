import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = fileURLToPath(new URL("..", import.meta.url));
const migrationsRoot = join(apiRoot, "prisma/migrations");

async function main() {
  const [schema, service, migrationNames] = await Promise.all([
    readFile(join(apiRoot, "prisma/schema.prisma"), "utf8"),
    readFile(join(apiRoot, "src/documents/documents.service.ts"), "utf8"),
    readdir(migrationsRoot),
  ]);

  assert.match(schema, /enum RegistrationStatus\s*\{[\s\S]*\bmedical_uploaded\b/, "Prisma schema must declare medical_uploaded");
  assert.match(service, /RegistrationStatus\.medical_uploaded/, "medical upload workflow must transition into medical_uploaded");

  const migrationSql = await Promise.all(
    migrationNames.map(async (name) => ({
      name,
      sql: await readFile(join(migrationsRoot, name, "migration.sql"), "utf8"),
    })),
  );
  assert.ok(
    migrationSql.some(({ sql }) => /ALTER TYPE "RegistrationStatus" ADD VALUE IF NOT EXISTS 'medical_uploaded';/.test(sql)),
    "a forward-only Prisma migration must add medical_uploaded to the production RegistrationStatus enum",
  );

  console.log("SPMB medical uploaded status migration contract passed");
}

void main();
