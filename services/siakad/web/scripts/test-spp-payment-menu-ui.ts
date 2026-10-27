import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const page = resolve(root, "src/app/(dashboard)/parent/payments/spp/page.tsx");

assert(existsSync(page), "missing SIAKAD parent SPP payment menu");
const source = readFileSync(page, "utf8");
assert(source.includes('"/billing/spp"'), "SPP menu must read bills through the SIAKAD billing boundary");
assert(source.includes("payment-session"), "SPP menu must initiate a SISKEU payment session instead of uploading proof itself");
assert(source.includes('paymentMethod: "gateway" | "manual_transfer"'), "SPP menu must type gateway and manual-transfer session modes");
assert(source.includes("paymentUrl: string | null"), "SPP menu must allow SISKEU manual sessions without a redirect URL");
assert(source.includes("instructions: string | null"), "SPP menu must receive typed manual-transfer instructions");
assert.match(source, /if \(session\.paymentMethod === "gateway" && session\.paymentUrl\) \{\s*window\.location\.assign\(session\.paymentUrl\);/s, "SPP menu may redirect only for a gateway session with a URL");
assert(source.includes("setManualSession(session)"), "SPP menu must retain manual-transfer session details for display");
assert(source.includes("Instruksi transfer manual"), "SPP menu must show manual-transfer instructions safely in the page UI");
assert(source.includes("{manualSession.instructions}"), "SPP menu must render the configured manual-transfer instructions");
assert(source.includes("{manualSession.reference}"), "SPP menu must render the payment reference");
assert(!source.includes("generate"), "SIAKAD payment menu must not generate SPP invoices");
assert(!source.includes("alert("), "SPP menu must use inline feedback rather than native alerts");
console.log("SIAKAD SPP payment menu UI contract passed");
