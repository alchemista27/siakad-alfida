import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { hasScopedRole, isExecutive, StrategicUser } from "./strategic-permissions";

@Injectable()
export class StrategicAuthorizationService {
  constructor(private readonly prisma: PrismaService) {}

  async assertBidangCanManageBureau(user: StrategicUser, bidangId: string) {
    if (hasScopedRole(user, "super_admin")) return;
    if (!hasScopedRole(user, "admin_bidang", bidangId)) throw new ForbiddenException("Admin Bidang tidak memiliki scope Bidang ini.");
  }

  async assertBiroCanManage(user: StrategicUser, biroId: string) {
    if (hasScopedRole(user, "super_admin")) return;
    if (!hasScopedRole(user, "admin_biro", biroId)) throw new ForbiddenException("Admin Biro tidak memiliki scope Biro ini.");
  }

  async assertBidangCanReview(user: StrategicUser, departmentId: string) {
    if (hasScopedRole(user, "super_admin")) return;
    const department = await this.prisma.department.findUnique({ where: { id: departmentId }, select: { id: true, parentId: true } });
    if (!department) throw new NotFoundException("Bidang/Biro tidak ditemukan.");
    const bidangId = department.parentId ?? department.id;
    if (!hasScopedRole(user, "admin_bidang", bidangId)) throw new ForbiddenException("Admin Bidang tidak memiliki scope review ini.");
  }

  async assertPicOwnsTask(user: StrategicUser, taskId: string) {
    const task = await this.prisma.executionTask.findUnique({ where: { id: taskId }, select: { assigneeId: true } });
    if (!task || task.assigneeId !== user.id) throw new ForbiddenException("PIC hanya dapat mengakses tugas miliknya.");
  }

  async assertStaffOwnsProgramTask(user: StrategicUser, programId: string) {
    const task = await this.prisma.executionTask.findFirst({ where: { programId, assigneeId: user.id }, select: { id: true } });
    if (!task) throw new ForbiddenException("Staff hanya dapat mengakses program yang memiliki tugas yang ditetapkan kepadanya.");
    return task;
  }

  async assertCanReadProgram(user: StrategicUser, programId: string) {
    if (isExecutive(user) || hasScopedRole(user, "super_admin")) return;
    const program = await this.prisma.workProgram.findUnique({ where: { id: programId }, select: { departmentId: true, coordinatorId: true, userId: true } });
    if (!program) throw new NotFoundException("Program kerja tidak ditemukan.");
    if (program.coordinatorId === user.id || program.userId === user.id || hasScopedRole(user, "admin_biro", program.departmentId)) return;
    await this.assertBidangCanReview(user, program.departmentId);
  }

  assertExecutiveReadOnly(user: StrategicUser) {
    if (!isExecutive(user)) throw new ForbiddenException("Akses monitoring eksekutif diperlukan.");
  }
}
