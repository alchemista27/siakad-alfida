import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AssignmentsModule } from "./assignments/assignments.module";
import { EmployeesModule } from "./employees/employees.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { LeavesModule } from "./leaves/leaves.module";
import { UnitsModule } from "./units/units.module";
import { DepartmentsModule } from "./departments/departments.module";
import { OrganizationSyncModule } from "./organization-sync/organization-sync.module";
import { BpiModule } from "./bpi/bpi.module";
import { YmqEmployeeProjectionModule } from "./ymq-projection/ymq-employee-projection.module";

@Module({
  imports: [
    PrismaModule,
    AssignmentsModule,
    EmployeesModule,
    AttendanceModule,
    LeavesModule,
    UnitsModule,
    DepartmentsModule,
    OrganizationSyncModule,
    BpiModule,
    YmqEmployeeProjectionModule,
  ],
})
export class AppModule {}
