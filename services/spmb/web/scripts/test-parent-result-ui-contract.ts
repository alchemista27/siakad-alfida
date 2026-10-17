import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const root = resolve(import.meta.dirname, "..");
const resultPagePath = resolve(root, "src/app/parent/result/page.tsx");
const pdfRoutePath = resolve(root, "src/app/api/pdf/acceptance/route.ts");
const decisionPanelPath = resolve(root, "src/components/admin/decision-panel.tsx");

assert(existsSync(resultPagePath), "missing src/app/parent/result/page.tsx");
assert(existsSync(pdfRoutePath), "missing src/app/api/pdf/acceptance/route.ts");
assert(existsSync(decisionPanelPath), "missing src/components/admin/decision-panel.tsx");

const resultPage = readFileSync(resultPagePath, "utf8");
assert(resultPage.includes("/api/pdf/acceptance"), "result page must link to /api/pdf/acceptance");
assert(resultPage.includes("rejectionReason"), "result page must render persisted rejectionReason");
assert(!resultPage.includes("alert(") && !resultPage.includes("confirm("), "result page must not use native dialogs");

const pdfRoute = readFileSync(pdfRoutePath, "utf8");
assert(pdfRoute.includes("/api/letters/acceptance/"), "acceptance PDF route must verify ownership via backend /api/letters/acceptance/:id");

console.log("SPMB parent result UI contract passed");
