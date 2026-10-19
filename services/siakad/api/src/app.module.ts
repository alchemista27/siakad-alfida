import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { AcademicYearsModule } from "./academic-years/academic-years.module";
import { ClassroomsModule } from "./classrooms/classrooms.module";
import { SubjectsModule } from "./subjects/subjects.module";
import { PlacementModule } from "./placement/placement.module";
import { TeachingWorkflowModule } from "./teaching/teaching-workflow.module";
import { LhbsModule } from "./lhbs/lhbs.module";
import { AdmissionHandoffModule } from "./admission-handoff/admission-handoff.module";
import { InternalModule } from "./internal/internal.module";
import { AssignmentsModule } from "./assignments/assignments.module";
import { SchedulesModule } from "./schedules/schedules.module";
import { UnitIdentityModule } from "./unit-identity/unit-identity.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { LessonPlansModule } from "./lesson-plans/lesson-plans.module";
import { ExtracurricularsModule } from "./extracurricular/extracurriculars.module";
import { PromotionModule } from "./promotion/promotion.module";
import { SpmbConfirmationModule } from "./spmb-confirmation/spmb-confirmation.module";
import { StudentDevelopmentModule } from "./student-development/student-development.module";
import { ParentPortalModule } from "./parent-portal/parent-portal.module";
import { MonitoringModule } from "./monitoring/monitoring.module";
import { ImporterModule } from "./importer/importer.module";
import { SppBillingModule } from "./spp-billing/spp-billing.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AcademicYearsModule,
    ClassroomsModule,
    SubjectsModule,
    PlacementModule,
    TeachingWorkflowModule,
    LhbsModule,
    AdmissionHandoffModule,
    InternalModule,
    AssignmentsModule,
    SchedulesModule,
    UnitIdentityModule,
    AttendanceModule,
    LessonPlansModule,
    ExtracurricularsModule,
    PromotionModule,
    SpmbConfirmationModule,
    StudentDevelopmentModule,
    ParentPortalModule,
    MonitoringModule,
    ImporterModule,
    SppBillingModule,
  ],
})
export class AppModule {}
