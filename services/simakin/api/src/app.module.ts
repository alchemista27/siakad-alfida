import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PrismaModule } from "./prisma/prisma.module";
import { StrategicModule } from "./strategic/strategic.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    StrategicModule,
  ],
})
export class AppModule {}
