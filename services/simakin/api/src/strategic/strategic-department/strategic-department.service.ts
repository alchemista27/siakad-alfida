
import { BadGatewayException, BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBureauDto } from '../dto/bureau.dto';
import { StrategicAuthorizationService } from '../workflow/strategic-authorization.service';
import { AuthOrganizationRoleClient } from '../organization-role-broker/auth-organization-role.client';
import { BureauAdminRoleLifecycle } from '../organization-role-broker/bureau-admin-role-lifecycle';

@Injectable()
export class StrategicDepartmentService {
  private readonly bureauAdminLifecycle = new BureauAdminRoleLifecycle();
  constructor(private prisma: PrismaService, private readonly authorization: StrategicAuthorizationService, private readonly authRoles: AuthOrganizationRoleClient) {}

  async findAll() {
    return this.prisma.department.findMany({
      include: { parent: true, leader: true },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: { children: true, leader: true, parent: true }
    });
  }

  async getDepartmentOverview() {
    const workPrograms = await this.prisma.workProgram.groupBy({
      by: ['status'],
      _count: { id: true }
    });
    let planned = 0, ongoing = 0, completed = 0;
    workPrograms.forEach((wp: any) => {
      if (wp.status === 'planned') planned = wp._count.id;
      if (wp.status === 'ongoing') ongoing = wp._count.id;
      if (wp.status === 'completed') completed = wp._count.id;
    });
    const totalReports = await this.prisma.activityReport.count();
    return { planned, ongoing, completed, totalReports };
  }

  async getMyMembers(user: any) {
    // Cari semua departemen dimana user ini menjadi admin
    const myDepts = await this.prisma.departmentAdmin.findMany({
      where: { userId: user.id },
      select: { departmentId: true }
    });
    const deptIds = myDepts.map(d => d.departmentId);

    if (deptIds.length === 0) return [];

    // Ambil anggota dari departemen-departemen tersebut
    return this.prisma.departmentMember.findMany({
      where: { departmentId: { in: deptIds } },
      include: {
        user: { select: { id: true, fullName: true, email: true, username: true } },
        department: { select: { id: true, name: true } }
      }
    });
  }

  async getMySubdepartments(user: any) {
    const myDepts = await this.prisma.departmentAdmin.findMany({
      where: { userId: user.id },
      select: { departmentId: true }
    });
    const deptIds = myDepts.map(d => d.departmentId);
    if (deptIds.length === 0) return [];

    return this.prisma.department.findMany({
      where: { parentId: { in: deptIds } },
      include: { 
        admins: { include: { user: { select: { id: true, fullName: true, email: true } } } },
        members: { include: { user: { select: { id: true, fullName: true } } } }
      }
    });
  }

  async createBureau(bidangId: string, data: CreateBureauDto, user: any) {
    await this.authorization.assertBidangCanManageBureau(user, bidangId);
    const parent = await (this.prisma as any).department.findUnique({ where: { id: bidangId } });
    if (!parent || parent.parentId || parent.source !== "simpeg" || !parent.isActive) throw new BadRequestException("Biro harus berada di bawah Bidang aktif yang tersinkron dari SIMPEG.");
    const admin = await this.prisma.user.findUnique({ where: { id: data.adminUserId }, select: { id: true, isActive: true } });
    if (!admin?.isActive) throw new BadRequestException("Admin Biro harus merupakan user proyeksi aktif.");
    const bureau = await (this.prisma as any).department.create({ data: { name: data.name, code: data.code.trim().toUpperCase(), description: data.description ?? null, parentId: bidangId, source: "simakin_legacy", isActive: true } });
    try {
      await this.assignBureauAdmin(bureau.id, data.adminUserId, user);
      return bureau;
    } catch (error) {
      await (this.prisma as any).department.delete({ where: { id: bureau.id } });
      throw error;
    }
  }

  async assignBureauAdmin(biroId: string, userId: string, user: any) {
    const bureau = await this.prisma.department.findUnique({ where: { id: biroId } });
    if (!bureau?.parentId) throw new BadRequestException("Admin Biro hanya dapat ditetapkan pada Biro.");
    await this.authorization.assertBidangCanManageBureau(user, bureau.parentId);
    const member = await this.prisma.user.findUnique({ where: { id: userId }, select: { id: true, isActive: true } });
    if (!member?.isActive) throw new BadRequestException("Admin Biro harus merupakan user proyeksi aktif.");
    const existing = await (this.prisma as any).departmentAdmin.findUnique({ where: { departmentId_userId: { departmentId: biroId, userId } } });
    try {
      await this.bureauAdminLifecycle.assign({
        createLocal: async () => { await (this.prisma as any).departmentAdmin.upsert({ where: { departmentId_userId: { departmentId: biroId, userId } }, create: { departmentId: biroId, userId, assignedById: user.id, assignedAt: new Date(), revokedAt: null, revokedById: null }, update: { assignedById: user.id, assignedAt: new Date(), revokedAt: null, revokedById: null } }); },
        removeLocal: async () => { if (!existing) await (this.prisma as any).departmentAdmin.delete({ where: { departmentId_userId: { departmentId: biroId, userId } } }); },
        grantAuth: () => this.authRoles.grant(userId, biroId),
        revokeAuth: async () => { await this.authRoles.revoke(userId, biroId); },
        persistAuthAssignment: async (authAssignmentId) => { await (this.prisma as any).departmentAdmin.update({ where: { departmentId_userId: { departmentId: biroId, userId } }, data: { authAssignmentId } }); },
      });
    } catch {
      throw new BadGatewayException("Penetapan Admin Biro di layanan autentikasi gagal.");
    }
    return (this.prisma as any).departmentAdmin.findUnique({ where: { departmentId_userId: { departmentId: biroId, userId } } });
  }

  async removeBureauAdmin(biroId: string, userId: string, user: any) {
    const bureau = await this.prisma.department.findUnique({ where: { id: biroId } });
    if (!bureau?.parentId) throw new BadRequestException("Admin Biro hanya berlaku pada Biro.");
    await this.authorization.assertBidangCanManageBureau(user, bureau.parentId);
    const relation = await (this.prisma as any).departmentAdmin.findUnique({ where: { departmentId_userId: { departmentId: biroId, userId } } });
    if (!relation) throw new NotFoundException("Penugasan Admin Biro tidak ditemukan.");
    try {
      await this.bureauAdminLifecycle.revoke({ revokeAuth: () => this.authRoles.revoke(userId, biroId), removeLocal: async () => { await (this.prisma as any).departmentAdmin.delete({ where: { departmentId_userId: { departmentId: biroId, userId } } }); } });
    } catch {
      throw new BadGatewayException("Pencabutan Admin Biro di layanan autentikasi gagal.");
    }
    return { deleted: true };
  }

  private async checkAdminAccess(departmentId: string, user: any) {
    const isSuperAdmin = user.roles?.some((r: any) => r.role === 'super_admin');
    if (isSuperAdmin) return true;
    const admin = await this.prisma.departmentAdmin.findUnique({
      where: { departmentId_userId: { departmentId, userId: user.id } }
    });
    if (!admin) {
      throw new Error('Unauthorized to manage members for this department');
    }
    return true;
  }

  async addMember(departmentId: string | undefined, userId: string, role: string | undefined, currentUser: any) {
    let targetDeptId = departmentId;
    if (!targetDeptId || targetDeptId === 'my') {
      const myDept = await this.prisma.departmentAdmin.findFirst({
        where: { userId: currentUser.id }
      });
      if (!myDept) throw new Error("Pengguna tidak memiliki departemen yang dikelola.");
      targetDeptId = myDept.departmentId;
    }

    await this.checkAdminAccess(targetDeptId, currentUser);
    return this.prisma.departmentMember.upsert({
      where: { departmentId_userId: { departmentId: targetDeptId, userId } },
      update: { role },
      create: { departmentId: targetDeptId, userId, role }
    });
  }

  async removeMember(departmentId: string, userId: string, currentUser: any) {
    await this.checkAdminAccess(departmentId, currentUser);
    return this.prisma.departmentMember.delete({
      where: { departmentId_userId: { departmentId, userId } }
    });
  }
}
