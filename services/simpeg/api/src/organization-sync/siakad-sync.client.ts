import { Injectable } from "@nestjs/common";
import { UnitProjectionPayloadSchema } from "@alfida/contracts";

const REQUEST_TIMEOUT_MS = 10_000;

@Injectable()
export class SiakadSyncClient {
  async deliver(event: { aggregateId: string; eventType: string; payload: Record<string, unknown> }) {
    if (event.eventType !== "unit.upserted" && event.eventType !== "unit.archived") {
      throw new Error(`Unsupported SIAKAD synchronization event: ${event.eventType}`);
    }

    const baseUrl = process.env.SIAKAD_API_URL;
    const token = process.env.INTERNAL_SERVICE_TOKEN;
    if (!baseUrl || !token) throw new Error("SIAKAD internal synchronization is not configured.");

    const parsed = UnitProjectionPayloadSchema.safeParse(event.payload);
    if (!parsed.success) throw new Error("SIAKAD unit synchronization payload is invalid.");
    if (parsed.data.id !== event.aggregateId) throw new Error("SIAKAD unit synchronization aggregate does not match payload.");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/internal/organization/units/${event.aggregateId}`, {
        method: "PUT",
        headers: { "content-type": "application/json", "x-internal-service-token": token },
        body: JSON.stringify(parsed.data),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`SIAKAD sync rejected with HTTP ${response.status}`);
    } finally {
      clearTimeout(timeout);
    }
  }
}
