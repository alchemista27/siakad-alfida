import { BIDANG_REVIEW_SLA_DAYS, BIRO_REVIEW_SLA_DAYS, reviewDueAt } from "../src/strategic/workflow/strategic-workflow.constants";

const base = new Date("2026-10-15T00:00:00.000Z");
if (reviewDueAt("biro", base).toISOString() !== "2026-10-17T00:00:00.000Z") throw new Error("Biro SLA must be two calendar days");
if (reviewDueAt("bidang", base).toISOString() !== "2026-10-18T00:00:00.000Z") throw new Error("Bidang SLA must be three calendar days");
if (BIRO_REVIEW_SLA_DAYS !== 2 || BIDANG_REVIEW_SLA_DAYS !== 3) throw new Error("SLA constants changed unexpectedly");
console.log("Executive monitoring contract passed");
