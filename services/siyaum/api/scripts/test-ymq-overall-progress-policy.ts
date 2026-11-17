import assert from "node:assert/strict";
import { BadRequestException } from "@nestjs/common";
import { classifyOverallProgress, parseOverallProgressQuery } from "../src/dashboard/overall-progress.policy";
import { canReadOverallProgressDashboard } from "../src/ymq/ymq-access.policy";

const uuid = "11111111-1111-4111-8111-111111111111";
const principal = (role: string, app = "siyaum") => ({ id: role, roles: [{ app, role }] });

assert.deepEqual(parseOverallProgressQuery({}), {});
assert.deepEqual(parseOverallProgressQuery({ unitId: uuid }), { unitId: uuid });
assert.throws(() => parseOverallProgressQuery({ unitId: "not-a-uuid" }), BadRequestException);
assert.equal(classifyOverallProgress({ track: "pra_tahsin", iwrLevel: "iwr_1" }), "iwr_1");
assert.equal(classifyOverallProgress({ track: "pra_tahsin", iwrLevel: "iwr_2" }), "iwr_2");
assert.equal(classifyOverallProgress({ track: "tahsin", iwrLevel: null }), "tahsin");
assert.equal(classifyOverallProgress({ track: "ziyadah", iwrLevel: null }), null);
assert.equal(canReadOverallProgressDashboard(principal("admin_ymq")), true);
assert.equal(canReadOverallProgressDashboard(principal("pengawas")), true);
assert.equal(canReadOverallProgressDashboard(principal("pimpinan")), true);
assert.equal(canReadOverallProgressDashboard(principal("pembina_ymq")), false);
assert.equal(canReadOverallProgressDashboard(principal("super_admin", "auth")), true);

console.log("SIYAUM overall progress policy contract passed");
