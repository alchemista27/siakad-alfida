import { Controller, Get, Param, Req, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRoles, SpmbRolesGuard } from "../common/guards";
import { LettersService } from "./letters.service";

@Controller("letters")
@UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
export class LettersController {
  constructor(private readonly lettersService: LettersService) {}

  @Get("acceptance/:registrationId")
  @SpmbRoles("orang_tua", "admin_unit", "tim_ppdb")
  async getAcceptanceLetter(@Param("registrationId") registrationId: string, @Req() req: any) {
    return this.lettersService.getAcceptanceLetter(registrationId, req.user);
  }
}
