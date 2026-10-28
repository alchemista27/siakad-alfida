import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => {
  const target = path.join(root, relativePath);
  assert.ok(existsSync(target), `Expected ${relativePath} to exist`);
  return readFileSync(target, "utf8");
};

const api = read("src/lib/api.ts");
const modal = read("src/components/notification-modal.tsx");
const monitoring = read("src/app/(dashboard)/monitoring/monitoring-client.tsx");
const groups = read("src/app/(dashboard)/groups/group-staff-manager.tsx");
const executive = read("src/app/(dashboard)/executive/executive-dashboard-client.tsx");
const shell = read("src/components/siyaum-app-shell.tsx");
const tilawah = read("src/app/(dashboard)/tilawah/tilawah-client.tsx");
const currentUser = read("src/lib/current-user.ts");

assert.match(api, /const API_BASE_URL\s*=\s*["']\/api/);
assert.match(api, /content-type/i);
assert.match(api, /application\/json/i);
assert.match(api, /response\.text\(\)/);
assert.ok(!/https:\/\/\d{1,3}\./.test(api), "API client must not use a public IP");
assert.match(modal, /role="dialog"/);
assert.match(monitoring, /canManageSessions/);
assert.match(groups, /canManageGroups/, "group controls must use the shared global-Super-Admin-aware capability");
assert.match(groups, /Buat Kelompok/, "group manager must expose an in-app create-group action");
assert.match(groups, /apiFetch<Group>\("\/groups",\s*\{\s*method:\s*"POST"/, "create-group action must call the protected groups API");
assert.match(groups, /role="dialog"/, "create-group action must use an accessible custom modal");
assert.match(shell, /AppShell/, "SIYAUM must use the shared application shell");
assert.match(shell, /userName=/, "shared shell must receive signed-in user identity");
assert.match(shell, /userRole=/, "shared shell must receive the signed-in role label");
assert.match(shell, /topbarActions=/, "SIYAUM must supply an explicit topbar module-switcher action");
assert.match(shell, /https:\/\/auth\.alfida\.or\.id\/modules/, "SIYAUM module switcher must target Auth module selection");
assert.match(shell, /aria-label="Pilih modul"/, "module switcher must be accessible");
assert.match(shell, /avatarUrl=\{user\?\.avatarUrl\}/, "SIYAUM must pass the signed-in avatar to the shared topbar");
assert.match(shell, /profileHref=/, "SIYAUM identity must link to the Auth profile page");
assert.match(currentUser, /avatarUrl\?: string \| null/, "SIYAUM current-user contract must carry the profile avatar");
assert.doesNotMatch(shell, /<aside/, "SIYAUM must not retain a bespoke sidebar alongside the shared shell");
assert.match(executive, /canViewExecutive/);
assert.ok(!/method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/.test(executive), "Executive dashboard must be read-only");
assert.ok(!/\balert\s*\(/.test([monitoring, groups, executive].join("\n")), "Operational UI must not use alert()");
assert.ok(!/\bconfirm\s*\(/.test([monitoring, groups, executive].join("\n")), "Operational UI must not use confirm()");
assert.doesNotMatch(
  shell,
  /hasSiyaumRole\(user,\s*"admin_ymq",\s*"pembina_ymq",\s*"admin_kelompok",\s*"musyrif"\)/,
  "Musyrif must not be offered the group-session journal because its API does not permit that role",
);
assert.match(
  shell,
  /hasSiyaumRole\(user,\s*"admin_ymq",\s*"pembina_ymq",\s*"admin_kelompok"\)/,
  "Only roles accepted by learning-sessions upsert may see the journal navigation",
);
assert.match(tilawah, /SiyaumAppShell/, "Tilawah must use the SIYAUM-specific shell");
assert.match(tilawah, /hasSiyaumRole/, "Tilawah must derive optional calls and actions from scoped roles");
assert.doesNotMatch(tilawah, /musyrif/, "Tilawah must use pembina terminology and role scope");
assert.match(tilawah, /canVerifySetoran\s*=\s*hasSiyaumRole\(currentUser,\s*"admin_ymq",\s*"pembina_ymq"\)/);
assert.match(
  tilawah,
  /const canManageOwnSetoran = hasSiyaumRole\(user, "admin_ymq", "pembina_ymq", "admin_kelompok", "peserta"\)/,
  "Observer and leadership roles must remain report-only in the personal tilawah workspace",
);
assert.match(
  tilawah,
  /canManageOwnSetoran \? apiFetch<SetoranItem\[\]>\("\/setoran\/my"\) : Promise\.resolve\(\[\]\)/,
  "Report-only roles must not request the personal-setoran API",
);
assert.match(currentUser, /\["\*", "auth", "core"\]/, "Frontend must recognize only global Super Admin scopes accepted by the API");
assert.doesNotMatch(currentUser, /\["\*", "auth", "core", "siyaum"\]/, "An app-scoped siyaum super_admin must not be mistaken for global override access");
assert.match(
  tilawah,
  /canReadGlobalMetrics\s*\?\s*apiFetch<Metrics>\("\/dashboard\/metrics"\)/,
  "Tilawah must request dashboard metrics only for roles the API permits",
);

console.log("SIYAUM YMQ access UI contract passed");
