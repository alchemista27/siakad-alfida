import assert from "node:assert/strict";
import { DashboardService } from "../src/dashboard/dashboard.service";

const unitA = "11111111-1111-4111-8111-111111111111";
const unitB = "22222222-2222-4222-8222-222222222222";
const users = [
  { id: "a", userId: "a", fullName: "Ahmad", unitId: unitA, unitName: "Unit A" },
  { id: "b", userId: "b", fullName: "Budi", unitId: unitA, unitName: "Unit A" },
  { id: "c", userId: "c", fullName: "Citra", unitId: unitB, unitName: "Unit B" },
  { id: "d", userId: "d", fullName: "Dina", unitId: unitB, unitName: "Unit B" },
  { id: "e", userId: "e", fullName: "Eka", unitId: unitB, unitName: "Unit B" },
];

const roster = users.map((user, index) => ({ id: `member-${user.userId}`, userId: user.userId, leftAt: null, user: { ...user, isActive: true } }));
const progress = [
  { id: "a-old", memberId: "member-a", track: "pra_tahsin", iwrCurriculumUnitId: "iwr-1", surahNumber: null, ayahStart: null, ayahEnd: null, createdAt: new Date("2026-01-01"), session: { sessionDate: new Date("2026-01-01") }, iwrCurriculumUnit: { iwrLevel: "iwr_1" }, member: { userId: "a" } },
  { id: "a-new", memberId: "member-a", track: "pra_tahsin", iwrCurriculumUnitId: "iwr-2", surahNumber: null, ayahStart: null, ayahEnd: null, createdAt: new Date("2026-02-01"), session: { sessionDate: new Date("2026-02-01") }, iwrCurriculumUnit: { iwrLevel: "iwr_1" }, member: { userId: "a" } },
  { id: "b", memberId: "member-b", track: "pra_tahsin", iwrCurriculumUnitId: "iwr-3", surahNumber: null, ayahStart: null, ayahEnd: null, createdAt: new Date("2026-02-02"), session: { sessionDate: new Date("2026-02-02") }, iwrCurriculumUnit: { iwrLevel: "iwr_2" }, member: { userId: "b" } },
  { id: "c-old", memberId: "member-c", track: "tahsin", iwrCurriculumUnitId: null, surahNumber: 2, ayahStart: 1, ayahEnd: 5, createdAt: new Date("2026-01-10"), session: { sessionDate: new Date("2026-01-10") }, iwrCurriculumUnit: null, member: { userId: "c" } },
  { id: "c-repeat", memberId: "member-c", track: "tahsin", iwrCurriculumUnitId: null, surahNumber: 2, ayahStart: 1, ayahEnd: 5, createdAt: new Date("2026-02-10"), session: { sessionDate: new Date("2026-02-10") }, iwrCurriculumUnit: null, member: { userId: "c" } },
  { id: "c-new", memberId: "member-c", track: "tahsin", iwrCurriculumUnitId: null, surahNumber: 2, ayahStart: 6, ayahEnd: 10, createdAt: new Date("2026-03-10"), session: { sessionDate: new Date("2026-03-10") }, iwrCurriculumUnit: null, member: { userId: "c" } },
  { id: "e", memberId: "member-e", track: "ziyadah", iwrCurriculumUnitId: null, surahNumber: null, ayahStart: null, ayahEnd: null, createdAt: new Date("2026-02-05"), session: { sessionDate: new Date("2026-02-05") }, iwrCurriculumUnit: null, member: { userId: "e" } },
];

let setoranWhere: any;
const prisma = {
  ymqMember: { findMany: async () => roster },
  ymqLearningProgress: { findMany: async () => progress },
  ymqSetoran: {
    groupBy: async (args: any) => {
      setoranWhere = args.where;
      const selected = new Set(args.where.userId.in);
      return [
        { userId: "a", _sum: { jumlahHalaman: 5 }, _max: { date: new Date("2026-03-01") } },
        { userId: "c", _sum: { jumlahHalaman: 10 }, _max: { date: new Date("2026-03-11") } },
      ].filter((row) => selected.has(row.userId));
    },
  },
};
const admin = { id: "admin", roles: [{ app: "siyaum", role: "admin_ymq" }] };

async function main() {
  const service = new DashboardService(prisma as any);
  const report = await service.overallProgress({}, admin);
  assert.equal(report.roster.activeParticipants, 5);
  assert.equal(report.roster.unclassifiedParticipantCount, 2);
  assert.equal(report.progressPie.find((row) => row.key === "iwr_1")?.participants, 1);
  assert.equal(report.progressPie.find((row) => row.key === "iwr_2")?.participants, 1);
  assert.equal(report.progressPie.find((row) => row.key === "tahsin")?.participants, 1);
  assert.equal(report.categoryRankings.find((row) => row.key === "iwr_1")?.rankings[0]?.metricValue, 2);
  assert.equal(report.categoryRankings.find((row) => row.key === "tahsin")?.rankings[0]?.metricValue, 2);
  assert.equal(report.hafalan.totalVerifiedPages, 15);
  assert.equal(report.hafalan.averageVerifiedPages, 3);
  assert.equal(report.hafalan.rankings[0]?.userId, "c");
  assert.equal(report.hafalan.rankings[0]?.verifiedPages, 10);
  assert.deepEqual(report.availableUnits.map((unit) => unit.name), ["Unit A", "Unit B"]);
  assert.deepEqual(setoranWhere, { userId: { in: ["a", "b", "c", "d", "e"] }, jenis: "ziyadah", statusVerifikasi: "verified" });

  const unitReport = await service.overallProgress({ unitId: unitA }, admin);
  assert.equal(unitReport.roster.activeParticipants, 2);
  assert.equal(unitReport.roster.unclassifiedParticipantCount, 0);
  assert.equal(unitReport.hafalan.averageVerifiedPages, 2.5);
  assert.deepEqual(unitReport.unitProgress.map((row) => row.unitName), ["Unit A"]);
  await assert.rejects(
    () => service.overallProgress({}, { id: "pembina", roles: [{ app: "siyaum", role: "pembina_ymq" }] }),
    /Dashboard pencapaian/,
  );

  console.log("SIYAUM overall progress dashboard contract passed");
}

void main();
