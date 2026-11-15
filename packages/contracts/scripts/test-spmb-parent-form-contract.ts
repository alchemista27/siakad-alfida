import {
  assertGuardianRequiredForResidence,
  ParentRegistrationFormSchema,
  StudentRegistrationFormSchema,
  isStudentRegistrationComplete,
} from "../src";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const student = {
  fullName: "Ahmad Fauzi",
  nickname: "Ahmad",
  gender: "male",
  religion: "Islam",
  birthPlace: "Bandung",
  birthDate: "2019-05-10",
  nisn: "",
  siblingsCount: 2,
  transportation: "Diantar orang tua",
  nik: "3273010101010001",
  birthCertificateNumber: "AKTA-2019-001",
  familyCardNumber: "3273010101010002",
  streetAddress: "Jl. Melati Nomor 10",
  rt: "1",
  rw: "2",
  hamlet: "",
  village: "Cipedes",
  subdistrict: "Sukajadi",
  city: "Bandung",
  province: "Jawa Barat",
  postalCode: "40162",
  residenceStatus: "with_parents",
  specialNeeds: "",
  pipEligible: false,
  kipNumber: "",
  previousSchoolName: "",
  previousSchoolNpsn: "",
  graduationDocumentNumber: "",
};

const parent = {
  fullName: "Budi Santoso",
  nik: "3273010101010001",
  birthPlace: "Bandung",
  birthDate: "1980-01-01",
  education: "SMA",
  occupation: "Wiraswasta",
  incomeRange: "Rp 3.000.000 - Rp 5.000.000",
  phone: "081234567890",
  address: "Jl. Melati Nomor 10, Bandung",
};

assert(StudentRegistrationFormSchema.safeParse(student).success, "complete student form must pass");
assert(!StudentRegistrationFormSchema.safeParse({ ...student, religion: "" }).success, "religion must be required");
assert(!StudentRegistrationFormSchema.safeParse({ ...student, nickname: "" }).success, "nickname must be required");
assert(!StudentRegistrationFormSchema.safeParse({ ...student, siblingsCount: -1 }).success, "siblingsCount must be non-negative");
assert(ParentRegistrationFormSchema.safeParse({ father: parent, mother: parent }).success, "complete parent form must pass");
assert(!ParentRegistrationFormSchema.safeParse({ father: { ...parent, nik: "123" }, mother: parent }).success, "father NIK must be exactly 16 digits");
assert(ParentRegistrationFormSchema.safeParse({ father: parent, mother: parent, guardian: parent }).success, "complete guardian form must pass");
assert(!ParentRegistrationFormSchema.safeParse({ father: parent, mother: parent, guardian: { ...parent, nik: "123" } }).success, "guardian NIK must be exactly 16 digits");
let guardianRequired = false;
try {
  assertGuardianRequiredForResidence("with_guardian", { father: parent, mother: parent });
} catch {
  guardianRequired = true;
}
assert(guardianRequired, "a guardian must be required when residence status is with_guardian");
assertGuardianRequiredForResidence("with_guardian", { father: parent, mother: parent, guardian: parent });
assert(isStudentRegistrationComplete(student, "sd"), "complete SD student record must be detected");
assert(isStudentRegistrationComplete({ ...student, nisn: null }, "sd"), "persisted optional NISN null must remain a complete student record");

const persistedNonTkStudent = {
  ...student,
  nisn: null,
  hamlet: null,
  specialNeeds: null,
  kipNumber: null,
  previousSchoolName: null,
  previousSchoolNpsn: null,
  graduationDocumentNumber: null,
  graduationYear: null,
  tkGroup: null,
};
assert(isStudentRegistrationComplete(persistedNonTkStudent, "sd"), "persisted SD optional nulls must not block the parent form");

const persistedPriorSchoolStudent = {
  ...persistedNonTkStudent,
  previousSchoolName: "SD Islam Terpadu Iqra",
  previousSchoolNpsn: "20212345",
  graduationDocumentNumber: "SKL-2026-001",
  graduationYear: 2026,
};
assert(isStudentRegistrationComplete(persistedPriorSchoolStudent, "smp"), "persisted SMP optional nulls must not block the parent form");
assert(isStudentRegistrationComplete(persistedPriorSchoolStudent, "sma"), "persisted SMA optional nulls must not block the parent form");
assert(!isStudentRegistrationComplete({ ...persistedNonTkStudent, tkGroup: null }, "tk"), "TK without an A/B group must remain incomplete");
assert(!isStudentRegistrationComplete({ ...student, transportation: null }, "sd"), "missing required student field must not be complete");

console.log("SPMB parent-form contract passed");
