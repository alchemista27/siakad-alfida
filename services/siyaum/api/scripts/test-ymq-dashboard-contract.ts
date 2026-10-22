import assert from "node:assert/strict";
import { canReadExecutiveDashboard } from "../src/ymq/ymq-access.policy";
import { parseDashboardQuery, classifyLatestProgress } from "../src/dashboard/dashboard.policy";
import { rankYmqParticipants } from "../src/dashboard/dashboard-ranking.policy";

assert.throws(() => parseDashboardQuery({ from: "2026-11-01", to: "2026-10-01" }));
assert.deepEqual(parseDashboardQuery({ from: "2026-10-01", to: "2026-10-31", unitId: "11111111-1111-4111-8111-111111111111" }).unitId, "11111111-1111-4111-8111-111111111111");
assert.equal(canReadExecutiveDashboard({ id: "p", roles: [{ app: "siyaum", role: "pimpinan" }] }), true);
assert.equal(canReadExecutiveDashboard({ id: "p", roles: [{ app: "siyaum", role: "peserta" }] }), false);
assert.equal(classifyLatestProgress({ track: "pra_tahsin", iwrLevel: "iwr_1" }), "iwr_1");
assert.equal(classifyLatestProgress({ track: "pra_tahsin", iwrLevel: "iwr_2" }), "iwr_2");
assert.equal(classifyLatestProgress({ track: "tahsin", iwrLevel: null }), "quran");
assert.equal(classifyLatestProgress(null), null);
const ranking = rankYmqParticipants(Array.from({ length: 25 }, (_, index) => ({
  userId: `${String(index).padStart(2, "0")}-user`,
  fullName: index === 0 ? "Zain" : index === 1 ? "Ahmad" : `Peserta ${index}`,
  attendanceRate: 90,
  activeWeekRate: 80,
  curriculumCoverageRate: 70,
})));
assert.equal(ranking.length, 20);
assert.equal(ranking[0].fullName, "Ahmad");
assert.equal(ranking[0].rankingScore, 82.5);

console.log("SIYAUM YMQ dashboard contract passed");
