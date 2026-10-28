import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const page = readFileSync(resolve(process.cwd(), "src/app/parent/medical/page.tsx"), "utf8");
assert.match(page, /\/api\/pdf\/medical-referral\?registrationId=/, "medical stage must link to referral PDF");
assert.match(page, /Surat Pengantar Pemeriksaan Kesehatan/, "medical stage must label the referral action clearly");
assert.match(page, /target="_blank"/, "referral PDF should open in a separate tab");
assert.match(page, /rel="noopener noreferrer"/, "referral PDF link must prevent opener access");
assert.doesNotMatch(page, /\b(alert|confirm)\(/, "medical workflow must not use native dialogs");
console.log("SPMB parent medical referral UI contract passed");
