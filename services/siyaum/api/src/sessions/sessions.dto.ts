export class UpsertLearningSessionDto {
  notes?: string;
  attendance: Array<{ memberId: string; status: "hadir" | "izin" | "sakit" | "alpa"; note?: string | null }>;
  progress: Array<{
    memberId: string;
    track: "pra_tahsin" | "tahsin" | "ziyadah";
    sequence: number;
    iwrCurriculumUnitId: string | null;
    surahNumber: number | null;
    ayahStart: number | null;
    ayahEnd: number | null;
    note?: string | null;
  }>;
}

export class LearningSessionQueryDto {
  groupId?: string;
  from?: string;
  to?: string;
}
