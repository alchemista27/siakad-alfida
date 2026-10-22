export type LearningTrackInput = "pra_tahsin" | "tahsin" | "ziyadah";

export interface LearningProgressInput {
  track: LearningTrackInput;
  sequence: number;
  iwrCurriculumUnitId: string | null;
  surahNumber: number | null;
  ayahStart: number | null;
  ayahEnd: number | null;
}

export type DomainValidationResult = { valid: true } | { valid: false; reason: string };

const valid = (): DomainValidationResult => ({ valid: true });
const invalid = (reason: string): DomainValidationResult => ({ valid: false, reason });

export function validateSequence(sequence: number): DomainValidationResult {
  return Number.isInteger(sequence) && sequence >= 1
    ? valid()
    : invalid("Sequence progress harus berupa bilangan bulat positif yang dimulai dari 1.");
}

export function validateLearningProgressInput(input: LearningProgressInput): DomainValidationResult {
  const sequence = validateSequence(input.sequence);
  if (!sequence.valid) return sequence;

  if (input.track === "pra_tahsin") {
    return input.iwrCurriculumUnitId && input.surahNumber === null && input.ayahStart === null && input.ayahEnd === null
      ? valid()
      : invalid("Pra Tahsin wajib memakai unit IWR dan tidak boleh memakai referensi Al-Qur'an.");
  }

  const validSurah = Number.isInteger(input.surahNumber) && input.surahNumber! >= 1 && input.surahNumber! <= 114;
  if (!validSurah || input.iwrCurriculumUnitId !== null) {
    return invalid("Progress Al-Qur'an harus memakai nomor surah 1 sampai 114 tanpa unit IWR.");
  }

  if (input.track === "tahsin") {
    return Number.isInteger(input.ayahStart) && Number.isInteger(input.ayahEnd) && input.ayahStart! >= 1 && input.ayahEnd! >= input.ayahStart!
      ? valid()
      : invalid("Tahsin wajib memiliki rentang ayat yang berurutan.");
  }

  return input.ayahStart === null && input.ayahEnd === null
    ? valid()
    : invalid("Ziyadah dicatat per surah dan tidak boleh memiliki rentang ayat.");
}

export function validateCurriculumUnitInput(input: {
  topicCode: string;
  pageStart: number;
  pageEnd: number;
}): DomainValidationResult {
  return input.topicCode.trim().length > 0 && Number.isInteger(input.pageStart) && Number.isInteger(input.pageEnd) && input.pageStart >= 1 && input.pageEnd >= input.pageStart
    ? valid()
    : invalid("Kode topik dan rentang halaman IWR tidak valid.");
}
