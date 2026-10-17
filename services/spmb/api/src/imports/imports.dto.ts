import type { BackfillManifest } from "./backfill-manifest.policy";

export class ImportRowDto {
  externalRef?: string;
  studentName: string;
  gender: "male" | "female";
  birthPlace?: string;
  birthDate?: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail?: string;
  isPaid?: boolean;
  paidAmount?: number;
  observationScore?: number;
  observationNotes?: string;
  status?: string; // deprecated: ignored in favor of manifest-derived status
  manifest?: BackfillManifest;
}

export class BatchImportDto {
  periodId: string;
  rows: ImportRowDto[];
}
