import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { FoundationService } from "./foundation.service";
import { UpdateFoundationDto } from "./foundation.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { AdminRolesGuard, AdminRoles } from "../common/guards/admin-roles.guard";

@Controller()
export class FoundationController {
  constructor(private readonly foundationService: FoundationService) {}

  @Get("public/foundation-settings")
  async getPublicSettings() {
    return this.foundationService.getPublicSettings();
  }

  @Get("admin/foundation-settings")
  @UseGuards(ServiceJwtAuthGuard, AdminRolesGuard)
  @AdminRoles("super_admin")
  async getAdminSettings() {
    const data = await this.foundationService.getAdminSettings();
    return {
      success: true,
      data,
    };
  }

  @Put("admin/foundation-settings")
  @HttpCode(HttpStatus.OK)
  @UseGuards(ServiceJwtAuthGuard, AdminRolesGuard)
  @AdminRoles("super_admin")
  async updateSettings(@Body() body: UpdateFoundationDto) {
    return this.foundationService.updateSettings(body);
  }
}
