import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const source = readFileSync(resolve(import.meta.dirname, "../src/attendance/fingerprint-sync.processor.ts"), "utf8");
assert.match(source, /implements OnModuleInit/, "processor must start with Nest lifecycle");
assert.match(source, /SIMPEG_FINGERPRINT_ENABLED/, "processor must remain disabled without explicit config");
assert.match(source, /isOfficeWeekday/, "processor must skip weekend device connections");
assert.match(source, /this\.running/, "processor must prevent overlapping runs");
assert.match(source, /setInterval/, "processor must poll periodically");
console.log("SIMPEG fingerprint sync processor contract passed");
