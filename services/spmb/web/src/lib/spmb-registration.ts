import { isStudentRegistrationComplete } from "@alfida/contracts";

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

export class SpmbApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "SpmbApiError";
  }
}

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
  registeredCount: number;
  availableSlots: number;
  isFull: boolean;
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
    proofFileName?: string | null;
    proofFileSize?: number | null;
    proofMimeType?: string | null;
    status: string;
    rejectionNote?: string | null;
  } | null;
  studentData: {
    fullName: string;
    nickname: string | null;
    gender: "male" | "female";
    religion: string;
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
  studentData?: unknown | null;
}): string {
  const q = `?registrationId=${encodeURIComponent(reg.id)}`;
  switch (reg.status) {
    case "pending_payment":
    case "payment_uploaded":
      return `/parent/payment${q}`;
    case "payment_verified":
      return `/parent/form-student${q}`;
    case "form_filling":
      return isStudentRegistrationComplete(reg.studentData)
        ? `/parent/form-parents${q}`
        : `/parent/form-student${q}`;
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
  studentData?: unknown | null;
}): number {
  switch (reg.status) {
    case "pending_payment":
    case "payment_uploaded":
      return 1;
    case "payment_verified":
      return 2;
    case "form_filling":
      return isStudentRegistrationComplete(reg.studentData) ? 3 : 2;
    case "documents_uploaded":
      return 4;
    case "medical_pending":
    case "medical_uploaded":
      return 5;
    case "verification":
      return reg.dossierReviewStatus === "approved" ? 7 : 6;
    case "observation_scheduled":
    case "observation_done":
      return 7;
    case "accepted":
    case "rejected":
    case "enrolled":
      return 8;
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
    throw new SpmbApiError("Sesi autentikasi berakhir.", response.status);
  }
  if (!response.ok) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json") ? await response.json().catch(() => null) : null;
    throw new SpmbApiError(payload?.message || "Permintaan tidak dapat diproses.", response.status);
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

function getCloudinaryErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const error = (payload as { error?: unknown }).error;
  if (error && typeof error === "object" && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return typeof (payload as { message?: unknown }).message === "string"
    ? (payload as { message: string }).message
    : null;
}

export async function uploadSpmbFileToCloudinary(file: File, folder: string): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "hb1ropwm";
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "alfida_unsigned";
  if (!cloudName || !uploadPreset) throw new Error("Konfigurasi upload Cloudinary belum tersedia.");

  const data = new FormData();
  data.append("file", file);
  data.append("upload_preset", uploadPreset);
  data.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: data,
  });
  const payload: unknown = await response.json().catch(() => null);
  const fileUrl = (payload as { secure_url?: unknown } | null)?.secure_url;
  if (!response.ok || typeof fileUrl !== "string") {
    throw new Error(getCloudinaryErrorMessage(payload) || "Upload Cloudinary gagal.");
  }
  return fileUrl;
}

export async function uploadDocumentToCloudinary(
  registrationId: string,
  documentType: DocumentType,
  file: File,
) {
  const mimeType = file.type || "application/octet-stream";
  const fileUrl = await uploadSpmbFileToCloudinary(file, `spmb/${registrationId}/${documentType}`);
  return apiRequest("/api/documents/upsert", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      registrationId,
      documentType,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType,
    }),
  });
}

export async function uploadPaymentProofToCloudinary(registrationId: string, file: File) {
  const mimeType = file.type || "application/octet-stream";
  const fileUrl = await uploadSpmbFileToCloudinary(file, `spmb/${registrationId}/payment-proof`);
  return apiRequest(`/api/registrations/${encodeURIComponent(registrationId)}/payment-proof`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileUrl, fileName: file.name, fileSize: file.size, mimeType }),
  });
}
