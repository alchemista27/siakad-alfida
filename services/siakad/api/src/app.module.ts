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
  ],
})
export class AppModule {}
