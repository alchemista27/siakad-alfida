import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import { ImporterService, type CreateImportSourceMappingDto, type ImportDryRunDto } from "./importer.service";

@Controller("importer")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class ImporterController {
  constructor(private readonly importerService: ImporterService) {}

  @Get("mappings")
  listMappings(@CurrentPrincipal() principal: SiakadPrincipal) {
    return this.importerService.listMappings(principal);
  }

  @Post("mappings")
  createMapping(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateImportSourceMappingDto) {
    return this.importerService.createMapping(principal, dto);
  }

  @Post("dry-run")
  dryRun(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: ImportDryRunDto) {
    return this.importerService.dryRun(principal, dto);
  }
}
