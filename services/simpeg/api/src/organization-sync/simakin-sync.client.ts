import { Injectable } from "@nestjs/common";

@Injectable()
export class SimakinSyncClient {
  async deliver(event: {
    aggregate: "department" | "department_member" | "user";
    aggregateId: string;
    eventType: string;
    payload: Record<string, unknown>;
  }) {
    const baseUrl = process.env.SIMAKIN_API_URL;
    const token = process.env.AUTH_INTERNAL_SERVICE_TOKEN;
    if (!baseUrl || !token)
      throw new Error("SIMAKIN internal synchronization is not configured.");
    const path =
      event.aggregate === "department"
        ? `departments/${event.aggregateId}`
        : event.aggregate === "department_member"
          ? `department-members/${event.aggregateId}`
          : `users/${event.aggregateId}`;
    const method = event.eventType === "department.deleted" ? "DELETE" : "PUT";
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/strategic/organization-sync/${path}`,
      {
        method,
        headers: {
          "content-type": "application/json",
          "x-internal-service-token": token,
        },
        body: JSON.stringify(event.payload),
      }
    );
    if (!response.ok)
      throw new Error(`SIMAKIN sync rejected with HTTP ${response.status}`);
  }
}
