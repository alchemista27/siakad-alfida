import { Body, Controller, Delete, Param, Post, UseGuards } from "@nestjs/common";
import { InternalYmqRoleBrokerGuard } from "./internal-ymq-role-broker.guard";
import {
  validateYmqBrokerAssignableRole,
  validateYmqRoleBrokerAssignInput,
  validateYmqRoleBrokerRevokeInput,
  validateYmqRoleBrokerUserId,
} from "./ymq-role-broker.policy";
import { YmqRoleBrokerService } from "./ymq-role-broker.service";

@Controller("internal/ymq-role-broker")
@UseGuards(InternalYmqRoleBrokerGuard)
export class YmqRoleBrokerController {
  constructor(private readonly ymqRoleBrokerService: YmqRoleBrokerService) {}

  @Post("assign")
  assign(@Body() body: unknown) {
    return this.ymqRoleBrokerService.assign(validateYmqRoleBrokerAssignInput(body));
  }

  @Delete("users/:userId/roles/:role")
  revoke(@Param("userId") userId: string, @Param("role") role: string, @Body() body: unknown) {
    const input = validateYmqRoleBrokerRevokeInput(body);
    return this.ymqRoleBrokerService.revoke({
      actorUserId: input.actorUserId,
      userId: validateYmqRoleBrokerUserId(userId),
      role: validateYmqBrokerAssignableRole(role),
    });
  }
}
