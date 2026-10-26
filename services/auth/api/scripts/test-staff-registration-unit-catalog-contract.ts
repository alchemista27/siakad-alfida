import assert from "node:assert/strict";
import { ALFIDA_UNITS } from "../src/auth/auth.service";

const canonicalSimpegUnits = [
  ["fed6e093-3fe7-46f7-b5c4-7b33e95ea8bb", "Kantor Pusat Yayasan"],
  ["18d0d36c-aea5-4ba6-a89b-320f9a4f240d", "Pesantren Quran Alfida"],
] as const;

for (const [id, name] of canonicalSimpegUnits) {
  assert.equal(
    ALFIDA_UNITS.find((unit) => unit.name === name)?.id,
    id,
    `staff registration must issue SIMPEG's canonical ${name} ID`,
  );
}

console.log("Auth staff registration unit catalog contract passed");
