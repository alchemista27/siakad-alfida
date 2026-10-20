import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const src = resolve(import.meta.dirname, "../src/spmb-confirmation");
const service = readFileSync(resolve(src, "spmb-confirmation.service.ts"), "utf8");
const moduleSource = readFileSync(resolve(src, "spmb-confirmation.module.ts"), "utf8");

assert.match(service, /export const SPMB_CONFIRMATION_FETCH = Symbol\(/, "the fetch dependency must have an explicit Nest injection token");
assert.match(service, /@Inject\(SPMB_CONFIRMATION_FETCH\)\s*private readonly fetchImplementation: FetchImplementation/, "SpmbConfirmationService must inject fetch through the explicit token rather than Function metadata");
assert.match(moduleSource, /provide:\s*SPMB_CONFIRMATION_FETCH\s*,\s*useValue:\s*fetch/s, "SpmbConfirmationModule must provide the fetch token at runtime");

console.log("SPMB confirmation DI contract passed");
