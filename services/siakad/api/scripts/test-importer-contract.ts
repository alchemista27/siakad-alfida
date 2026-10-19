import assert from "node:assert/strict";
import { ConflictException, ForbiddenException } from "@nestjs/common";
import type { SiakadPrincipal } from "../src/common/siakad-scope-policy";
import { ImporterService } from "../src/importer/importer.service";

function makePrisma(state: any) {
  return {
    importSourceMapping: {
      findUnique: async (args: any) => state.mappings.find((mapping: any) => {
        const key = args.where.unitId_sourceSystem_entityType_mappingVersion;
        return key && mapping.unitId === key.unitId && mapping.sourceSystem === key.sourceSystem && mapping.entityType === key.entityType && mapping.mappingVersion === key.mappingVersion;
      }) ?? null,
      findFirst: async (args: any) => state.mappings.find((mapping: any) => mapping.id === args.where.id) ?? null,
      findMany: async (args: any) => state.mappings.filter((mapping: any) => args.where.unitId.in.includes(mapping.unitId)),
      create: async (args: any) => {
        state.createCalls += 1;
        const created = { id: `mapping-${state.mappings.length + 1}`, ...args.data };
        state.mappings.push(created);
        return created;
      },
    },
  } as any;
}

async function main() {
  const state = { mappings: [] as any[], createCalls: 0 };
  const service = new ImporterService(makePrisma(state));
  const admin: SiakadPrincipal = { id: "admin-1", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-1" }] };
  const otherAdmin: SiakadPrincipal = { id: "admin-2", roles: [{ app: "siakad", role: "admin_unit", unitId: "unit-2" }] };
  const dto = { unitId: "unit-1", sourceSystem: "legacy-siakad", entityType: "student", mappingVersion: "v1", mapping: { recordKey: "external_id", fields: { fullName: "name", nisn: "nisn" } } };

  const first = await service.createMapping(admin, dto);
  assert.equal(first.idempotent, false);
  const second = await service.createMapping(admin, dto);
  assert.equal(second.idempotent, true, "the same mapping version must be idempotent");
  assert.equal(state.createCalls, 1);
  await assert.rejects(() => service.createMapping(admin, { ...dto, mapping: { ...dto.mapping, fields: { fullName: "different" } } }), ConflictException);
  await assert.rejects(() => service.createMapping(otherAdmin, dto), ForbiddenException);

  const beforeDryRunWrites = state.createCalls;
  const report = await service.dryRun(admin, {
    mappingId: first.mapping.id,
    records: [{ external_id: "legacy-1", name: "Anak Satu", nisn: "123" }, { external_id: "legacy-2", nisn: "124" }, { external_id: "legacy-1", name: "Duplikat", nisn: "125" }],
  });
  assert.equal(state.createCalls, beforeDryRunWrites, "dry-run must not write imported records or mappings");
  assert.equal(report.dryRun, true);
  assert.equal(report.writePerformed, false);
  assert.equal(report.wouldWriteCount, 0);
  assert.deepEqual(report.reconciliation, { receivedCount: 3, validCount: 1, invalidCount: 2, duplicateKeyCount: 1 });
  console.log("Importer dry-run contract passed");
}

void main();
