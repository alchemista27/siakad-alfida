export type RegistrationStatus =
  | "pending_payment"
  | "payment_uploaded"
  | "payment_verified"
  | "form_filling"
  | "documents_uploaded"
  | "medical_pending"
  | "medical_uploaded"
  | "verification"
  | "observation_scheduled"
  | "observation_done"
  | "accepted"
  | "rejected"
  | "enrolled";

export type DossierReviewStatus = "pending" | "approved" | "revision_required";

export type DocumentType =
  | "photo"
  | "school_certificate"
  | "birth_certificate"
  | "family_card"
  | "father_id"
  | "mother_id"
  | "medical_result";

export interface PeriodSummary {
  id: string;
  unitId?: string;
  unitName: string;
  unitSlug: string;
  label: string;
  quota: number;
  fee: number;
  bankName: string | null;
  bankNumber: string | null;
  bankHolder: string | null;
}

export interface ParentRecord {
  type: "father" | "mother" | "guardian";
  fullName: string;
  nik: string | null;
  phone: string | null;
  occupation: string | null;
  birthPlace: string | null;
  birthDate: string | null;
  education: string | null;
  incomeRange: string | null;
  address: string | null;
}

export interface ParentRegistration {
  id: string;
  registrationNumber: string;
  status: RegistrationStatus;
  dossierReviewStatus?: DossierReviewStatus;
  rejectionReason?: string | null;
  period: PeriodSummary;
  payment: {
    amount: number;
    proofUrl: string | null;
    status: string;
    rejectionNote?: string | null;
  } | null;
  studentData: {
    fullName: string;
    nickname: string | null;
    gender: "male" | "female";
    birthPlace: string;
    birthDate: string;
    nisn: string | null;
    siblingsCount: number;
    address: string;
    transportation: string | null;
    hobby: string | null;
    ambition: string | null;
  } | null;
  parentData: ParentRecord[];
  documents: Array<{
    id: string;
    type: DocumentType;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
  medicalReferral?: {
    referralNumber: string;
    issuedAt: string;
  } | null;
  observationBooking: {
    schedule: {
      id?: string;
      date: string;
      startTime: string;
      endTime: string;
    };
  } | null;
  observationResult?: { recorded?: boolean } | null;
  events: Array<{ toStatus: string; kind: string; note: string | null; createdAt: string }>;
}

export const STATUS_LABELS: Record<RegistrationStatus, string> = {
  pending_payment: "Menunggu pembayaran",
  payment_uploaded: "Bukti pembayaran sedang diperiksa",
  payment_verified: "Pembayaran telah terverifikasi",
  form_filling: "Lengkapi biodata",
  documents_uploaded: "Lengkapi berkas persyaratan",
  medical_pending: "Unggah hasil pemeriksaan kesehatan",
  medical_uploaded: "Hasil kesehatan sedang diperiksa",
  verification: "Berkas sedang diverifikasi panitia",
  observation_scheduled: "Jadwal observasi telah dipilih",
  observation_done: "Observasi selesai — menunggu keputusan",
  accepted: "Diterima",
  rejected: "Belum diterima",
  enrolled: "Daftar ulang selesai",
};

export const DOCUMENT_LABELS: Record<DocumentType, string> = {
  photo: "Pas foto calon siswa",
  school_certificate: "Surat keterangan sekolah asal",
  birth_certificate: "Akta kelahiran",
  family_card: "Kartu keluarga",
  father_id: "KTP ayah",
  mother_id: "KTP ibu",
  medical_result: "Hasil pemeriksaan kesehatan / IMC",
};

export const BASE_DOCUMENT_TYPES: DocumentType[] = [
  "photo",
  "birth_certificate",
  "family_card",
  "father_id",
  "mother_id",
];

export function getStageRouteForRegistration(reg: {
  id: string;
  status: RegistrationStatus;
  dossierReviewStatus?: DossierReviewStatus;
}): string {
  const q = `?registrationId=${encodeURIComponent(reg.id)}`;
  switch (reg.status) {
    case "pending_payment":
    case "payment_uploaded":
      return `/parent/payment${q}`;
    case "payment_verified":
    case "form_filling":
      return `/parent/biodata${q}`;
    case "documents_uploaded":
      return `/parent/documents${q}`;
    case "medical_pending":
    case "medical_uploaded":
      return `/parent/medical${q}`;
    case "verification":
      return reg.dossierReviewStatus === "approved"
        ? `/parent/observation${q}`
        : `/parent/medical${q}`;
    case "observation_scheduled":
    case "observation_done":
      return `/parent/observation${q}`;
    case "accepted":
    case "rejected":
    case "enrolled":
      return `/parent/result${q}`;
  }
}

export function getStepIndexForRegistration(reg: {
  status: RegistrationStatus;
  dossierReviewStatus?: DossierReviewStatus;
}): number {
  switch (reg.status) {
    case "pending_payment":
    case "payment_uploaded":
      return 0;
    case "payment_verified":
    case "form_filling":
      return 1;
    case "documents_uploaded":
      return 2;
    case "medical_pending":
    case "medical_uploaded":
      return 3;
    case "verification":
      return reg.dossierReviewStatus === "approved" ? 4 : 3;
    case "observation_scheduled":
    case "observation_done":
      return 4;
    case "accepted":
    case "rejected":
    case "enrolled":
      return 5;
  }
}

export async function apiRequest<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(url, { credentials: "include", ...options });
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.assign(
        `https://auth.alfida.or.id/login?return_to=${encodeURIComponent(window.location.href)}`,
      );
    }
    throw new Error("Sesi autentikasi berakhir.");
  }
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : null;
    throw new Error(payload?.message || "Permintaan tidak dapat diproses.");
  }
  return (response.status === 204 ? null : await response.json()) as T;
}

export async function loadParentRegistration(registrationId?: string | null): Promise<ParentRegistration | null> {
  if (registrationId) {
    return apiRequest<ParentRegistration>(`/api/registrations/parent/${encodeURIComponent(registrationId)}`);
  }
  const list = await apiRequest<ParentRegistration[]>("/api/registrations/parent");
  if (!list || list.length === 0) return null;
  return apiRequest<ParentRegistration>(`/api/registrations/parent/${encodeURIComponent(list[0].id)}`);
}

export async function uploadPrivateDocument(
  registrationId: string,
  documentType: DocumentType,
  file: File,
) {
  const mimeType = file.type || "application/octet-stream";
  const presign = await apiRequest<{ uploadUrl: string; objectKey: string }>("/api/documents/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      registrationId,
      documentType,
      fileName: file.name,
      mimeType,
      fileSize: file.size,
    }),
  });

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": mimeType },
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error("Gagal mengunggah dokumen ke penyimpanan privat.");
  }

  return apiRequest("/api/documents/upsert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      registrationId,
      documentType,
      objectKey: presign.objectKey,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
    }),
  });
}
