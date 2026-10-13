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
  status?: string; // contoh: accepted, observation_done, payment_verified, dll.
}

export class BatchImportDto {
  periodId: string;
  rows: ImportRowDto[];
}
