import assert from "node:assert/strict";
import { StudentRegistrationFormSchema } from "@alfida/contracts";
import { buildStudentSubmissionPayload } from "../src/lib/student-submission-payload";

const base = {
  fullName: "Fulan Ahmad",
  nickname: "Fulan",
  gender: "male" as const,
  religion: "Islam",
  birthPlace: "Bandung",
  birthDate: "2014-08-17",
  nisn: "",
  siblingsCount: "1",
  transportation: "Diantar",
  nik: "3273010101010001",
  birthCertificateNumber: "AKTA-2014-001",
  familyCardNumber: "3273010101010002",
  streetAddress: "Jalan Melati Nomor 10",
  rt: "1",
  rw: "2",
  hamlet: "",
  village: "Cipedes",
  subdistrict: "Sukajadi",
  city: "Bandung",
  province: "Jawa Barat",
  postalCode: "40162",
  residenceStatus: "with_parents" as const,
  specialNeeds: "",
  pipEligible: false,
  kipNumber: "",
  previousSchoolName: "",
  previousSchoolNpsn: "",
  graduationDocumentNumber: "",
  graduationYear: "",
  tkGroup: "" as const,
};

for (const level of ["sd", "smp", "sma"] as const) {
  const payload = buildStudentSubmissionPayload(base, level);
  assert.equal("tkGroup" in payload, false, `${level.toUpperCase()} must not send an empty TK group`);
  assert(StudentRegistrationFormSchema.safeParse(payload).success, `${level.toUpperCase()} payload must pass shared validation`);
}

const tkPayload = buildStudentSubmissionPayload({ ...base, tkGroup: "b" }, "tk");
assert.equal(tkPayload.tkGroup, "b", "TK must preserve the parent-selected group");
assert(StudentRegistrationFormSchema.safeParse(tkPayload).success, "TK payload with a selected group must pass shared validation");

console.log("SPMB student submission payload contract passed");
