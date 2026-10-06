
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';

@Injectable()
export class StrategicDepartmentService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.department.findMany({
      include: { parent: true, leader: true, unit: true },
      orderBy: { name: 'asc' }
    });
  }

  async findOne(id: string) {
    return this.prisma.department.findUnique({
      where: { id },
      include: { children: true, leader: true, unit: true, parent: true }
    });
  }

  async create(data: CreateDepartmentDto) {
    return this.prisma.department.create({ data: data as any });
  }

  async update(id: string, data: UpdateDepartmentDto) {
    return this.prisma.department.update({ where: { id }, data: data as any });
  }

  async remove(id: string) {
    return this.prisma.department.delete({ where: { id } });
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

  async createSubdepartment(data: { name: string; description?: string; parentId: string; adminUserId?: string }, user: any) {
    // Validate authorization (must be admin of the parentId)
    const isAdmin = await this.prisma.departmentAdmin.findUnique({
      where: { departmentId_userId: { departmentId: data.parentId, userId: user.id } }
    });
    if (!isAdmin) throw new Error("Unauthorized to create subdepartment for this department");

    const dept = await this.prisma.department.create({
      data: {
        name: data.name,
        description: data.description,
        parentId: data.parentId,
      }
    });

    if (data.adminUserId) {
      await this.prisma.departmentAdmin.create({
        data: { departmentId: dept.id, userId: data.adminUserId }
      });
      await this.prisma.userRoleAssignment.create({
        data: {
          userId: data.adminUserId,
          role: 'admin_biro',
        }
      }).catch(e => { /* Ignore if role already exists */ });
    }

    return dept;
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

  async addMember(departmentId: string, userId: string, role: string | undefined, currentUser: any) {
    await this.checkAdminAccess(departmentId, currentUser);
    return this.prisma.departmentMember.upsert({
      where: { departmentId_userId: { departmentId, userId } },
      update: { role },
      create: { departmentId, userId, role }
    });
  }

  async removeMember(departmentId: string, userId: string, currentUser: any) {
    await this.checkAdminAccess(departmentId, currentUser);
    return this.prisma.departmentMember.delete({
      where: { departmentId_userId: { departmentId, userId } }
    });
  }
}
