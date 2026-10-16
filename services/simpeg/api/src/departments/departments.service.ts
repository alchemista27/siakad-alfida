import { BadGatewayException, BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { OrganizationSyncService } from "../organization-sync/organization-sync.service";

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService, private readonly sync: OrganizationSyncService) {}

  findAll() {
    return this.prisma.department.findMany({ orderBy: [{ isActive: "desc" }, { name: "asc" }] });
  }

  create(data: { name: string; code: string; description?: string; isActive?: boolean }) {
    return this.prisma.$transaction(async (tx) => {
      const department = await tx.department.create({ data: {
        name: data.name.trim(),
        code: data.code.trim().toUpperCase(),
        description: data.description?.trim() || null,
        isActive: data.isActive ?? true,
      } });
      await this.sync.enqueueDepartment(tx as any, department);
      return department;
    });
  }

  async update(id: string, data: { name?: string; code?: string; description?: string | null; isActive?: boolean }) {
    await this.ensureExists(id);
    return this.prisma.$transaction(async (tx) => {
      const department = await tx.department.update({ where: { id }, data: {
        name: data.name?.trim(),
        code: data.code?.trim().toUpperCase(),
        description: data.description === undefined ? undefined : data.description?.trim() || null,
        isActive: data.isActive,
      } });
      await this.sync.enqueueDepartment(tx as any, department);
      return department;
    });
  }

  async remove(id: string, revokedById: string, authorization?: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException("Bidang/departemen tidak ditemukan.");

    const assignments = await (this.prisma as any).departmentAdminAssignment.findMany({
      where: { departmentId: id, isActive: true, role: "admin_bidang" },
    });
    try {
      for (const assignment of assignments) {
        await this.revokeAuthRole(assignment.userId, id, authorization);
      }
    } catch {
      throw new BadGatewayException("Pencabutan peran organisasi di layanan autentikasi gagal.");
    }

    return this.prisma.$transaction(async (tx) => {
      if (assignments.length) {
        await (tx as any).departmentAdminAssignment.updateMany({
          where: { id: { in: assignments.map((assignment: any) => assignment.id) } },
          data: { isActive: false, revokedAt: new Date(), revokedById },
        });
      }
      await this.sync.enqueueDepartmentDeletion(tx as any, department);
      return tx.department.delete({ where: { id } });
    });
  }

  async archive(id: string) {
    await this.ensureExists(id);
    return this.prisma.$transaction(async (tx) => {
      const department = await tx.department.update({ where: { id }, data: { isActive: false } });
      await this.sync.enqueueDepartment(tx as any, department);
      return department;
    });
  }

  async listAdmins(departmentId: string) {
    await this.ensureActive(departmentId);
    return (this.prisma as any).departmentAdminAssignment.findMany({
      where: { departmentId, isActive: true, role: "admin_bidang" },
      orderBy: { assignedAt: "desc" },
    });
  }

  async assignAdmin(departmentId: string, userId: string, assignedById: string, authorization?: string) {
    await this.ensureActive(departmentId);
    const employee = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, username: true, avatarUrl: true, isActive: true },
    });
    if (!employee?.isActive) throw new BadRequestException("Pegawai aktif tidak ditemukan.");

    const assignments = (this.prisma as any).departmentAdminAssignment;
    const local = await this.prisma.$transaction(async (tx) => (tx as any).departmentAdminAssignment.upsert({
      where: { departmentId_userId_role: { departmentId, userId, role: "admin_bidang" } },
      create: { departmentId, userId, role: "admin_bidang", assignedById, isActive: true, revokedAt: null, revokedById: null },
      update: { isActive: true, assignedById, assignedAt: new Date(), revokedAt: null, revokedById: null },
    }));

    try {
      const authAssignmentId = await this.grantAuthRole({ userId, departmentId, role: "admin_bidang" }, authorization);
      return this.prisma.$transaction(async (tx) => {
        const updated = await (tx as any).departmentAdminAssignment.update({ where: { id: local.id }, data: { authAssignmentId } });
        await this.sync.enqueueUser(tx as any, employee);
        return updated;
      });
    } catch (error) {
      await assignments.update({ where: { id: local.id }, data: { isActive: false, revokedAt: new Date(), revokedById: assignedById } });
      throw new BadGatewayException("Penetapan peran organisasi di layanan autentikasi gagal.");
    }
  }

  async revokeAdmin(departmentId: string, userId: string, revokedById: string, authorization?: string) {
    await this.ensureActive(departmentId);
    const assignments = (this.prisma as any).departmentAdminAssignment;
    const assignment = await assignments.findUnique({ where: { departmentId_userId_role: { departmentId, userId, role: "admin_bidang" } } });
    if (!assignment?.isActive) throw new NotFoundException("Penugasan Admin Bidang aktif tidak ditemukan.");
    const employee = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, username: true, avatarUrl: true, isActive: true },
    });
    if (!employee) throw new NotFoundException("Pegawai tidak ditemukan.");
    if (assignment.authAssignmentId) {
      try {
        await this.revokeAuthRole(userId, departmentId, authorization);
      } catch {
        throw new BadGatewayException("Pencabutan peran organisasi di layanan autentikasi gagal.");
      }
    }
    return this.prisma.$transaction(async (tx) => {
      const updated = await (tx as any).departmentAdminAssignment.update({ where: { id: assignment.id }, data: { isActive: false, revokedAt: new Date(), revokedById } });
      await this.sync.enqueueUser(tx as any, employee);
      return updated;
    });
  }

  private async ensureExists(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException("Bidang/departemen tidak ditemukan.");
  }

  private async ensureActive(id: string) {
    const department = await this.prisma.department.findUnique({ where: { id } });
    if (!department) throw new NotFoundException("Bidang/departemen tidak ditemukan.");
    if (!department.isActive) throw new BadRequestException("Bidang/departemen tidak aktif.");
  }

  private async grantAuthRole(body: { userId: string; departmentId: string; role: "admin_bidang" }, authorization?: string) {
    const baseUrl = process.env.AUTH_API_URL;
    if (!baseUrl) throw new Error("AUTH_API_URL belum dikonfigurasi.");
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/users/organization-roles`, {
      method: "POST",
      headers: { "content-type": "application/json", ...(authorization ? { authorization } : {}) },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error("Auth role grant rejected");
    const result = await response.json() as { id?: string };
    if (!result.id) throw new Error("Auth role grant returned no assignment id");
    return result.id;
  }

  private async revokeAuthRole(userId: string, departmentId: string, authorization?: string) {
    const baseUrl = process.env.AUTH_API_URL;
    if (!baseUrl) throw new Error("AUTH_API_URL belum dikonfigurasi.");
    const response = await fetch(
      `${baseUrl.replace(/\/$/, "")}/api/users/organization-roles/${userId}/${departmentId}`,
      { method: "DELETE", headers: authorization ? { authorization } : {} },
    );
    if (!response.ok) throw new Error("Auth role revoke rejected");
  }
}
