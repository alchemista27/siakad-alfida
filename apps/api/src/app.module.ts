import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PpdbModule } from './ppdb/ppdb.module';
import { AcademicModule } from './academic/academic.module';
import { SppModule } from './spp/spp.module';
import { HrModule } from './hr/hr.module';
import { BpiModule } from './bpi/bpi.module';
import { StrategicModule } from './strategic/strategic.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SecretariatModule } from './secretariat/secretariat.module';
import { InventoryModule } from './sarpras/inventory/inventory.module';
import { CommonModule } from './common/common.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    AuthModule,
    AdminModule,
    PpdbModule,
    AcademicModule,
    SppModule,
    HrModule,
    BpiModule,
    StrategicModule,
    SecretariatModule,
    InventoryModule,
    CommonModule,
  ],
})
export class AppModule {}
