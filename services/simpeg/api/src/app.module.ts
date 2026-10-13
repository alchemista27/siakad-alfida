import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AssignmentsModule } from "./assignments/assignments.module";
import { EmployeesModule } from "./employees/employees.module";
import { AttendanceModule } from "./attendance/attendance.module";
import { LeavesModule } from "./leaves/leaves.module";
import { BpiModule } from "./bpi/bpi.module";

@Module({
  imports: [
    PrismaModule,
    AssignmentsModule,
    EmployeesModule,
    AttendanceModule,
    LeavesModule,
    BpiModule,
  ],
})
export class AppModule {}
