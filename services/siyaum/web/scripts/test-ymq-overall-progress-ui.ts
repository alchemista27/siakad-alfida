import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (relativePath: string) => {
  const target = resolve(root, relativePath);
  assert.ok(existsSync(target), `Expected ${relativePath} to exist`);
  return readFileSync(target, "utf8");
};

const page = read("src/app/(dashboard)/progress/page.tsx");
const client = read("src/app/(dashboard)/progress/overall-progress-dashboard-client.tsx");
const pie = read("src/components/ymq-overall-progress-pie.tsx");
const rankings = read("src/components/ymq-category-rankings.tsx");
const hafalan = read("src/components/ymq-hafalan-ranking.tsx");
const bars = read("src/components/ymq-unit-progress-bars.tsx");
const shell = read("src/components/siyaum-app-shell.tsx");

assert.match(page, /OverallProgressDashboardClient/);
assert.match(client, /apiFetch<OverallProgressReport>\(`\/dashboard\/ymq\/progress\$\{suffix\}`\)/);
assert.match(client, /hasSiyaumRole\(currentUser, "admin_ymq", "pengawas", "pimpinan"\)/);
assert.match(client, /if \(!hasSiyaumRole\(currentUser, "admin_ymq", "pengawas", "pimpinan"\)\) return;/);
assert.match(client, /aria-label="Pilih unit kerja"/);
assert.match(client, /YmqOverallProgressPie/);
assert.match(client, /YmqCategoryRankings/);
assert.match(client, /YmqHafalanRanking/);
assert.match(client, /YmqUnitProgressBars/);
assert.match(pie, /role="img"/);
assert.match(rankings, /Top 20/);
assert.match(hafalan, /Halaman hafalan terverifikasi/);
assert.match(bars, /Rata-rata hafalan/);
assert.match(shell, /const canViewOverallProgress = hasSiyaumRole\(user, "admin_ymq", "pengawas", "pimpinan"\)/);
assert.match(shell, /Dashboard Pencapaian/);
assert.match(shell, /href: "\/progress"/);
assert.match(shell, /const canViewExecutive = hasSiyaumRole\(user, "pengawas", "pimpinan"\)/);
assert.doesNotMatch(client, /\b(alert|confirm)\(/);

console.log("SIYAUM overall progress dashboard UI contract passed");
