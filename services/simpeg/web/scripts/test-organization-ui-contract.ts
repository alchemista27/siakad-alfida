import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), "src");
const source = (relativePath: string) => {
  const path = join(root, relativePath);
  assert.ok(existsSync(path), `Expected ${relativePath} to exist`);
  return readFileSync(path, "utf8");
};

const page = source("app/page.tsx");
const unitPanel = source("components/organization/unit-management-panel.tsx");
const unitAdminModal = source("components/organization/unit-admin-modal.tsx");
const departmentPanel = source("components/organization/department-management-panel.tsx");
const departmentAdminModal = source("components/organization/department-admin-modal.tsx");
const confirmModal = source("components/organization/confirm-action-modal.tsx");

assert.match(page, /UnitManagementPanel/);
assert.match(page, /DepartmentManagementPanel/);
assert.match(page, /\/api\/attendance\/configs/);
assert.match(page, /role="alert"/);
assert.match(page, /Pesan kesalahan dari server akan ditampilkan di sini/);

assert.match(unitPanel, /Tambah Unit/);
assert.match(unitPanel, /Edit/);
assert.match(unitPanel, /Admin Unit/);
assert.match(unitPanel, /Hapus Unit/);
assert.match(unitPanel, /Kategori/);
assert.match(unitPanel, /pendidikan/);
assert.match(unitPanel, /nondik/);
assert.match(unitPanel, /\/api\/units\/\$\{unit\.id\}/);

assert.match(unitAdminModal, /SIAKAD/);
assert.match(unitAdminModal, /SPMB/);
assert.match(unitAdminModal, /Kepegawaian \(SIMPEG\)/);
assert.match(unitAdminModal, /Unit non-pendidikan hanya dapat memiliki Admin SIMPEG/);
assert.match(unitAdminModal, /\/api\/units\/\$\{unit\.id\}\/admins/);
assert.match(unitAdminModal, /\/api\/units\/\$\{unit\.id\}\/admins\/\$\{assignment\.userId\}\/\$\{assignment\.app\}/);

assert.match(departmentPanel, /Tambah Bidang/);
assert.match(departmentPanel, /Admin Bidang SIMAKIN/);
assert.match(departmentPanel, /Hapus Bidang/);
assert.match(departmentPanel, /\/api\/departments\/\$\{department\.id\}/);
assert.match(departmentAdminModal, /\/api\/departments\/\$\{department\.id\}\/admins/);
assert.match(departmentAdminModal, /\/api\/departments\/\$\{department\.id\}\/admins\/\$\{assignment\.userId\}/);
assert.match(departmentAdminModal, /Pegawai aktif/);

assert.match(confirmModal, /role="dialog"/);
assert.match(confirmModal, /aria-modal="true"/);
assert.match(confirmModal, /Batalkan/);
assert.match(confirmModal, /Konfirmasi/);

function collectTsx(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTsx(path);
    return entry.name.endsWith(".tsx") ? [path] : [];
  });
}

for (const path of collectTsx(root)) {
  const contents = readFileSync(path, "utf8");
  assert.doesNotMatch(contents, /window\.(?:alert|confirm)\s*\(/, `${path} must not use native dialogs`);
  assert.doesNotMatch(contents, /(?<![A-Za-z.])(?:alert|confirm)\s*\(/, `${path} must not use native dialogs`);
}

console.log("SIMPEG organization UI contract passed");
