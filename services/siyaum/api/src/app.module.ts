import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { SetoranModule } from "./setoran/setoran.module";
import { GroupsModule } from "./groups/groups.module";
import { DashboardModule } from "./dashboard/dashboard.module";

@Module({
  imports: [
    PrismaModule,
    SetoranModule,
    GroupsModule,
    DashboardModule,
  ],
})
export class AppModule {}
