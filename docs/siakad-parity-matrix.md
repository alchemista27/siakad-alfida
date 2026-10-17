SIAKAD is the future source of truth for academic operations. Monolith `apps` becomes read-only compatibility during cutover, then those write routes are retired.

# SIAKAD Source-to-Target Parity Matrix

| Capability | Monolith source | Source Model(s) | Target API module | Target Web Route | Role(s) | Data Owner | Migration/Cutover Status | Test Script |
|---|---|---|---|---|---|---|---|---|
| Academic year | `apps/api/src/admin/admin.service.ts` | `AcademicYear` | `academic-years` | `/admin/academic-years` | `super_admin`, `admin_unit` | SIAKAD | Planned | `test-academic-years-contract.ts` |
| Class / PPDB placement / enrollment | `apps/api/src/academic/academic.service.ts:57-85` | `Class`, `Enrollment`, `Student` | `enrollments`, `placement` | `/admin/classes`, `/admin/enrollments` | `admin_unit` | SIAKAD | Planned | `test-siakad-handoff-receiver-contract.ts`, `test-placement-command-contract.ts` |
| Subjects | `academic.service.ts:8-27` | `Subject` | `subjects` | `/admin/subjects` | `admin_unit` | SIAKAD | Planned | `test-subjects-contract.ts` |
| Teacher + homeroom assignments | `academic.service.ts:30-55` | `TeacherAssignment`, `HomeroomAssignment` | `assignments` | `/admin/teaching-assignments` | `admin_unit` | SIAKAD, staff identity projected | Planned | `test-teaching-assignments-contract.ts` |
| Attendance / grades | `academic.service.ts:87-102` | `Attendance`, `Grade` | `attendance`, `grades` | `/teacher/attendance`, `/teacher/grades` | `guru`, `admin_unit` | SIAKAD | Planned | `test-attendance-contract.ts`, `test-grades-contract.ts` |
| Schedules / journals / lesson plans | `academic.service.ts:136-164` | `Schedule`, `TeachingJournal`, `LessonPlan` | `schedules`, `journals`, `lesson-plans` | `/teacher/schedules`, `/teacher/journals`, `/teacher/lesson-plans` | `guru`, `admin_unit` | SIAKAD | Planned | `test-teaching-workflow-contract.ts` |
| LHBS / promotion | `academic.service.ts:104-134` | `LhbsReport`, `PromotionDecision` | `lhbs`, `promotions` | `/teacher/lhbs`, `/admin/promotions`, `/parent/academic` | `wali_kelas`, `admin_unit`, `orang_tua` | SIAKAD | Planned | `test-lhbs-contract.ts`, `test-promotion-contract.ts` |
| Extracurricular | `academic.service.ts:166-210` | `Extracurricular`, `ExtracurricularMembership`, `ExtracurricularGrade` | `extracurricular` | `/admin/extracurricular`, `/teacher/extracurricular` | `supervisor_kesiswaan`, `admin_unit` | SIAKAD | Planned | `test-extracurricular-contract.ts` |
| SPP invoices | `apps/api/src/spp/*` | `SppInvoice` | N/A | N/A | `admin_keuangan` | Monolith / Finance (explicitly **out of scope** for first SIAKAD release; stays Finance/monolith until separately planned) | Deferred | N/A |
| BPI / infractions / student reports | separate monolith modules | `BpiRecord`, `Infraction` | N/A | N/A | `admin_unit`, `supervisor_kesiswaan` | Monolith (explicitly **out of scope**; do not silently copy) | Deferred | N/A |
