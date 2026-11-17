export type ExaminerAssignmentTarget = "pembina" | "peserta";
export type ExaminerAssignmentGender = "ikhwan" | "akhwat";
export type ExaminerAssignmentLevel = "pra_tahsin" | "tahsin" | "tahfiz";

export class CreateExaminerAssignmentDto {
  academicYear!: string;
  examinerUserId!: string;
  target!: ExaminerAssignmentTarget;
  gender!: ExaminerAssignmentGender;
  unitId?: string | null;
  levels!: ExaminerAssignmentLevel[];
}
