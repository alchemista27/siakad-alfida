import { RegistrationStatus } from "../generated/prisma";
import { baseRequiredDocumentTypes } from "../common/ppdb-workflow";

export type BackfillManifest = {
  payment?: { verified: boolean; paidAt?: string; amount?: number };
  student?: { fullName: string; gender: "male" | "female"; birthPlace: string; birthDate: string; address: string };
  documents?: Array<{ type: string; objectKey: string; fileName: string; mimeType: string; fileSize: number }>;
  medical?: { objectKey: string; referralNumber?: string };
  observation?: { scheduleId: string; score: number; notes?: string; observerId: string };
  decision?: { status: "accepted" | "rejected"; note?: string };
};

export function hasCompleteStudentData(student?: BackfillManifest["student"]): boolean {
  return Boolean(
    student &&
      student.fullName?.trim() &&
      (student.gender === "male" || student.gender === "female") &&
      student.birthPlace?.trim() &&
      student.birthDate &&
      !Number.isNaN(Date.parse(student.birthDate)) &&
      student.address?.trim(),
  );
}

export function hasCompleteBaseDocuments(documents?: BackfillManifest["documents"]): boolean {
  if (!documents || documents.length === 0) return false;
  return baseRequiredDocumentTypes.every((requiredType) =>
    documents.some((doc) => doc.type === requiredType && doc.objectKey?.trim()),
  );
}

export function hasCompleteMedical(medical?: BackfillManifest["medical"]): boolean {
  return Boolean(medical && medical.objectKey?.trim());
}

export function hasCompleteObservation(observation?: BackfillManifest["observation"]): boolean {
  return Boolean(
    observation &&
      typeof observation.score === "number" &&
      observation.score >= 0 &&
      observation.score <= 100 &&
      observation.observerId?.trim() &&
      observation.scheduleId?.trim(),
  );
}

export function deriveStatusFromManifest(manifest?: BackfillManifest): RegistrationStatus {
  if (!manifest || !manifest.payment?.verified) {
    return RegistrationStatus.pending_payment;
  }

  // Payment is verified
  if (!hasCompleteStudentData(manifest.student)) {
    return RegistrationStatus.payment_verified;
  }

  // Student data is complete
  if (!hasCompleteBaseDocuments(manifest.documents)) {
    return RegistrationStatus.form_filling;
  }

  // Base documents complete
  if (!hasCompleteMedical(manifest.medical)) {
    return RegistrationStatus.documents_uploaded;
  }

  // Medical complete
  if (!hasCompleteObservation(manifest.observation)) {
    return RegistrationStatus.verification;
  }

  // Observation complete
  if (manifest.decision && (manifest.decision.status === "accepted" || manifest.decision.status === "rejected")) {
    return manifest.decision.status === "accepted" ? RegistrationStatus.accepted : RegistrationStatus.rejected;
  }

  return RegistrationStatus.observation_done;
}

export type ManifestEventRecord = {
  toStatus: RegistrationStatus;
  kind: string;
  note: string;
};

export function buildManifestEventTrail(
  manifest: BackfillManifest | undefined,
  initialNote: string,
): ManifestEventRecord[] {
  const events: ManifestEventRecord[] = [
    {
      toStatus: RegistrationStatus.pending_payment,
      kind: "registration",
      note: initialNote,
    },
  ];

  if (!manifest || !manifest.payment?.verified) {
    return events;
  }

  events.push({
    toStatus: RegistrationStatus.payment_verified,
    kind: "payment",
    note: `Pembayaran luring telah diverifikasi. Jumlah: Rp${(manifest.payment.amount ?? 0).toLocaleString("id-ID")}`,
  });

  if (!hasCompleteStudentData(manifest.student)) {
    return events;
  }

  events.push({
    toStatus: RegistrationStatus.form_filling,
    kind: "form",
    note: `Biodata santri ${manifest.student!.fullName} telah dilengkapi.`,
  });

  if (!hasCompleteBaseDocuments(manifest.documents)) {
    return events;
  }

  events.push({
    toStatus: RegistrationStatus.documents_uploaded,
    kind: "documents",
    note: "Berkas persyaratan pendaftaran luring lengkap.",
  });

  if (!hasCompleteMedical(manifest.medical)) {
    return events;
  }

  events.push({
    toStatus: RegistrationStatus.verification,
    kind: "medical",
    note: "Pemeriksaan kesehatan telah diunggah dan terverifikasi.",
  });

  if (!hasCompleteObservation(manifest.observation)) {
    return events;
  }

  events.push({
    toStatus: RegistrationStatus.observation_done,
    kind: "observation",
    note: `Observasi seleksi selesai. Skor: ${manifest.observation!.score}. Penilai: ${manifest.observation!.observerId}`,
  });

  if (manifest.decision && (manifest.decision.status === "accepted" || manifest.decision.status === "rejected")) {
    const isAccepted = manifest.decision.status === "accepted";
    events.push({
      toStatus: isAccepted ? RegistrationStatus.accepted : RegistrationStatus.rejected,
      kind: "decision",
      note: manifest.decision.note || `Keputusan seleksi: ${isAccepted ? "DITERIMA (ACCEPTED)" : "DITOLAK (REJECTED)"}`,
    });
  }

  return events;
}
