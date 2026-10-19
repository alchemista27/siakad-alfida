import { Body, Controller, Get, Patch, Post, Query, Param, UseGuards } from "@nestjs/common";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";
import { StudentDevelopmentService, type CreateStudentDevelopmentDto } from "./student-development.service";

@Controller("student-development")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
export class StudentDevelopmentController {
  constructor(private readonly studentDevelopmentService: StudentDevelopmentService) {}

  @Post()
  @SiakadRoles("wali_kelas")
  create(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateStudentDevelopmentDto) {
    return this.studentDevelopmentService.create(principal, dto);
  }

  @Get("homeroom")
  @SiakadRoles("wali_kelas")
  listForHomeroom(@CurrentPrincipal() principal: SiakadPrincipal, @Query("academicYearId") academicYearId?: string) {
    return this.studentDevelopmentService.listForHomeroom(principal, academicYearId);
  }

  @Patch(":id/approve")
  @SiakadRoles("wali_kelas")
  approve(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.studentDevelopmentService.approve(principal, id);
  }

  @Get("parent")
  @SiakadRoles("orang_tua")
  listForParent(@CurrentPrincipal() principal: SiakadPrincipal) {
    return this.studentDevelopmentService.listApprovedForParent(principal);
  }
}
