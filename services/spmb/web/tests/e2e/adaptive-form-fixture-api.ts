import { createServer, type ServerResponse } from "node:http";

const STUDENT_REGISTRATION_ID = "11111111-1111-4111-8111-111111111111";
const TK_STUDENT_REGISTRATION_ID = "33333333-3333-4333-8333-333333333334";
const PARENT_REGISTRATION_ID = "22222222-2222-4222-8222-222222222222";

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  });
  response.end(JSON.stringify(body));
}

const baseRegistration = {
  registrationNumber: "SPMB-2026-SMP-001",
  dossierReviewStatus: "pending",
  payment: null,
  documents: [],
  medicalReferral: null,
  observationBooking: null,
  observationResult: null,
  events: [],
  period: {
    id: "33333333-3333-4333-8333-333333333333",
    unitId: "44444444-4444-4444-8444-444444444444",
    unitName: "SMP Islam Terpadu Alfida",
    unitSlug: "smp-it-alfida",
    label: "SPMB 2026/2027",
    quota: 100,
    registeredCount: 1,
    availableSlots: 99,
    isFull: false,
    fee: 0,
    bankName: null,
    bankNumber: null,
    bankHolder: null,
    educationLevel: "smp",
    tkGroup: null,
  },
};

const studentRegistration = {
  ...baseRegistration,
  id: STUDENT_REGISTRATION_ID,
  status: "payment_verified",
  studentDataComplete: false,
  studentData: null,
  parentData: [],
};

const tkStudentRegistration = {
  ...studentRegistration,
  id: TK_STUDENT_REGISTRATION_ID,
  registrationNumber: "SPMB-2026-TK-001",
  period: {
    ...baseRegistration.period,
    unitName: "TK Islam Terpadu Alfida",
    unitSlug: "tk-it-alfida",
    educationLevel: "tk",
    tkGroup: null,
  },
};

const parentRegistration = {
  ...baseRegistration,
  id: PARENT_REGISTRATION_ID,
  status: "form_filling",
  studentDataComplete: true,
  studentData: {
    fullName: "Fulan Junior",
    nickname: "Fulan",
    gender: "male",
    religion: "Islam",
    birthPlace: "Bandung",
    birthDate: "2013-08-17T00:00:00.000Z",
    nisn: "0012345678",
    nik: "3273010101010001",
    birthCertificateNumber: "AKTA-2013-001",
    familyCardNumber: "3273010101010002",
    streetAddress: "Jl. Pendidikan No. 12",
    rt: "001",
    rw: "002",
    hamlet: null,
    village: "Cipedes",
    subdistrict: "Sukajadi",
    city: "Bandung",
    province: "Jawa Barat",
    postalCode: "40162",
    residenceStatus: "with_guardian",
    specialNeeds: null,
    pipEligible: false,
    kipNumber: null,
    previousSchoolName: "SD Alfida",
    previousSchoolNpsn: "20212345",
    graduationDocumentNumber: "SKL-2026-001",
    graduationYear: 2026,
    heightCm: null,
    weightKg: null,
    headCircumferenceCm: null,
    immunizationStatus: null,
    tkGroup: null,
    siblingsCount: 1,
    address: "Jl. Pendidikan No. 12, Bandung",
    transportation: "Diantar",
    hobby: null,
    ambition: null,
  },
  parentData: [
    {
      type: "father",
      fullName: "Ayah Fulan",
      nik: "3273010101010003",
      phone: "081234567891",
      occupation: "Guru",
      birthPlace: "Bandung",
      birthDate: "1980-01-01T00:00:00.000Z",
      education: "S1",
      incomeRange: "Rp 3.000.000 - Rp 5.000.000",
      address: "Bandung",
    },
    {
      type: "mother",
      fullName: "Ibu Fulan",
      nik: "3273010101010004",
      phone: "081234567892",
      occupation: "Wiraswasta",
      birthPlace: "Bandung",
      birthDate: "1982-01-01T00:00:00.000Z",
      education: "S1",
      incomeRange: "Rp 3.000.000 - Rp 5.000.000",
      address: "Bandung",
    },
    {
      type: "guardian",
      fullName: "Wali Fulan",
      nik: "3273010101010005",
      phone: "081234567893",
      occupation: "Wiraswasta",
      birthPlace: "Bandung",
      birthDate: "1978-01-01T00:00:00.000Z",
      education: "SMA",
      incomeRange: "Rp 3.000.000 - Rp 5.000.000",
      address: "Bandung",
    },
  ],
};

createServer((request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "127.0.0.1"}`);
  if (url.pathname === "/__e2e__/health") return json(response, 200, { ok: true });
  if (request.method !== "GET") return json(response, 405, { message: "Method not allowed" });
  if (url.pathname === `/api/registrations/parent/${STUDENT_REGISTRATION_ID}`) return json(response, 200, studentRegistration);
  if (url.pathname === `/api/registrations/parent/${TK_STUDENT_REGISTRATION_ID}`) return json(response, 200, tkStudentRegistration);
  if (url.pathname === `/api/registrations/parent/${PARENT_REGISTRATION_ID}`) return json(response, 200, parentRegistration);
  return json(response, 404, { message: "Fixture endpoint not found" });
}).listen(3201, "127.0.0.1", () => {
  console.log("SPMB adaptive-form E2E fixture listening on http://127.0.0.1:3201");
});
