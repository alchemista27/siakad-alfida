import { BadGatewayException, Inject, Injectable, ServiceUnavailableException } from "@nestjs/common";

export type StaffApprovalProjection = {
  id: string;
  fullName: string;
  email: string;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;
  unitId: string;
  employmentRole: "guru" | "karyawan";
};

type FetchLike = typeof fetch;
export const STAFF_APPROVAL_PROJECTION_FETCH = Symbol("STAFF_APPROVAL_PROJECTION_FETCH");

@Injectable()
export class StaffApprovalProjectionClient {
  constructor(
    @Inject(STAFF_APPROVAL_PROJECTION_FETCH)
    private readonly fetchImpl: FetchLike = fetch,
  ) {}

  assertConfigured() {
    this.config();
  }

  async provision(payload: StaffApprovalProjection) {
    const { baseUrl, token } = this.config();
    let response: Response;
    try {
      response = await this.fetchImpl(
        `${baseUrl}/api/internal/staff-approvals/users/${payload.id}`,
        {
          method: "PUT",
          headers: {
            "content-type": "application/json",
            "x-internal-service-token": token,
          },
          body: JSON.stringify(payload),
        },
      );
    } catch {
      throw new ServiceUnavailableException("Layanan SIMPEG tidak dapat dihubungi untuk membuat penugasan awal.");
    }

    if (!response.ok) {
      const body: unknown = await response.json().catch(() => null);
      const message = this.messageFrom(body);
      throw new BadGatewayException(message);
    }
  }

  private config() {
    const baseUrl = process.env.SIMPEG_API_URL?.replace(/\/$/, "");
    const token = process.env.SIMPEG_INTERNAL_SERVICE_TOKEN?.trim();
    if (!baseUrl || !token) {
      throw new ServiceUnavailableException(
        "Integrasi persetujuan penugasan SIMPEG belum dikonfigurasi.",
      );
    }
    return { baseUrl, token };
  }

  private messageFrom(body: unknown) {
    if (!body || typeof body !== "object" || !("message" in body)) {
      return "SIMPEG menolak pembuatan penugasan awal.";
    }
    const message = body.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) {
      return message.join(", ");
    }
    return "SIMPEG menolak pembuatan penugasan awal.";
  }
}
