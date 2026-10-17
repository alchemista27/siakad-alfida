import { Controller, Post, Body, UseGuards } from "@nestjs/common";
import { PlacementService, type PlaceStudentDto } from "./placement.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("placement")
@UseGuards(SiakadAuthGuard)
export class PlacementController {
  constructor(private readonly placementService: PlacementService) {}

  @Post()
  async placeStudent(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: PlaceStudentDto) {
    return this.placementService.placeStudent(principal, dto);
  }
}
