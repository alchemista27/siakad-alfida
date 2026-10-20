import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  applyOrganizationImport,
  buildOrganizationImportPlan,
  deterministicDepartmentMemberId,
  normalizeMemberRole,
  parseImportArguments,
  safeSlug,
} from "./import-monolith-organization";

const rawExportPath =
  "/home/alchemista/.hermes/cache/scratch/monolith-org-export.json";
const sourceVersion = "2026-10-20T23:10:00.000Z";

function rawInput() {
  const raw = JSON.parse(readFileSync(rawExportPath, "utf8")) as {
    users: Array<{ id: string; email: string }>;
  };
  return {
    ...raw,
    source: "monolith-organization",
    sourceVersion,
    canonicalAuthUserIdByEmail: Object.fromEntries(
      raw.users.map((user) => [user.email, user.id])
    ),
  };
}

function inMemoryPrisma() {
  const receipts = new Map<string, any>();
  const users = new Map<string, any>();
  const events: any[] = [];
  const key = (where: any) => {
    const compound = where.source_entity_sourceId;
    return `${compound.source}:${compound.entity}:${compound.sourceId}`;
  };
  const prisma = {
    user: {
      async findUnique({ where }: any) {
        if (where.id) return users.get(where.id) ?? null;
        for (const user of users.values()) {
          if (where.email && user.email === where.email) return user;
          if (where.username && user.username === where.username) return user;
        }
        return null;
      },
      async upsert({ where, create, update }: any) {
        const previous = users.get(where.id);
        const value = previous ? { ...previous, ...update } : create;
        users.set(where.id, value);
        return value;
      },
    },
    organizationImportReceipt: {
      async findUnique({ where }: any) {
        return receipts.get(key(where)) ?? null;
      },
      async upsert({ where, create, update }: any) {
        const previous = receipts.get(key(where));
        const value = previous ? { ...previous, ...update } : create;
        receipts.set(key(where), value);
        return value;
      },
    },
    unit: {
      async upsert({ create, update }: any) {
        return { ...(create ?? {}), ...(update ?? {}) };
      },
    },
    department: {
      async upsert({ create, update }: any) {
        return { ...(create ?? {}), ...(update ?? {}) };
      },
    },
    departmentMember: {
      async upsert({ create, update }: any) {
        return { ...(create ?? {}), ...(update ?? {}) };
      },
    },
    organizationSyncOutbox: {
      async upsert(value: any) {
        events.push(value.create);
        return value.create;
      },
    },
    async $transaction(callback: any) {
      return callback(this);
    },
  };
  return { prisma, receipts, users, events };
}

async function main() {
  assert.deepEqual(
    parseImportArguments(["--input", "catalog.json"]),
    { inputPath: "catalog.json", apply: false },
    "imports must be dry-run unless --apply is explicit"
  );
  assert.equal(normalizeMemberRole("Bendahara"), "treasurer");
  assert.equal(normalizeMemberRole(undefined), null);
  assert.equal(normalizeMemberRole("admin_bidang"), undefined);
  assert.equal(safeSlug("Bidang Kepegawaian"), "bidang-kepegawaian");

  const input = rawInput();
  const plan = buildOrganizationImportPlan(input);
  assert.equal(plan.users.length, 36, "raw users must become user candidates");
  assert.equal(plan.units.length, 9, "raw units must be preserved");
  assert.equal(plan.departments.length, 3, "raw departments must be preserved");
  assert.equal(plan.members.length, 5, "raw members must be preserved");
  assert.equal(
    plan.quarantined.length,
    0,
    "the all-email canonical map is complete"
  );
  assert.ok(
    plan.ignored.length > 0,
    "source roles must be recorded as ignored"
  );
  assert.ok(
    plan.ignored.every((note) => note.entity === "user_role"),
    "source roles must not become SIMPEG assignments"
  );
  assert.ok(
    [...plan.users, ...plan.units, ...plan.departments, ...plan.members].every(
      (candidate) => candidate.sourceVersion.toISOString() === sourceVersion
    ),
    "raw records must use the explicit immutable source version"
  );
  assert.equal(
    plan.units.find((unit) => unit.payload.name === "Kantor Pusat Yayasan")
      ?.payload.category,
    "nondik"
  );
  assert.equal(
    plan.units.find((unit) => unit.payload.name === "Pesantren Quran Alfida")
      ?.payload.category,
    "pendidikan"
  );
  assert.equal(
    plan.units.find((unit) => unit.payload.name === "Kantor Pusat Yayasan")
      ?.payload.code,
    "NONDIK-KANTOR-YAYASAN"
  );
  assert.equal(plan.departments[0].payload.code, "BIDANG-KEPEGAWAIAN");
  assert.ok(
    plan.members.every(
      (member) =>
        member.payload.id ===
        deterministicDepartmentMemberId(
          plan.source,
          member.payload.departmentId as string,
          member.payload.userId as string
        )
    ),
    "member IDs must be deterministic UUID v5-compatible identifiers"
  );
  assert.ok(
    plan.members.every((member) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        member.payload.id as string
      )
    )
  );
  assert.ok(
    plan.users.every(
      (user) =>
        !Object.prototype.hasOwnProperty.call(user.payload, "password") &&
        !Object.prototype.hasOwnProperty.call(user.payload, "passwordHash") &&
        !Object.prototype.hasOwnProperty.call(user.payload, "sessions") &&
        !Object.prototype.hasOwnProperty.call(user.payload, "roles")
    ),
    "user projections must exclude credentials, sessions, and source roles"
  );
  assert.throws(
    () => {
      const { sourceVersion: _version, ...withoutVersion } = input;
      buildOrganizationImportPlan(withoutVersion);
    },
    /sourceVersion must be a non-empty string/,
    "an immutable top-level sourceVersion is required"
  );
  const enrichedPlan = buildOrganizationImportPlan({
    source: "enriched-catalog",
    sourceVersion,
    canonicalAuthUserIdByEmail: {
      "pegawai@example.test": "00000000-0000-4000-8000-000000000901",
    },
    units: [
      {
        id: "00000000-0000-4000-8000-000000000902",
        name: "Unit Pendidikan",
        code: "UP",
        category: "pendidikan",
        updatedAt: "2026-10-20T10:00:00.000Z",
      },
    ],
    departments: [
      {
        id: "00000000-0000-4000-8000-000000000903",
        unitId: "00000000-0000-4000-8000-000000000902",
        name: "Kepegawaian",
        code: "HR",
        leaderEmail: "pegawai@example.test",
        updatedAt: "2026-10-20T10:01:00.000Z",
      },
    ],
    departmentMembers: [
      {
        id: "00000000-0000-4000-8000-000000000904",
        departmentId: "00000000-0000-4000-8000-000000000903",
        email: "pegawai@example.test",
        role: "Bendahara",
        updatedAt: "2026-10-20T10:02:00.000Z",
      },
    ],
  });
  assert.equal(enrichedPlan.units[0].payload.code, "UP");
  assert.equal(enrichedPlan.departments[0].payload.code, "HR");
  assert.equal(enrichedPlan.members[0].payload.role, "treasurer");

  const { prisma, receipts, users, events } = inMemoryPrisma();
  const originalFetch = globalThis.fetch;
  let downstreamRequests = 0;
  globalThis.fetch = (async () => {
    downstreamRequests += 1;
    return new Response(null, { status: 204 });
  }) as typeof fetch;
  try {
    const first = await applyOrganizationImport(prisma, plan);
    assert.deepEqual(first, { applied: 53, skipped: 0, quarantined: 0 });
    assert.equal(users.size, 36, "users must be upserted locally first");
    assert.equal(
      events.length,
      53,
      "every applied candidate must enqueue one event"
    );
    assert.ok(
      events
        .slice(0, 36)
        .every((event) => event.eventType === "user.projected"),
      "user projections must be enqueued before unit, department, and member events"
    );
    assert.ok(
      events.slice(36).every((event) => event.eventType !== "user.projected"),
      "non-user organization events must follow the projected users"
    );
    const outboxCount = events.length;
    const second = await applyOrganizationImport(prisma, plan);
    assert.deepEqual(second, { applied: 0, skipped: 53, quarantined: 0 });
    assert.equal(events.length, outboxCount, "a rerun must create no events");
    assert.equal(
      downstreamRequests,
      0,
      "the importer must only enqueue outbox events"
    );
    assert.equal(
      receipts.size,
      53,
      "receipts must cover users and organization rows"
    );
    assert.ok(
      [...receipts.values()].every(
        (receipt) => receipt.sourceVersion.toISOString() === sourceVersion
      ),
      "receipts must retain the explicit source version"
    );
  } finally {
    globalThis.fetch = originalFetch;
  }

  console.log("Monolith organization import contract passed");
}

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
