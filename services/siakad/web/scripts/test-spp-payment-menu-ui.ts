import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const page = resolve(root, "src/app/(dashboard)/parent/payments/spp/page.tsx");

assert(existsSync(page), "missing SIAKAD parent SPP payment menu");
const source = readFileSync(page, "utf8");
assert(source.includes('"/billing/spp"'), "SPP menu must read bills through the SIAKAD billing boundary");
assert(source.includes("payment-session"), "SPP menu must initiate a SISKEU payment session instead of uploading proof itself");
assert(!source.includes("generate"), "SIAKAD payment menu must not generate SPP invoices");
assert(!source.includes("alert("), "SPP menu must use inline feedback rather than native alerts");
console.log("SIAKAD SPP payment menu UI contract passed");
