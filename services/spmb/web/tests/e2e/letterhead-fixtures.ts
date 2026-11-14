export const COMPLETE_UNIT_ID = "11111111-1111-4111-8111-111111111111";
export const FOUNDATION_FALLBACK_ID = "22222222-2222-4222-8222-222222222222";
export const MEDICAL_FOUNDATION_ID = "33333333-3333-4333-8333-333333333333";
export const INVALID_MODE_ID = "invalid-letterhead-kind";

const FOUNDATION = {
  foundationName: "Yayasan Alfida E2E",
  foundationAddress: "Jl. Yayasan E2E No. 1",
  foundationPhone: "021-990001",
  foundationEmail: "yayasan-e2e@alfida.test",
  foundationLogoUrl: "https://res.cloudinary.com/alfida-e2e/image/upload/foundation/logo.png",
};

export function acceptanceLetter(kind: "unit" | "foundation") {
  const isUnit = kind === "unit";
  return {
    registrationNumber: isUnit ? "REG-E2E-UNIT" : "REG-E2E-FOUNDATION",
    academicYearLabel: "2027/2028",
    studentName: "Peserta E2E",
    decisionNote: null,
    issuedAt: "2026-11-14T00:00:00.000Z",
    letterheadKind: kind,
    unitName: isUnit ? "SDIT Iqra E2E" : "SDIT Identitas Belum Lengkap",
    unitAddress: isUnit ? "Jl. Unit Lengkap No. 1" : null,
    unitPhone: isUnit ? "021-990002" : null,
    unitEmail: isUnit ? "unit-e2e@alfida.test" : null,
    unitLogoUrl: isUnit ? "https://res.cloudinary.com/alfida-e2e/image/upload/unit/logo.png" : null,
    ...FOUNDATION,
  };
}

export function medicalReferralLetter() {
  return {
    ...acceptanceLetter("foundation"),
    referralNumber: "REF-E2E-001",
    verificationToken: "a".repeat(64),
    birthPlace: "Bekasi",
    birthDate: "2019-01-01T00:00:00.000Z",
    gender: "male" as const,
  };
}

export function parentRegistration(id: string, status: "accepted" | "medical_pending") {
  return {
    id,
    registrationNumber: status === "accepted" ? "REG-E2E-UNIT" : "REG-E2E-MEDICAL",
    status,
    studentDataComplete: true,
    period: {
      id: "period-e2e",
      unitId: "unit-e2e",
      unitName: "SDIT Iqra E2E",
      unitSlug: "sdit-iqra-e2e",
      label: "SPMB 2027/2028",
      quota: 50,
      registeredCount: 1,
      availableSlots: 49,
      isFull: false,
      fee: 0,
      bankName: null,
      bankNumber: null,
      bankHolder: null,
    },
    payment: null,
    studentData: {
      fullName: "Peserta E2E",
      nickname: null,
      gender: "male",
      religion: "Islam",
      birthPlace: "Bekasi",
      birthDate: "2019-01-01T00:00:00.000Z",
      nisn: null,
      siblingsCount: 0,
      address: "Jl. Contoh",
      transportation: null,
      hobby: null,
      ambition: null,
    },
    parentData: [],
    documents: [],
    medicalReferral: status === "medical_pending"
      ? { referralNumber: "REF-E2E-001", issuedAt: "2026-11-14T00:00:00.000Z" }
      : null,
    observationBooking: null,
    events: [],
  };
}
