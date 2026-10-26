import { BadGatewayException, BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { canManageUnit, isAllowedUnitAdminApp, ScopedRole, UnitAdminApp } from "../common/organization-access.policy";
import { AuthOrganizationRoleClient } from "../organization-sync/auth-organization-role.client";
import { OrganizationSyncService } from "../organization-sync/organization-sync.service";
import { PrismaService } from "../prisma/prisma.service";
import { AssignUnitAdminDto } from "./units.dto";

type UnitInput = {
  name?: string;
  code?: string;
  category?: "pendidikan" | "nondik";
  address?: string | null;
  isActive?: boolean;
};

type Principal = { roles?: unknown };

@Injectable()
export class UnitsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly sync: OrganizationSyncService,
    private readonly authOrganizationRoles: AuthOrganizationRoleClient,
  ) {}

  async findAll(principal?: Principal) {
    const query: any = { orderBy: [{ isActive: "desc" }, { name: "asc" }] };
    if (principal && !this.canManageAnyUnit(principal)) {
      const unitIds = this.scopedUnitIds(principal);
      if (!unitIds.length) throw new ForbiddenException("Anda tidak berwenang mengakses unit.");
      query.where = { id: { in: unitIds } };
    }
    return this.prisma.unit.findMany(query);
  }

  async findOne(id: string, principal?: Principal) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException("Unit tidak ditemukan.");
    if (principal && !canManageUnit(principal.roles, id)) {
      throw new ForbiddenException("Anda tidak berwenang mengakses unit ini.");
    }
    return unit;
  }

  async create(data: UnitInput) {
    const normalized = this.normalizeInput(data, true);
    return this.writeUnitAndProjection(async (tx) => {
      const unit = await tx.unit.create({ data: normalized });
      await this.enqueueUnitProjection(tx, unit);
      return unit;
    });
  }

  async update(id: string, data: UnitInput) {
    await this.ensureExists(id);
    return this.writeUnitAndProjection(async (tx) => {
      const unit = await tx.unit.update({ where: { id }, data: this.normalizeInput(data, false) });
      await this.enqueueUnitProjection(tx, unit);
      return unit;
    });
  }

  async remove(id: string, principal?: Principal) {
    if (principal && !this.canManageAnyUnit(principal)) {
      throw new ForbiddenException("Hanya administrator kepegawaian yang dapat menghapus unit.");
    }
    await this.ensureExists(id);
    const [assignmentCount, unitAdminAssignmentCount, configCount, attendanceCount, holidayCount, saturdayDutyCount] = await Promise.all([
      this.prisma.employeeUnitAssignment.count({ where: { unitId: id } }),
      (this.prisma as any).unitAdminAssignment.count({ where: { unitId: id, isActive: true } }),
      this.prisma.gpsAttendanceConfig.count({ where: { unitId: id } }),
      this.prisma.gpsAttendance.count({ where: { unitId: id } }),
      this.prisma.holiday.count({ where: { unitId: id } }),
      this.prisma.saturdayDutyAssignment.count({ where: { unitId: id } }),
    ]);
    if (assignmentCount + unitAdminAssignmentCount + configCount + attendanceCount + holidayCount + saturdayDutyCount > 0) {
      throw new BadRequestException("Unit tidak dapat dihapus karena sudah dipakai penugasan, admin unit, presensi, konfigurasi GPS, hari libur, atau piket Sabtu. Nonaktifkan unit sebagai gantinya.");
    }
    return this.prisma.unit.delete({ where: { id } });
  }

  async listAdmins(unitId: string, principal: Principal) {
    await this.ensureActiveUnit(unitId);
    this.assertUnitScope(unitId, principal);
    return (this.prisma as any).unitAdminAssignment.findMany({
      where: { unitId, isActive: true },
      orderBy: { assignedAt: "desc" },
    });
  }

  async assignAdmin(unitId: string, dto: AssignUnitAdminDto, principal: Principal & { id?: string }) {
    const unit = await this.ensureActiveUnit(unitId);
    this.assertUnitScope(unitId, principal);
    const employee = await this.findActiveEmployee(dto.userId);
    const role = unit.category === "nondik" ? "admin_unit_nondik" : "admin_unit";
    const apps = [...new Set(dto.apps)] as UnitAdminApp[];
    if (!apps.every((app) => isAllowedUnitAdminApp(app, unit.category))) {
      throw new BadRequestException("Aplikasi SIAKAD dan SPMB hanya dapat ditetapkan pada unit pendidikan.");
    }

    const assignments = (this.prisma as any).unitAdminAssignment;
    const changed: Array<{ local: any; wasActive: boolean; app: UnitAdminApp; compensationId: string | null }> = [];
    const granted: Array<{ app: UnitAdminApp; authAssignmentId: string; compensationId: string | null }> = [];
    try {
      for (const app of apps) {
        const compound = { unitId_userId_app_role: { unitId, userId: dto.userId, app, role } };
        const existing = await assignments.findUnique({ where: compound });
        const prepared = await this.prisma.$transaction(async (tx: any) => {
          const local = await tx.unitAdminAssignment.upsert({
            where: compound,
            create: { unitId, userId: dto.userId, app, role, isActive: true, assignedById: principal.id, revokedAt: null, revokedById: null },
            update: { isActive: true, assignedById: principal.id, assignedAt: new Date(), revokedAt: null, revokedById: null },
          });
          let compensation: any = null;
          if (typeof (this.sync as any)?.armAuthRoleRevocation === "function") {
            compensation = await (this.sync as any).armAuthRoleRevocation(tx, {
              localAssignmentId: local.id, scope: "unit", userId: dto.userId, scopeId: unitId, app, role, requestedById: principal.id,
            });
          }
          return { local, compensationId: compensation?.id ?? null };
        });
        changed.push({ local: prepared.local, wasActive: Boolean(existing?.isActive), app, compensationId: prepared.compensationId });
        const authAssignmentId = await this.grantAuthUnitRole(dto.userId, unitId, app, role);
        granted.push({ app, authAssignmentId, compensationId: prepared.compensationId });
        await this.prisma.$transaction(async (tx: any) => {
          await tx.unitAdminAssignment.update({ where: { id: prepared.local.id }, data: { authAssignmentId } });
          if (typeof (this.sync as any)?.completeAuthRoleGrant === "function") {
            await (this.sync as any).completeAuthRoleGrant(tx, prepared.compensationId, authAssignmentId);
          }
        });
      }
    } catch {
      await Promise.all(changed.filter(({ wasActive }) => !wasActive).map(({ local }) => assignments.update({
        where: { id: local.id }, data: { isActive: false, revokedAt: new Date(), revokedById: principal.id },
      })));
      const grantedCompensations = new Set(granted.map(({ compensationId }) => compensationId).filter(Boolean));
      if (typeof (this.sync as any)?.cancelAuthRoleRevocation === "function" || typeof (this.sync as any)?.scheduleAuthRoleRevocation === "function") {
        await this.prisma.$transaction(async (tx: any) => {
          if (typeof (this.sync as any)?.cancelAuthRoleRevocation === "function") {
            await Promise.all(changed.filter(({ compensationId }) => compensationId && !grantedCompensations.has(compensationId)).map(({ compensationId }) => (this.sync as any).cancelAuthRoleRevocation(tx, compensationId)));
          }
          if (typeof (this.sync as any)?.scheduleAuthRoleRevocation === "function") {
            await Promise.all(granted.map(({ compensationId, authAssignmentId }) => (this.sync as any).scheduleAuthRoleRevocation(tx, compensationId, authAssignmentId)));
          }
        });
      }
      await Promise.all(granted.map(async ({ app, compensationId }) => {
        try {
          await this.revokeAuthUnitRole(dto.userId, unitId, app, role);
          if (typeof (this.sync as any)?.cancelAuthRoleRevocation === "function") {
            await this.prisma.$transaction((tx: any) => (this.sync as any).cancelAuthRoleRevocation(tx, compensationId));
          }
        } catch {
          // The durable compensation remains pending for the reconciler.
        }
      }));
      throw new BadGatewayException("Penetapan peran organisasi di layanan autentikasi gagal.");
    }

    await this.enqueueUserProjection(employee);
    return changed.map(({ local }) => local);
  }

  async revokeAdmin(unitId: string, userId: string, app: string, principal: Principal & { id?: string }) {
    const unit = await this.ensureActiveUnit(unitId);
    this.assertUnitScope(unitId, principal);
    if (!isAllowedUnitAdminApp(app, unit.category)) {
      throw new BadRequestException("Aplikasi admin unit tidak didukung untuk kategori unit ini.");
    }
    const role = unit.category === "nondik" ? "admin_unit_nondik" : "admin_unit";
    const assignments = (this.prisma as any).unitAdminAssignment;
    const assignment = await assignments.findUnique({ where: { unitId_userId_app_role: { unitId, userId, app, role } } });
    if (!assignment?.isActive) throw new NotFoundException("Penugasan Admin Unit aktif tidak ditemukan.");
    const employee = await this.findActiveEmployee(userId);
    try {
      await this.revokeAuthUnitRole(userId, unitId, app as UnitAdminApp, role);
    } catch {
      throw new BadGatewayException("Pencabutan peran organisasi di layanan autentikasi gagal.");
    }
    const result = await this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.unitAdminAssignment.update({
        where: { id: assignment.id },
        data: { isActive: false, revokedAt: new Date(), revokedById: principal.id },
      });
      await this.sync.enqueueUser(tx, employee);
      return updated;
    });
    return result;
  }

  private async writeUnitAndProjection<T>(operation: (tx: any) => Promise<T>) {
    const transaction = (this.prisma as any).$transaction;
    return typeof transaction === "function"
      ? transaction.call(this.prisma, operation)
      : operation(this.prisma);
  }

  private async enqueueUnitProjection(tx: any, unit: any) {
    if (!this.sync) return;
    if (!unit.updatedAt) throw new Error("Unit source update timestamp is required for synchronization.");
    if (unit.category !== "pendidikan" && unit.category !== "nondik") {
      throw new Error("Unit category is invalid for synchronization.");
    }
    await this.sync.enqueueUnit(tx, {
      id: unit.id,
      name: unit.name,
      category: unit.category,
      isActive: unit.isActive,
      updatedAt: unit.updatedAt,
    });
  }

  private async findActiveEmployee(userId: string) {
    const employee = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, fullName: true, email: true, username: true, avatarUrl: true, isActive: true },
    });
    if (!employee?.isActive) throw new BadRequestException("Pegawai aktif tidak ditemukan.");
    return {
      id: employee.id,
      fullName: employee.fullName,
      email: employee.email,
      username: employee.username ?? null,
      avatarUrl: employee.avatarUrl ?? null,
      isActive: employee.isActive,
    };
  }

  private async enqueueUserProjection(employee: { id: string; fullName: string; email: string; username: string | null; avatarUrl: string | null; isActive: boolean }) {
    await this.prisma.$transaction((tx: any) => this.sync.enqueueUser(tx, employee));
  }

  private async grantAuthUnitRole(userId: string, unitId: string, app: UnitAdminApp, role: string) {
    const result = await this.authOrganizationRoles.grant({
      scope: "unit",
      userId,
      unitId,
      app,
      role: role as "admin_unit" | "admin_unit_nondik",
    });
    return result.id;
  }

  private async revokeAuthUnitRole(userId: string, unitId: string, app: UnitAdminApp, role: string) {
    await this.authOrganizationRoles.revoke({
      scope: "unit",
      userId,
      unitId,
      app,
      role: role as "admin_unit" | "admin_unit_nondik",
    });
  }

  private assertUnitScope(unitId: string, principal: Principal) {
    if (!canManageUnit(principal.roles, unitId)) {
      throw new ForbiddenException("Anda tidak berwenang mengelola unit ini.");
    }
  }

  private async ensureActiveUnit(id: string) {
    const unit = await this.ensureExists(id);
    if (!unit.isActive) throw new BadRequestException("Unit tidak aktif.");
    return unit;
  }

  private normalizeInput(data: UnitInput, creating: boolean) {
    if (data.category !== undefined && data.category !== "pendidikan" && data.category !== "nondik") {
      throw new BadRequestException("Kategori unit harus pendidikan atau nondik.");
    }
    return {
      name: data.name === undefined ? undefined : data.name.trim(),
      code: data.code === undefined ? undefined : data.code.trim().toUpperCase(),
      category: data.category ?? (creating ? "pendidikan" : undefined),
      address: data.address === undefined ? (creating ? null : undefined) : data.address?.trim() || null,
      isActive: data.isActive ?? (creating ? true : undefined),
    };
  }

  private canManageAnyUnit(principal: Principal) {
    if (!Array.isArray(principal.roles)) return false;
    return principal.roles.some((entry) => {
      if (!entry || typeof entry !== "object") return false;
      const { app, role } = entry as ScopedRole;
      return (role === "super_admin" && ["*", "auth", "core", "simpeg"].includes(app || ""))
        || (app === "simpeg" && role === "admin_kepegawaian");
    });
  }

  private scopedUnitIds(principal: Principal) {
    if (!Array.isArray(principal.roles)) return [];
    return principal.roles.flatMap((entry) => {
      if (!entry || typeof entry !== "object") return [];
      const { app, role, unitId } = entry as ScopedRole;
      return app === "simpeg" && (role === "admin_unit" || role === "admin_unit_nondik") && typeof unitId === "string"
        ? [unitId]
        : [];
    });
  }

  private async ensureExists(id: string) {
    const unit = await this.prisma.unit.findUnique({ where: { id } });
    if (!unit) throw new NotFoundException("Unit tidak ditemukan.");
    return unit;
  }
}
