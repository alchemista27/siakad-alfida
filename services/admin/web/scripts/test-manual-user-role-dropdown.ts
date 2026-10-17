import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const pagePath = join(process.cwd(), "src/app/users/page.tsx");
const helperPath = join(process.cwd(), "src/lib/role-catalog.ts");
const roleModalPath = join(process.cwd(), "src/components/user-role-modal.tsx");

function main() {
  const page = readFileSync(pagePath, "utf8");
  const helper = readFileSync(helperPath, "utf8");
  const roleModal = readFileSync(roleModalPath, "utf8");

  assert.doesNotMatch(page, /const\s+APPS_LIST\s*=/, "the page must not define a local app list");
  assert.doesNotMatch(
    page,
    /<input[\s\S]{0,600}value=\{newUserData\.role\}/,
    "manual role selection must not use a free-text input",
  );
  assert.match(page, /from\s+["']@\/lib\/role-catalog["']/);
  assert.match(page, /const\s+manualRoles\s*=\s+MANUAL_ASSIGNABLE_ROLE_CATALOG\[newUserData\.app\]/);
  assert.match(page, /role:\s*firstManualRole\(app\)/, "changing app must reset the selected role");
  assert.match(page, /<select[\s\S]{0,500}value=\{newUserData\.role\}/, "manual role must use a select");
  assert.match(page, /manualRoles\.map\(\(role\)/, "role options must derive from the shared catalog helper");
  assert.match(page, /Tidak ada peran langsung untuk aplikasi ini/, "the empty direct-role state must be visible");
  assert.match(page, /Peran berscope unit\/bidang ditetapkan dari Struktur Organisasi SIMPEG\./);
  assert.match(page, /disabled=\{manualRoles\.length === 0\}/, "submit must be disabled with no direct role");

  assert.match(helper, /from\s+["']@alfida\/contracts["']/);
  assert.match(helper, /MANUAL_ASSIGNABLE_ROLE_CATALOG/);
  assert.match(helper, /UNIT_SCOPED_ROLE_KEYS/);
  assert.match(helper, /DEPARTMENT_SCOPED_ROLE_KEYS/);

  assert.match(roleModal, /from\s+["']@\/lib\/role-catalog["']/);
  assert.doesNotMatch(roleModal, /const\s+ROLE_CATALOG\s*=/);
  assert.doesNotMatch(roleModal, /const\s+UNIT_SCOPED_ROLES\s*=/);
  assert.doesNotMatch(roleModal, /const\s+DEPARTMENT_SCOPED_ROLES\s*=/);
  assert.match(roleModal, /Struktur Organisasi SIMPEG/, "role modal must preserve scoped-role guidance");

  console.log("Admin manual user role dropdown contract passed");
}

main();
