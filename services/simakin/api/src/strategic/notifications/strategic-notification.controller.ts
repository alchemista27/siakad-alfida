import { Controller, Get, Param, Post, Query, Req, Sse, UseGuards } from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimakinRoles, SimakinRolesGuard } from "../../common/guards";
import { StrategicNotificationGateway } from "./strategic-notification.gateway";
import { StrategicNotificationService } from "./strategic-notification.service";

@Controller("strategic/notifications")
@UseGuards(ServiceJwtAuthGuard, SimakinRolesGuard)
@SimakinRoles("admin_bidang", "admin_biro", "staff", "pic_program", "pimpinan", "pengawas")
export class StrategicNotificationController {
  constructor(private readonly notifications: StrategicNotificationService, private readonly gateway: StrategicNotificationGateway) {}

  @Sse("stream")
  stream(@Req() req: any) { return this.gateway.stream(req.user.id); }

  @Get()
  list(@Req() req: any, @Query("unreadOnly") unreadOnly?: string) { return this.notifications.unread(req.user.id, unreadOnly === "true"); }

  @Post(":id/read")
  read(@Param("id") id: string, @Req() req: any) { return this.notifications.markRead(id, req.user.id); }
}
