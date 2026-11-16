import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const panel = readFileSync(resolve(process.cwd(), "src/components/admin/decision-panel.tsx"), "utf8");

assert(panel.includes('item.status === "observation_done"'), "initial Terima/Tolak actions must be limited to unfinalized candidates");
assert(panel.includes('item.status === "accepted" || item.status === "rejected"'), "finalized decisions must have a distinct UI state");
assert(panel.includes("Revisi Keputusan"), "finalized decisions must offer a revision action instead of repeating initial actions");
assert(panel.includes("Ubah menjadi Diterima"), "revision UI must name the target decision explicitly");
assert(panel.includes("Ubah menjadi Tidak Lulus"), "revision UI must name the target decision explicitly");
assert(panel.includes('item.handoffStatus === "done"'), "revision UI must prevent changes after SIAKAD handoff is complete");
assert(!panel.includes("window.confirm(") && !panel.includes("alert("), "decision UI must not use native browser dialogs");

console.log("SPMB decision panel UI contract passed");
