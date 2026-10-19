import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import {
  AssignmentsService,
  type AssignmentListFilter,
  type CreateHomeroomAssignmentDto,
  type CreateTeacherAssignmentDto,
  type UpdateHomeroomAssignmentDto,
  type UpdateTeacherAssignmentDto,
} from "./assignments.service";
import { SiakadAuthGuard } from "../auth/siakad-auth.guard";
import { CurrentPrincipal } from "../auth/current-principal.decorator";
import { SiakadRoles, SiakadRolesGuard } from "../common/guards/siakad-roles.guard";
import type { SiakadPrincipal } from "../common/siakad-scope-policy";

@Controller("assignments")
@UseGuards(SiakadAuthGuard, SiakadRolesGuard)
@SiakadRoles("admin_unit")
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get("teachers")
  async listTeacherAssignments(
    @CurrentPrincipal() principal: SiakadPrincipal,
    @Query() filter: AssignmentListFilter,
  ) {
    return this.assignmentsService.listTeacherAssignments(principal, filter);
  }

  @Get("teachers/:id")
  async getTeacherAssignment(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.assignmentsService.getTeacherAssignment(principal, id);
  }

  @Post("teachers")
  async createTeacherAssignment(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateTeacherAssignmentDto) {
    return this.assignmentsService.createTeacherAssignment(principal, dto);
  }

  @Patch("teachers/:id")
  async updateTeacherAssignment(
    @CurrentPrincipal() principal: SiakadPrincipal,
    @Param("id") id: string,
    @Body() dto: UpdateTeacherAssignmentDto,
  ) {
    return this.assignmentsService.updateTeacherAssignment(principal, id, dto);
  }

  @Delete("teachers/:id")
  async removeTeacherAssignment(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.assignmentsService.removeTeacherAssignment(principal, id);
  }

  @Get("homerooms")
  async listHomeroomAssignments(
    @CurrentPrincipal() principal: SiakadPrincipal,
    @Query() filter: AssignmentListFilter,
  ) {
    return this.assignmentsService.listHomeroomAssignments(principal, filter);
  }

  @Get("homerooms/:id")
  async getHomeroomAssignment(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.assignmentsService.getHomeroomAssignment(principal, id);
  }

  @Post("homerooms")
  async createHomeroomAssignment(@CurrentPrincipal() principal: SiakadPrincipal, @Body() dto: CreateHomeroomAssignmentDto) {
    return this.assignmentsService.createHomeroomAssignment(principal, dto);
  }

  @Patch("homerooms/:id")
  async updateHomeroomAssignment(
    @CurrentPrincipal() principal: SiakadPrincipal,
    @Param("id") id: string,
    @Body() dto: UpdateHomeroomAssignmentDto,
  ) {
    return this.assignmentsService.updateHomeroomAssignment(principal, id, dto);
  }

  @Delete("homerooms/:id")
  async removeHomeroomAssignment(@CurrentPrincipal() principal: SiakadPrincipal, @Param("id") id: string) {
    return this.assignmentsService.removeHomeroomAssignment(principal, id);
  }
}
