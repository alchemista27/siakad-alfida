import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { PeriodsModule } from "./periods/periods.module";
import { RegistrationsModule } from "./registrations/registrations.module";
import { ImportsModule } from "./imports/imports.module";
import { InvitesModule } from "./invites/invites.module";
import { DocumentsModule } from "./documents/documents.module";
import { ObservationsModule } from "./observations/observations.module";
import { DecisionsModule } from "./decisions/decisions.module";
import { HandoffModule } from "./handoff/handoff.module";

@Module({
  imports: [
    PrismaModule,
    PeriodsModule,
    RegistrationsModule,
    ImportsModule,
    InvitesModule,
    DocumentsModule,
    ObservationsModule,
    DecisionsModule,
    HandoffModule,
  ],
})
export class AppModule {}
