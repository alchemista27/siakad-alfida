# SIAKAD Staged Data Migration and Cutover Guide

## Overview
SIAKAD is the authoritative microservice for academic operations (academic years, classrooms, subjects, teacher assignments, student enrollments, attendances, grades, journals, and LHBS reports).

During cutover, the legacy monolith (`apps/api`) transitions from write-master to read-only compatibility proxy, and write traffic is directed exclusively to `services/siakad/api`.

## Migration Stages

### Stage 1: Pre-cutover Verification (Shadow Mode)
1. Verify SIAKAD schema in PostgreSQL (`siakad` schema) has all required tables and constraints:
   - `unit_projections`, `user_projections`, `academic_years`, `admission_receipts`, `students`, `enrollments`, `classrooms`, `subjects`, `teacher_assignments`, `homeroom_assignments`, `class_schedules`, `attendances`, `grades`, `teaching_journals`, `lesson_plans`, `extracurriculars`, `lhbs_reports`, `promotion_decisions`.
2. Validate that SPMB accepted applicant handoff endpoint (`/admission-handoff`) idempotently processes accepted registrations.
3. Run all test contracts:
   ```bash
   cd services/siakad/api
   for f in scripts/*.ts; do npm exec --yes --package tsx -- "$f"; done
   ```

### Stage 2: Initial Historical Data Extraction
1. Sync unit and user projections from `shared` schema into `siakad.unit_projections` and `siakad.user_projections`.
2. Migrate active academic years from `sim.academic_years` to `siakad.academic_years`.
3. Migrate subjects and classrooms.
4. Migrate student enrollments and assignments.

### Stage 3: Cutover Maintenance Window
1. Monolith write routes for academic entities (e.g. `POST /api/academic/grades`, `POST /api/academic/attendance`) return HTTP 308 or redirect to SIAKAD API, or run in dual-write verification mode.
2. Set SIAKAD as authoritative source of truth.

### Stage 4: Post-cutover Cleanup
1. Decommission legacy monolith academic mutation endpoints.
2. Maintain read-only historical lookup if needed.
