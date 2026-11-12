import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(import.meta.dirname, "../src/app/page.tsx"), "utf8");

assert.match(
  page,
  /const gpsConfigUnits = units\.filter\(\(unit\) => unit\.isActive && \(canManageAllUnits \|\| manageableUnitIds\?\.includes\(unit\.id\)\)\);/,
  "GPS editor must derive selectable units from the authenticated management scope",
);
assert.match(
  page,
  /canManageAllUnits \|\| \(manageableUnitIds\?\.length \|\| 0\) > 0 \? \[\{[\s\S]*?label: "Konfigurasi Lokasi GPS"[\s\S]*?href: "#gps-settings"/,
  "Super Admin and scoped Admin Unit must see the GPS location editor navigation",
);
assert.match(
  page,
  /<select required value=\{gpsConfigForm\.unitId\}[\s\S]*?\{gpsConfigUnits\.map\(\(unit\) => <option key=\{unit\.id\} value=\{unit\.id\}>\{unit\.name\}<\/option>\)\}/,
  "GPS editor must offer only units allowed for the current administrator",
);

console.log("SIMPEG GPS location menu access contract passed");
