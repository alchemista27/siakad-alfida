import { isValidDepartmentAdminAssignment } from "../src/common/hr-access";

const valid = {
  departmentId: "00000000-0000-4000-8000-000000000001",
  userId: "00000000-0000-4000-8000-000000000002",
  role: "admin_bidang",
};

if (!isValidDepartmentAdminAssignment(valid)) {
  throw new Error("valid department admin assignment must be accepted");
}

if (isValidDepartmentAdminAssignment({ ...valid, role: "admin_biro" })) {
  throw new Error("only admin_bidang assignment may be created by SIMPEG");
}

if (isValidDepartmentAdminAssignment({ ...valid, departmentId: "not-a-uuid" })) {
  throw new Error("invalid department UUID must be rejected");
}

if (isValidDepartmentAdminAssignment({ ...valid, userId: "not-a-uuid" })) {
  throw new Error("invalid employee UUID must be rejected");
}

console.log("Department admin assignment contract passed");
