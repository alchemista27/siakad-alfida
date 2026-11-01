import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { InternalYmqRoleBrokerGuard } from "../ymq-role-broker/internal-ymq-role-broker.guard";
import { validateYmqRosterPreviewInput, validateYmqRosterProvisionInput } from "./ymq-roster-broker.policy";
import { YmqRosterBrokerService } from "./ymq-roster-broker.service";

@Controller("internal/ymq-roster-broker")
@UseGuards(InternalYmqRoleBrokerGuard)
export class YmqRosterBrokerController {
  constructor(private readonly ymqRosterBrokerService: YmqRosterBrokerService) {}

  @Post("preview")
  preview(@Body() body: unknown) {
    return this.ymqRosterBrokerService.preview(validateYmqRosterPreviewInput(body));
  }

  @Post("provision")
  provision(@Body() body: unknown) {
    return this.ymqRosterBrokerService.provision(validateYmqRosterProvisionInput(body));
  }
}
