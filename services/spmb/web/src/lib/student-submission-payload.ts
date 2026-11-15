import type { EducationLevel } from "@alfida/contracts";

type StudentSubmissionInput = {
  siblingsCount: string;
  graduationYear: string;
  tkGroup: "" | "a" | "b";
  [key: string]: unknown;
};

export function buildStudentSubmissionPayload(input: StudentSubmissionInput, level: EducationLevel) {
  const { tkGroup, siblingsCount, graduationYear, ...rest } = input;
  return {
    ...rest,
    siblingsCount: Number(siblingsCount),
    graduationYear: graduationYear ? Number(graduationYear) : undefined,
    ...(level === "tk" && tkGroup ? { tkGroup } : {}),
  };
}
