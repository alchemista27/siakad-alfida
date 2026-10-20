import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const spmbSrc = resolve(import.meta.dirname, "../src/spmb-confirmation");
const spmbService = readFileSync(resolve(spmbSrc, "spmb-confirmation.service.ts"), "utf8");
const spmbModule = readFileSync(resolve(spmbSrc, "spmb-confirmation.module.ts"), "utf8");
const billingSrc = resolve(import.meta.dirname, "../src/spp-billing");
const billingService = readFileSync(resolve(billingSrc, "spp-billing.service.ts"), "utf8");
const billingModule = readFileSync(resolve(billingSrc, "spp-billing.module.ts"), "utf8");

assert.match(spmbService, /export const SPMB_CONFIRMATION_FETCH = Symbol\(/, "the SPMB fetch dependency must have an explicit Nest injection token");
assert.match(spmbService, /@Inject\(SPMB_CONFIRMATION_FETCH\)\s*private readonly fetchImplementation: FetchImplementation/, "SpmbConfirmationService must inject fetch through the explicit token rather than Function metadata");
assert.match(spmbModule, /provide:\s*SPMB_CONFIRMATION_FETCH\s*,\s*useValue:\s*fetch/s, "SpmbConfirmationModule must provide the fetch token at runtime");

assert.match(billingService, /export const SISKEU_BILLING_FETCH = Symbol\(/, "the SISKEU billing fetch dependency must have an explicit Nest injection token");
assert.match(billingService, /@Inject\(SISKEU_BILLING_FETCH\)\s*private readonly fetchImplementation: FetchImplementation/, "SppBillingService must inject fetch through the explicit token rather than Function metadata");
assert.match(billingModule, /provide:\s*SISKEU_BILLING_FETCH\s*,\s*useValue:\s*fetch/s, "SppBillingModule must provide the fetch token at runtime");

console.log("SIAKAD fetch dependency-injection contract passed");
