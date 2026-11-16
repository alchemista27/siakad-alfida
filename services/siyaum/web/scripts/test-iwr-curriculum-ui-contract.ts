import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const curriculumPage = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/curriculum/page.tsx"), "utf8");
const sessionInput = readFileSync(resolve(process.cwd(), "src/app/(dashboard)/monitoring/session-input-client.tsx"), "utf8");

assert.match(curriculumPage, /pageStart: number \| null/, "curriculum UI must accept page-less IWR units from the API");
assert.match(curriculumPage, /pageStart: form\.pageStart \? Number\(form\.pageStart\) : null/, "blank page input must persist as null, not page zero");
assert.match(curriculumPage, /unit\.pageStart === null \? "—"/, "curriculum table must render page-less rows clearly");
assert.match(sessionInput, /unit\.pageStart === null \? "tanpa halaman"/, "session input must render page-less IWR units clearly");

console.log("SIYAUM IWR curriculum UI contract passed");
