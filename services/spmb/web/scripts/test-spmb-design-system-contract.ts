import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const read = (file: string) => readFileSync(resolve(root, file), "utf8");
const globals = read("src/app/globals.css");

for (const token of ["--primary", "--tertiary", "--neutral", "--surface", "--border"]) {
  assert.match(globals, new RegExp(token), `globals must define ${token}`);
}
for (const componentClass of [
  ".spmb-card",
  ".spmb-input",
  ".spmb-button-primary",
  ".spmb-button-secondary",
  ".spmb-notice-error",
]) {
  assert.match(globals, new RegExp(componentClass.replace(".", "\\.")), `globals must define ${componentClass}`);
}
assert.doesNotMatch(globals, /shadow-(md|lg)/, "shared SPMB primitives must not use heavy shadows");
assert.doesNotMatch(globals, /rounded-(xl|2xl)/, "shared SPMB primitives must keep the prescribed radius scale");

for (const file of [
  "src/app/parent/page.tsx",
  "src/app/parent/select-unit/page.tsx",
  "src/components/parent/parent-registration-stepper.tsx",
  "src/components/parent/student-registration-form.tsx",
  "src/components/parent/parent-registration-form.tsx",
  "src/components/SpmbNavbar.tsx",
  "src/app/admin/page.tsx",
  "src/app/observer/page.tsx",
]) {
  const source = read(file);
  assert.match(source, /spmb-(card|button-primary|input|button-secondary)/, `${file} must consume SPMB semantic primitives`);
  assert.doesNotMatch(source, /shadow-(md|lg)/, `${file} must not use heavy shadows`);
  assert.doesNotMatch(source, /rounded-(xl|2xl)/, `${file} must not use oversized rounding`);
}

console.log("SPMB DESIGN.md semantic primitive contract passed");
