import { createHash } from "node:crypto";
import {
  SPMB_HANDOFF_CONTRACT_VERSION,
  SpmbHandoffPayloadSchema,
  type SpmbHandoffPayload,
} from "@alfida/contracts";

type RegistrationForHandoff = {
  id: string;
  registrationNumber: string;
  period: {
    unitId: string;
    sourceAcademicYearId: string | null;
    id: string;
  };
  parent: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
  } | null;
  parentData: Array<{
    type: "father" | "mother" | "guardian";
    fullName: string;
    nik: string | null;
    birthPlace: string | null;
    birthDate: Date | null;
    education: string | null;
    occupation: string | null;
    phone: string | null;
    incomeRange: string | null;
    address: string | null;
  }>;
  studentData: {
    fullName: string;
    nickname: string | null;
    gender: "male" | "female";
    religion: string | null;
    birthPlace: string;
    birthDate: Date;
    nisn: string | null;
    address: string;
    siblingsCount: number | null;
    transportation: string | null;
    hobby: string | null;
    ambition: string | null;
    nik: string | null;
    birthCertificateNumber: string | null;
    familyCardNumber: string | null;
    streetAddress: string | null;
    rt: string | null;
    rw: string | null;
    hamlet: string | null;
    village: string | null;
    subdistrict: string | null;
    city: string | null;
    province: string | null;
    postalCode: string | null;
    residenceStatus: "with_parents" | "with_guardian" | "boarding" | "rented" | "other" | null;
    specialNeeds: string | null;
    pipEligible: boolean | null;
    kipNumber: string | null;
    previousSchoolName: string | null;
    previousSchoolNpsn: string | null;
    graduationDocumentNumber: string | null;
    graduationYear: number | null;
    heightCm: unknown;
    weightKg: unknown;
    headCircumferenceCm: unknown;
    immunizationStatus: "complete" | "incomplete" | "unknown" | null;
  } | null;
};

function toIso(value: Date) {
  return value.toISOString();
}

function decimalToNumber(value: unknown): number | null {
  if (value == null) return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : null;
}

export function buildSpmbHandoffPayload(
  registration: RegistrationForHandoff,
  idempotencyKey: string,
): SpmbHandoffPayload {
  if (!registration.parent || !registration.studentData) {
    throw new Error("Pendaftaran harus memiliki identitas orang tua dan biodata murid sebelum handoff.");
  }

  const student = registration.studentData;
  const payload = {
    contractVersion: SPMB_HANDOFF_CONTRACT_VERSION,
    idempotencyKey,
    spmbRegistrationId: registration.id,
    registrationNumber: registration.registrationNumber,
    sourceAcademicYearId: registration.period.sourceAcademicYearId || registration.period.id,
    unitId: registration.period.unitId,
    portalParent: {
      id: registration.parent.id,
      fullName: registration.parent.fullName,
      email: registration.parent.email,
      phone: registration.parent.phone,
    },
    guardians: [...registration.parentData]
      .sort((left, right) => left.type.localeCompare(right.type))
      .map((guardian) => ({
        type: guardian.type,
        fullName: guardian.fullName,
        nik: guardian.nik,
        birthPlace: guardian.birthPlace,
        birthDate: guardian.birthDate ? toIso(guardian.birthDate) : null,
        education: guardian.education,
        occupation: guardian.occupation,
        phone: guardian.phone,
        incomeRange: guardian.incomeRange,
        address: guardian.address,
      })),
    student: {
      fullName: student.fullName,
      nickname: student.nickname,
      gender: student.gender,
      religion: student.religion,
      birthPlace: student.birthPlace,
      birthDate: toIso(student.birthDate),
      nisn: student.nisn,
      address: student.address,
      siblingsCount: student.siblingsCount,
      transportation: student.transportation,
      hobby: student.hobby,
      ambition: student.ambition,
      dapodik: {
        nik: student.nik,
        birthCertificateNumber: student.birthCertificateNumber,
        familyCardNumber: student.familyCardNumber,
        streetAddress: student.streetAddress,
        rt: student.rt,
        rw: student.rw,
        hamlet: student.hamlet,
        village: student.village,
        subdistrict: student.subdistrict,
        city: student.city,
        province: student.province,
        postalCode: student.postalCode,
        residenceStatus: student.residenceStatus,
        specialNeeds: student.specialNeeds,
        pipEligible: student.pipEligible,
        kipNumber: student.kipNumber,
        previousSchoolName: student.previousSchoolName,
        previousSchoolNpsn: student.previousSchoolNpsn,
        graduationDocumentNumber: student.graduationDocumentNumber,
        graduationYear: student.graduationYear,
        heightCm: decimalToNumber(student.heightCm),
        weightKg: decimalToNumber(student.weightKg),
        headCircumferenceCm: decimalToNumber(student.headCircumferenceCm),
        immunizationStatus: student.immunizationStatus,
      },
    },
  };

  return SpmbHandoffPayloadSchema.parse(payload);
}

export function hashSpmbHandoffPayload(payload: SpmbHandoffPayload) {
  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}
