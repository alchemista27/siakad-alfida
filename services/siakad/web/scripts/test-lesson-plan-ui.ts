import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const page = join(root, "src/app/(dashboard)/teacher/lesson-plans/page.tsx");
assert.ok(existsSync(page), "teacher lesson-plan page missing");
const source = readFileSync(page, "utf8");
assert.match(source, /siakadApiFetch/);
assert.match(source, /\/lesson-plans/);
assert.match(source, /Memuat|loading/);
assert.match(source, /Gagal|error/);
assert.match(source, /Belum ada|empty/);
assert.doesNotMatch(source, /\b(?:alert|confirm)\s*\(/);
console.log("Lesson plan UI contract passed");
