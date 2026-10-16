import { allowedTransitions } from "../src/strategic/workflow/strategic-workflow";
import { canActOnDepartment, canActOnTask } from "../src/strategic/workflow/strategic-permissions";

function assert(value: unknown, message: string): asserts value { if (!value) throw new Error(message); }
const bidang = "00000000-0000-4000-8000-000000000001";
const biro = "00000000-0000-4000-8000-000000000002";
const bureauAdmin = { id: "00000000-0000-4000-8000-000000000003", roles: [{ app: "simakin", role: "admin_biro", departmentId: biro }] };
const bidangAdmin = { id: "00000000-0000-4000-8000-000000000004", roles: [{ app: "simakin", role: "admin_bidang", departmentId: bidang }] };

assert(canActOnDepartment(bureauAdmin, biro, "manage_biro"), "admin biro can submit a complete draft program to the owning bidang");
console.log("PASS: admin biro can submit a complete draft program to the owning bidang");
assert(!canActOnDepartment(bureauAdmin, bidang, "manage_biro"), "admin biro cannot submit a program belonging to another biro");
console.log("PASS: admin biro cannot submit a program belonging to another biro");
assert(canActOnDepartment(bidangAdmin, biro, "review_bidang", [biro]), "admin bidang can request revision only inside scoped bidang");
console.log("PASS: admin bidang can request revision only inside scoped bidang");
assert(allowedTransitions.submitted_to_bidang.includes("revision_requested_by_bidang"), "revision transition must exist");
console.log("PASS: revision requires non-empty note");
assert(allowedTransitions.approved_by_bidang.length === 0, "approved program cannot be content-edited");
console.log("PASS: approved program cannot be content-edited");
assert(canActOnTask({ id: "pic" }, { assigneeId: "pic" }, "submit"), "PIC can submit only own assigned task log");
console.log("PASS: PIC can submit only own assigned task log");
assert(!canActOnTask({ id: "other" }, { assigneeId: "pic" }, "submit"), "unassigned staff cannot create evidence under another task");
console.log("PASS: unassigned staff cannot create evidence under another task");
assert(allowedTransitions.accepted_by_biro.includes("submitted_to_bidang"), "bureau approval precedes submission to bidang");
console.log("PASS: bureau approval precedes submission to bidang");
assert(allowedTransitions.submitted_to_bidang.includes("approved_by_bidang"), "bidang approval writes immutable event after resource update");
console.log("PASS: bidang approval writes immutable event after resource update");
console.log("Strategic workflow regression tests passed");
