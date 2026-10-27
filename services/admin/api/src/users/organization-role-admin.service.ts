import {
  BadGatewayException,
  BadRequestException,
  HttpException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { getRoleScope } from "./role-catalog";
import { OrganizationRoleAdminDto } from "./dto/organization-role-admin.dto";

type FetchLike = typeof fetch;
export const ORGANIZATION_ROLE_FETCH = Symbol("ORGANIZATION_ROLE_FETCH");

@Injectable()
export class OrganizationRoleAdminService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ORGANIZATION_ROLE_FETCH)
    private readonly fetchImpl: FetchLike,
  ) {}

  async assign(userId: string, input: OrganizationRoleAdminDto, authorization?: string) {
    if (input.scope === "department") {
      if (!input.departmentId) {
        throw new BadRequestException("Peran department memerlukan departmentId.");
      }
      return this.request(`/api/departments/${input.departmentId}/admins`, {
        method: "POST",
        headers: this.headers(authorization, true),
        body: JSON.stringify({ userId }),
      });
    }

    if (input.scope === "unit") {
      if (!input.unitId) {
        throw new BadRequestException("Peran unit memerlukan unitId.");
      }
      if (!input.app) {
        throw new BadRequestException("Peran unit memerlukan aplikasi (app).");
      }
      return this.request(`/api/units/${input.unitId}/admins`, {
        method: "POST",
        headers: this.headers(authorization, true),
        body: JSON.stringify({ userId, apps: [input.app] }),
      });
    }

    throw new BadRequestException("Scope peran organisasi tidak valid.");
  }

  async revoke(roleAssignmentId: string, authorization?: string) {
    const assignment = await this.prisma.roleAssignment.findUnique({
      where: { id: roleAssignmentId },
    });
    if (!assignment) {
      throw new NotFoundException("Peran pengguna tidak ditemukan");
    }

    const scope = getRoleScope(assignment);
    if (scope === "department") {
      if (
        assignment.app !== "simakin" ||
        assignment.role !== "admin_bidang" ||
        !assignment.departmentId
      ) {
        throw new BadRequestException(
          "Peran berscope ini harus dikelola dari menu Struktur Organisasi SIMPEG.",
        );
      }
      return this.request(
        `/api/departments/${assignment.departmentId}/admins/${assignment.userId}`,
        {
          method: "DELETE",
          headers: this.headers(authorization),
        },
      );
    }

    if (scope === "unit") {
      if (!assignment.unitId) {
        throw new BadRequestException(
          "Peran berscope unit harus memiliki unitId.",
        );
      }
      return this.request(
        `/api/units/${assignment.unitId}/admins/${assignment.userId}/${assignment.app}`,
        {
          method: "DELETE",
          headers: this.headers(authorization),
        },
      );
    }

    throw new BadRequestException(
      "Peran berscope ini harus dikelola dari menu Struktur Organisasi SIMPEG.",
    );
  }

  private headers(authorization: string | undefined, hasBody = false) {
    return {
      ...(hasBody ? { "content-type": "application/json" } : {}),
      ...(authorization ? { authorization } : {}),
    };
  }

  private async request(path: string, init: RequestInit) {
    const baseUrl = process.env.SIMPEG_API_URL?.replace(/\/$/, "");
    if (!baseUrl) {
      throw new ServiceUnavailableException("Layanan Struktur Organisasi SIMPEG belum dikonfigurasi.");
    }

    let response: Response;
    try {
      response = await this.fetchImpl(`${baseUrl}${path}`, init);
    } catch {
      throw new ServiceUnavailableException("Layanan Struktur Organisasi SIMPEG tidak dapat dihubungi.");
    }

    const payload: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = this.messageFrom(payload, "Permintaan ke Struktur Organisasi SIMPEG gagal.");
      if (response.status >= 400 && response.status < 500) {
        throw new HttpException(message, response.status);
      }
      throw new BadGatewayException(message);
    }
    return payload;
  }

  private messageFrom(payload: unknown, fallback: string) {
    if (!payload || typeof payload !== "object" || !("message" in payload)) return fallback;
    const message = payload.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message) && message.every((item) => typeof item === "string")) return message.join(", ");
    return fallback;
  }
}
