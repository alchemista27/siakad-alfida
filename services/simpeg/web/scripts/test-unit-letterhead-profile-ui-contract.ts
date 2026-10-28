import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const page = readFileSync(resolve(root, "src/app/page.tsx"), "utf8");
const panel = readFileSync(resolve(root, "src/components/organization/unit-management-panel.tsx"), "utf8");
const modalPath = resolve(root, "src/components/organization/unit-letterhead-profile-modal.tsx");
const uploaderPath = resolve(root, "src/components/organization/unit-letterhead-asset-uploader.tsx");

assert(existsSync(modalPath), "missing unit letterhead profile modal");
assert(existsSync(uploaderPath), "missing unit letterhead asset uploader");
assert.match(page, /canManageAllUnits=\{canManageAllUnits\}/, "page must pass global unit capability to panel");
assert.match(page, /manageableUnitIds=\{manageableUnitIds \?\? \[\]\}/, "page must pass scoped unit IDs to panel");
assert.match(panel, /canManageAllUnits: boolean/, "panel must know global management capability");
assert.match(panel, /manageableUnitIds: string\[\]/, "panel must know scoped unit IDs");
assert.match(panel, /Profil Unit/, "panel must offer a Unit Profile action");
assert.match(panel, /unit\.category === "pendidikan"/, "only education units may open school letterhead profile");
assert.match(panel, /manageableUnitIds\.includes\(unit\.id\)/, "profile action must honor scoped unit IDs");
assert.match(readFileSync(modalPath, "utf8"), /\/api\/units\/\$\{unit\.id\}\/letterhead-profile/, "modal must target scoped profile endpoint");
assert.match(readFileSync(uploaderPath, "utf8"), /api\.cloudinary\.com\/v1_1/, "assets must use direct Cloudinary upload");
assert.doesNotMatch(readFileSync(modalPath, "utf8"), /principalSignatureUrl|Tanda Tangan Kepala Sekolah/, "modal must not offer signature uploads");
assert.doesNotMatch(readFileSync(uploaderPath, "utf8"), /principalSignature|principal-signature/, "uploader must not target the legacy signature folder");
assert.doesNotMatch(`${panel}\n${readFileSync(modalPath, "utf8")}`, /\b(alert|confirm)\(/, "unit profile must not use native dialogs");

console.log("SIMPEG unit letterhead profile UI contract passed");
