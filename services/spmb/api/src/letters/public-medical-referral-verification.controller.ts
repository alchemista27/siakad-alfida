import { Controller, Get, Param } from "@nestjs/common";
import { LettersService } from "./letters.service";

@Controller("public/medical-referrals")
export class PublicMedicalReferralVerificationController {
  constructor(private readonly lettersService: LettersService) {}

  @Get(":verificationToken")
  verify(@Param("verificationToken") verificationToken: string) {
    return this.lettersService.verifyMedicalReferral(verificationToken);
  }
}