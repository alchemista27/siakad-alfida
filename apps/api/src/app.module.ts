import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { PpdbModule } from './ppdb/ppdb.module';
import { AcademicModule } from './academic/academic.module';
import { SppModule } from './spp/spp.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    PpdbModule,
    AcademicModule,
    SppModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
