import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const shell = readFileSync(resolve(import.meta.dirname, "../src/components/siyaum-app-shell.tsx"), "utf8");

assert.match(shell, /Penugasan Admin Kelompok/);
assert.match(shell, /href: "\/group-admins"/);
assert.match(shell, /Penugasan Pembina/);
assert.match(shell, /href: "\/pembina"/);
assert.match(shell, /Penugasan Penguji/);
assert.match(shell, /href: "\/penguji"/);
assert.doesNotMatch(shell, /Pandangan Pembina/);
assert.doesNotMatch(shell, /pembina-view/);

console.log("SIYAUM YMQ assignment navigation UI contract passed");
