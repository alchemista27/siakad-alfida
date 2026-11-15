import { RegistrationsService } from "../src/registrations/registrations.service";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

const completeStudent = {
  fullName: "Ahmad Fauzi",
  nickname: "Ahmad",
  gender: "male",
  religion: "Islam",
  birthPlace: "Bandung",
  birthDate: new Date("2019-05-10"),
  nisn: null,
  siblingsCount: 2,
  transportation: "Diantar orang tua",
  nik: "3273010101010001",
  birthCertificateNumber: "AKTA-2019-001",
  familyCardNumber: "3273010101010002",
  streetAddress: "Jl. Melati Nomor 10",
  rt: "1",
  rw: "2",
  hamlet: null,
  village: "Cipedes",
  subdistrict: "Sukajadi",
  city: "Bandung",
  province: "Jawa Barat",
  postalCode: "40162",
  residenceStatus: "with_parents",
  specialNeeds: null,
  pipEligible: false,
  kipNumber: null,
  previousSchoolName: null,
  previousSchoolNpsn: null,
  graduationDocumentNumber: null,
  graduationYear: null,
  tkGroup: null,
};

const service = new RegistrationsService({} as any);
const complete = (service as any).sanitizeForParent({
  id: "reg-complete",
  period: { educationLevel: "sd" },
  studentData: completeStudent,
});
const incomplete = (service as any).sanitizeForParent({
  id: "reg-incomplete",
  period: { educationLevel: "sd" },
  studentData: { ...completeStudent, transportation: null },
});

assert(complete.studentDataComplete === true, "parent payload must declare complete persisted murid data");
assert(incomplete.studentDataComplete === false, "parent payload must declare incomplete persisted murid data");

console.log("SPMB parent-form navigation contract passed");
