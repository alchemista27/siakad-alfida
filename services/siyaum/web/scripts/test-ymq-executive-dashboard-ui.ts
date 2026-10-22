import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => {
  const target = path.join(root, relativePath);
  assert.ok(existsSync(target), `Expected ${relativePath} to exist`);
  return readFileSync(target, "utf8");
};

const page = read("src/app/(dashboard)/executive/page.tsx");
const client = read("src/app/(dashboard)/executive/executive-dashboard-client.tsx");
const pie = read("src/components/ymq-progress-pie.tsx");
const groups = read("src/components/ymq-group-progress-table.tsx");
const ranking = read("src/components/ymq-participant-ranking.tsx");

assert.match(page, /ExecutiveDashboardClient/);
assert.match(client, /unitId/);
assert.match(client, /level/);
assert.match(client, /pembinaUserId/);
assert.match(client, /groupId/);
assert.match(client, /period|from|to/i);
assert.match(client, /\/dashboard\/ymq\/executive\/overview/);
assert.match(client, /\/dashboard\/ymq\/executive\/groups/);
assert.match(client, /\/dashboard\/ymq\/executive\/rankings/);
assert.match(groups, /Laporan umum kelompok/i);
assert.match(pie, /<svg/);
assert.match(pie, /IWR 1/);
assert.match(pie, /IWR 2/);
assert.match(pie, /Qur'an/);
assert.match(pie, /Belum ada progres/);
assert.match(ranking, /Top 20/);
assert.match(ranking, /Tie|tie|Urutan/);
assert.ok(!/from\s+["'](?:chart\.js|recharts)["']/.test([client, pie].join("\n")), "Dashboard must not import a chart library");
assert.ok(!/method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/.test(client), "Executive dashboard must not mutate data");
assert.match(client, /pengawas|pimpinan/);

console.log("SIYAUM YMQ executive dashboard UI contract passed");
