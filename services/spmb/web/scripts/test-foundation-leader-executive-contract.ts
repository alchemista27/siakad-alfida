import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
async function main() {
const [entries, selector, executive] = await Promise.all([
  readFile(path.join(root, "../../../packages/contracts/src/spmb-entry.ts"), "utf8"),
  readFile(path.join(root, "src/components/spmb-entry-selector.tsx"), "utf8"),
  readFile(path.join(root, "src/app/executive/page.tsx"), "utf8"),
]);

assert.match(entries, /id: "executive"/);
assert.match(entries, /path: "\/executive"/);
assert.match(entries, /isFoundationLeader/);
assert.match(selector, /getSpmbEntries\(user\.roles \|\| \[\]\)/);
assert.match(executive, /Pimpinan Yayasan/);
assert.match(executive, /\/api\/periods/);
assert.match(executive, /\/api\/decisions\/statistics\//);
assert.doesNotMatch(executive, /method:\s*["'](?:POST|PUT|PATCH|DELETE)["']/);

console.log("SPMB Foundation Leader executive web contract passed");
}

void main();
