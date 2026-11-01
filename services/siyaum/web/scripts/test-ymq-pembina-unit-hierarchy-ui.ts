import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const groupsUi = readFileSync(resolve(import.meta.dirname, "../src/app/(dashboard)/groups/group-staff-manager.tsx"), "utf8");
const executiveUi = readFileSync(resolve(import.meta.dirname, "../src/app/(dashboard)/executive/executive-dashboard-client.tsx"), "utf8");

assert.match(groupsUi, /groupsByPembina/);
assert.match(groupsUi, /Progress:\s*\{member\.progressLevel/);
assert.match(groupsUi, /progressLevel\?:\s*"pra_tahsin"\s*\|\s*"tahsin"\s*\|\s*"tahfiz"\s*\|\s*null/);
assert.ok(executiveUi.indexOf('>Pembina<select') < executiveUi.indexOf('>Unit kerja SIMPEG<select'), "Filter pembina harus dirender sebelum unit.");
assert.match(executiveUi, /key === "pembinaUserId"\s*\?\s*\{\s*\.\.\.current, pembinaUserId: value, unitId: "", groupId: ""\s*\}/);

console.log("YMQ pembina-unit hierarchy UI contract passed");
