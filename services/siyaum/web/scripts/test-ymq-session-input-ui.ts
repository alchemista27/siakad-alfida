import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const read = (relativePath: string) => {
  const target = path.join(root, relativePath);
  assert.ok(existsSync(target), `Expected ${relativePath} to exist`);
  return readFileSync(target, "utf8");
};

const monitoring = read("src/app/(dashboard)/monitoring/monitoring-client.tsx");
const sessionInput = read("src/app/(dashboard)/monitoring/session-input-client.tsx");

assert.match(monitoring, /SessionInputClient/);
assert.match(sessionInput, /selectedGroupId/);
assert.match(sessionInput, /["']\/groups["']/);
assert.match(sessionInput, /\/learning-sessions\//);
assert.match(sessionInput, /active roster|roster aktif|roster/i);
assert.match(sessionInput, /iwr_1|iwr_2/);
assert.match(sessionInput, /surahNumber/);
assert.match(sessionInput, /ayahStart/);
assert.match(sessionInput, /ziyadah/);
assert.match(sessionInput, /disabled=\{isSaving/);
assert.match(sessionInput, /YmqProgressEvidenceUploader/);
assert.ok(!/\balert\s*\(/.test(sessionInput), "Session input must not use alert()");
assert.ok(!/\bconfirm\s*\(/.test(sessionInput), "Session input must not use confirm()");

console.log("SIYAUM YMQ session input UI contract passed");
