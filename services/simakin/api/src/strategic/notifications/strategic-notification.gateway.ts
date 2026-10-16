import { Injectable } from "@nestjs/common";
import { concat, filter, from, map } from "rxjs";
import { StrategicNotificationService } from "./strategic-notification.service";

@Injectable()
export class StrategicNotificationGateway {
  constructor(private readonly notifications: StrategicNotificationService) {}

  stream(userId: string) {
    return concat(
      from(this.notifications.unread(userId, true)).pipe(map((items) => ({ data: { type: "snapshot", items } }))),
      this.notifications.streamFor(userId).pipe(
        filter((event) => event.userId === userId),
        map((event) => ({ data: { type: "notification", item: event.notification } })),
      ),
    );
  }
}
