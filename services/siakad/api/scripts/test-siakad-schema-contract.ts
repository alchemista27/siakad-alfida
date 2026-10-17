import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

function main() {
  const schemaPath = resolve(import.meta.dirname, "../prisma/schema.prisma");
  const schema = readFileSync(schemaPath, "utf8");

  // Model presence
  const requiredModels = [
    "UnitProjection",
    "UserProjection",
    "AcademicYear",
    "AdmissionReceipt",
    "Student",
    "Enrollment",
    "Classroom",
    "Subject",
    "TeacherAssignment",
    "HomeroomAssignment",
    "ClassSchedule",
    "Attendance",
    "Grade",
    "TeachingJournal",
    "LessonPlan",
    "Extracurricular",
    "ExtracurricularCoach",
    "ExtracurricularMembership",
    "ExtracurricularJournal",
    "ExtracurricularGrade",
    "LhbsReport",
    "PromotionDecision",
  ];

  for (const model of requiredModels) {
    assert.match(schema, new RegExp(`model\\s+${model}\\b`), `missing model ${model}`);
  }

  // Unique constraints per B2.1 & B2.2
  assert.match(schema, /model\s+AdmissionReceipt[\s\S]*?spmbRegistrationId\s+String\s+@unique/, "AdmissionReceipt must have unique spmbRegistrationId");
  assert.match(schema, /model\s+AdmissionReceipt[\s\S]*?idempotencyKey\s+String\s+@unique/, "AdmissionReceipt must have unique idempotencyKey");
  assert.match(schema, /model\s+Enrollment[\s\S]*?@@unique\(\[studentId,\s*academicYearId\]\)/, "Enrollment must have unique [studentId, academicYearId]");
  assert.match(schema, /model\s+Classroom[\s\S]*?@@unique\(\[unitId,\s*academicYearId,\s*name\]\)/, "Classroom must have unique [unitId, academicYearId, name]");
  assert.match(schema, /model\s+Subject[\s\S]*?@@unique\(\[unitId,\s*code\]\)/, "Subject must have unique [unitId, code]");
  assert.match(schema, /model\s+TeacherAssignment[\s\S]*?@@unique\(\[classId,\s*subjectId,\s*academicYearId\]\)/, "TeacherAssignment must have unique [classId, subjectId, academicYearId]");
  assert.match(schema, /model\s+HomeroomAssignment[\s\S]*?@@unique\(\[classId,\s*academicYearId\]\)/, "HomeroomAssignment must have unique [classId, academicYearId]");
  assert.match(schema, /model\s+Attendance[\s\S]*?@@unique\(\[enrollmentId,\s*scheduleId,\s*date\]\)/, "Attendance must have unique [enrollmentId, scheduleId, date]");
  assert.match(schema, /model\s+LhbsReport[\s\S]*?@@unique\(\[enrollmentId,\s*academicYearId,\s*semester\]\)/, "LhbsReport must have unique [enrollmentId, academicYearId, semester]");
  assert.match(schema, /model\s+AcademicYear[\s\S]*?@@unique\(\[unitId,\s*name\]\)/, "AcademicYear must have unique [unitId, name]");

  console.log("SIAKAD schema contract passed");
}

main();
