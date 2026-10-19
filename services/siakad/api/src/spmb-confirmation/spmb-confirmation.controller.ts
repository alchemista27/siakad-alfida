import { Controller, Post, UseGuards } from "@nestjs/common";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import { SpmbConfirmationService } from "./spmb-confirmation.service";

@Controller("spmb-confirmations")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class SpmbConfirmationController {
  constructor(private readonly confirmationService: SpmbConfirmationService) {}

  @Post("deliver-next")
  deliverNext() {
    return this.confirmationService.deliverNext();
  }
}
