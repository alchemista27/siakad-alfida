import {
  DapodikStudentFieldsSchema,
  EducationLevelSchema,
  REQUIRED_DOCUMENT_TYPES_BY_LEVEL,
  assertLevelSpecificStudentFields,
} from "@alfida/contracts";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expectReject(label: string, action: () => unknown) {
  try {
    action();
    throw new Error(`${label}: unexpectedly succeeded`);
  } catch (error) {
    if (error instanceof Error && error.message.endsWith("unexpectedly succeeded")) throw error;
  }
}

const common = {
  nik: "3273010101010001",
  birthCertificateNumber: "AKTA-2019-001",
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
};

function run() {
  for (const level of ["tk", "sd", "smp", "sma"]) {
    assert(EducationLevelSchema.safeParse(level).success, `level ${level} must be valid`);
  }
  assert(!EducationLevelSchema.safeParse("pesantren").success, "unknown level must be rejected");

  assert(DapodikStudentFieldsSchema.safeParse(common).success, "complete common Dapodik fields must parse");
  assert(!DapodikStudentFieldsSchema.safeParse({ ...common, nik: "123" }).success, "student NIK must contain sixteen digits");
  assert(!DapodikStudentFieldsSchema.safeParse({ ...common, familyCardNumber: "123" }).success, "family card number must contain sixteen digits");
  assert(!DapodikStudentFieldsSchema.safeParse({ ...common, postalCode: "4016" }).success, "postal code must contain five digits");

  assert(REQUIRED_DOCUMENT_TYPES_BY_LEVEL.smp.includes("school_certificate"), "SMP must require a school certificate");
  assert(REQUIRED_DOCUMENT_TYPES_BY_LEVEL.sma.includes("school_certificate"), "SMA must require a school certificate");
  assert(!REQUIRED_DOCUMENT_TYPES_BY_LEVEL.tk.includes("school_certificate"), "TK must not require a school certificate");
  assert(!REQUIRED_DOCUMENT_TYPES_BY_LEVEL.sd.includes("school_certificate"), "SD must not require a school certificate");

  expectReject("SMP must require prior-school data", () => assertLevelSpecificStudentFields("smp", common));
  expectReject("TK parent must choose group", () => assertLevelSpecificStudentFields("tk", common));
  assertLevelSpecificStudentFields("tk", { ...common, tkGroup: "a" });
  expectReject("non-TK must not carry a TK group", () => assertLevelSpecificStudentFields("sd", { ...common, tkGroup: "a" }));
  expectReject("PIP eligibility requires a KIP number", () => assertLevelSpecificStudentFields("sd", { ...common, pipEligible: true }));

  console.log("SPMB Dapodik adaptive-form policy contract passed");
}

run();
