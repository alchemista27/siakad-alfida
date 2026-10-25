import {
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
  address: "Jl. Melati Nomor 10, Bandung",
  transportation: "Diantar orang tua",
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
assert(isStudentRegistrationComplete(student), "complete student record must be detected");
assert(!isStudentRegistrationComplete({ ...student, transportation: null }), "missing required student field must not be complete");

console.log("SPMB parent-form contract passed");
