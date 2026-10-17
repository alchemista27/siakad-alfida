import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Req,
} from "@nestjs/common";
import { InvitesService } from "./invites.service";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SpmbRolesGuard, SpmbRoles } from "../common/guards";

@Controller("invites")
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get(":token")
  async getDetails(@Param("token") token: string) {
    return this.invitesService.getInviteDetails(token);
  }

  @Post(":token/claim")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("orang_tua")
  async claim(@Param("token") token: string, @Req() req: any) {
    return this.invitesService.claimInvite(token, req.user);
  }

  @Get("share/:registrationId")
  @UseGuards(ServiceJwtAuthGuard, SpmbRolesGuard)
  @SpmbRoles("admin_unit", "tim_ppdb")
  async getWhatsAppLink(@Param("registrationId") registrationId: string) {
    return this.invitesService.getWhatsAppShareLink(registrationId);
  }
}
