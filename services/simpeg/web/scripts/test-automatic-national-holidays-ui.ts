import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const panel = readFileSync(resolve(root, "src/components/attendance/workday-management-panel.tsx"), "utf8");
const page = readFileSync(resolve(root, "src/app/page.tsx"), "utf8");

assert.match(page, /readManagementJson<Holiday\[\]>\("\/api\/attendance\/holidays"\)/, "effective holidays must be fetched from the existing endpoint");
assert.match(page, /activeTab === "workday"[\s\S]*fetchWorkdayData/, "opening workday tab must refresh effective holidays");
assert.match(panel, /Diperbarui dari provider/, "provider provenance must be visible");
assert.match(panel, /holiday\.unitId === null[\s\S]*?Ubah/, "national holiday rows must be read-only while local rows remain editable");
assert.match(panel, /unitId: holidayForm\.unitId/, "local holiday submissions must use a concrete unit");
assert.match(panel, /required value=\{holidayForm\.unitId\}/, "local holiday scope must be required");
assert.doesNotMatch(panel, /Nasional \/ semua unit<\/option>|Tambah nasional|from-catalog|national-holiday-catalog/, "national creation/catalog must not exist");
assert.doesNotMatch(panel, /unitId: holidayForm\.unitId \|\| null/, "holiday form must never create a global row");
assert.match(page, /readManagementJson<Holiday\[\]>/, "holiday errors must propagate rather than become empty results");
console.log("automatic national holidays UI passed");
