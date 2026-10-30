import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ForbiddenException } from "@nestjs/common";
import { UsersService } from "../src/users/users.service";

async function main() {
  const calls: unknown[] = [];
  const service = new UsersService({
    user: {
      findMany: async (args: unknown) => {
        calls.push(args);
        return [{ id: "observer-1", fullName: "Penguji Satu", email: "penguji@example.test", avatarUrl: null }];
      },
    },
  } as any);

  const candidates = await service.findObserverCandidates(
    { roles: [{ app: "spmb", role: "admin_unit", unitId: "unit-a" }] },
    "unit-a",
    "penguji",
  );

  assert.deepEqual(candidates, [{ id: "observer-1", fullName: "Penguji Satu", email: "penguji@example.test", avatarUrl: null }]);
  assert.match(JSON.stringify(calls[0]), /"observer"/, "candidate search must restrict results to eligible observer roles");
  await service.findObserverCandidates(
    { roles: [{ app: "auth", role: "super_admin" }] },
    "unit-b",
    "penguji",
  );
  await service.findObserverCandidates(
    { roles: [{ app: "auth", role: "super_admin" }] },
    "unit-b",
    "x".repeat(101),
  );
  assert.equal((calls.at(-1) as any).where.OR[0].fullName.contains.length, 100, "candidate search must bound query length");
  await assert.rejects(
    () => service.findObserverCandidates(
      { roles: [{ app: "spmb", role: "admin_unit", unitId: "unit-a" }] },
      "unit-b",
      "penguji",
    ),
    ForbiddenException,
  );

  const controller = readFileSync(resolve(import.meta.dirname, "../src/users/users.controller.ts"), "utf8");
  assert(controller.includes('@Get("observer-candidates")'), "Auth API must expose observer candidate search before the user-id route");

  console.log("Auth observer candidate search contract passed");
}

void main();
