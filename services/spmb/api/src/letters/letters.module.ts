import { Module } from "@nestjs/common";
import { LettersController } from "./letters.controller";
import { LettersService } from "./letters.service";
import { FoundationBrandingClient, SPMB_FOUNDATION_BRANDING_FETCH } from "./foundation-branding.client";
import { SPMB_UNIT_LETTERHEAD_FETCH, UnitLetterheadClient } from "./unit-letterhead.client";

@Module({
  controllers: [LettersController],
  providers: [
    LettersService,
    UnitLetterheadClient,
    FoundationBrandingClient,
    { provide: SPMB_UNIT_LETTERHEAD_FETCH, useValue: fetch },
    { provide: SPMB_FOUNDATION_BRANDING_FETCH, useValue: fetch },
  ],
  exports: [LettersService],
})
export class LettersModule {}
