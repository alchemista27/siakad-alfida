import { canActOnDepartment, canActOnTask, isExecutive } from "../src/strategic/workflow/strategic-permissions";

const bidangA = "00000000-0000-0000-0000-0000000000a1";
const biroA = "00000000-0000-0000-0000-0000000000b1";
const biroB = "00000000-0000-0000-0000-0000000000b2";
const staffA = "00000000-0000-0000-0000-0000000000c1";
const bidangUser = { id: "bidang", roles: [{ app: "simakin", role: "admin_bidang", departmentId: bidangA }] };
const biroUser = { id: "biro", roles: [{ app: "simakin", role: "admin_biro", departmentId: biroA }] };
const otherBiroUser = { id: "other-biro", roles: [{ app: "simakin", role: "admin_biro", departmentId: biroB }] };
const pimpinan = { id: "pimpinan", roles: [{ app: "simakin", role: "pimpinan" }] };

if (!canActOnDepartment(bidangUser, bidangA, "review_bidang")) throw new Error("scoped admin bidang must review own bidang");
if (!canActOnDepartment(bidangUser, biroA, "review_bidang", [biroA])) throw new Error("admin bidang must review descendant biro");
if (!canActOnDepartment(biroUser, biroA, "manage_biro")) throw new Error("scoped admin biro must manage own biro");
if (canActOnDepartment(otherBiroUser, biroA, "manage_biro")) throw new Error("admin biro must not manage another biro");
if (!canActOnTask({ id: staffA, roles: [{ app: "simakin", role: "staff" }] }, { assigneeId: staffA }, "submit")) throw new Error("assigned staff must submit own task");
if (canActOnTask({ id: "not-pic", roles: [{ app: "simakin", role: "staff" }] }, { assigneeId: staffA }, "submit")) throw new Error("unassigned staff must be rejected");
if (!isExecutive(pimpinan)) throw new Error("pimpinan must be executive");

console.log("Strategic governance policy contract passed");
