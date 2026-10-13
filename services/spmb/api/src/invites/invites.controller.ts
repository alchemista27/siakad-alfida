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

@Controller("invites")
export class InvitesController {
  constructor(private readonly invitesService: InvitesService) {}

  @Get(":token")
  async getDetails(@Param("token") token: string) {
    return this.invitesService.getInviteDetails(token);
  }

  @Post(":token/claim")
  @UseGuards(ServiceJwtAuthGuard)
  async claim(@Param("token") token: string, @Req() req: any) {
    return this.invitesService.claimInvite(token, req.user.id);
  }

  @Get("share/:registrationId")
  @UseGuards(ServiceJwtAuthGuard)
  async getWhatsAppLink(@Param("registrationId") registrationId: string) {
    return this.invitesService.getWhatsAppShareLink(registrationId);
  }
}
