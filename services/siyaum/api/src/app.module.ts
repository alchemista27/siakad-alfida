import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { SetoranModule } from "./setoran/setoran.module";
import { GroupsModule } from "./groups/groups.module";
import { DashboardModule } from "./dashboard/dashboard.module";
import { CurriculumModule } from "./curriculum/curriculum.module";
import { YmqEmployeesModule } from "./employees/ymq-employees.module";
import { GroupStaffModule } from "./group-staff/group-staff.module";
import { SessionsModule } from "./sessions/sessions.module";
import { EvidenceModule } from "./evidence/evidence.module";

@Module({
  imports: [
    PrismaModule,
    SetoranModule,
    GroupsModule,
    DashboardModule,
    CurriculumModule,
    YmqEmployeesModule,
    GroupStaffModule,
    SessionsModule,
    EvidenceModule,
  ],
})
export class AppModule {}
