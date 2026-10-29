import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  ValidationPipe,
} from "@nestjs/common";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";
import { SimpegRoles, SimpegRolesGuard } from "../common/guards/simpeg-roles.guard";
import { AssignmentsService } from "./assignments.service";
import {
  CreateAssignmentDto,
  MutateAssignmentDto,
  UpdateAssignmentDto,
} from "./assignments.dto";

const ASSIGNMENT_READ_ROLES = [
  "super_admin",
  "admin_kepegawaian",
  "admin_unit",
  "admin_unit_nondik",
];
const ASSIGNMENT_WRITE_ROLES = ["super_admin", "admin_kepegawaian"];
const strictValidation = new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true });

@Controller("assignments")
@UseGuards(ServiceJwtAuthGuard, SimpegRolesGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  @SimpegRoles(...ASSIGNMENT_READ_ROLES)
  findAll(
    @Query("unitId") unitId: string | undefined,
    @Query("userId") userId: string | undefined,
    @Query("role") role: string | undefined,
    @Req() req: any,
  ) {
    return this.assignmentsService.findAll({ unitId, userId, role }, req.user);
  }

  @Get("summary")
  @SimpegRoles(...ASSIGNMENT_READ_ROLES)
  getUnitSummary(@Req() req: any) {
    return this.assignmentsService.getUnitSummary(req.user);
  }

  @Get("user/:userId")
  @SimpegRoles(...ASSIGNMENT_READ_ROLES)
  findByUserId(@Param("userId") userId: string, @Req() req: any) {
    return this.assignmentsService.findByUserId(userId, req.user);
  }

  @Post()
  @SimpegRoles("super_admin", "admin_kepegawaian")
  create(@Body(strictValidation) dto: CreateAssignmentDto, @Req() req: any) {
    return this.assignmentsService.create(dto, req.user);
  }

  @Post(":id/mutate")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  mutate(
    @Param("id") id: string,
    @Body(strictValidation) dto: MutateAssignmentDto,
    @Req() req: any,
  ) {
    return this.assignmentsService.mutate(id, dto, req.user);
  }

  @Get(":id")
  @SimpegRoles(...ASSIGNMENT_READ_ROLES)
  findOne(@Param("id") id: string, @Req() req: any) {
    return this.assignmentsService.findOne(id, req.user);
  }

  @Put(":id")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  update(
    @Param("id") id: string,
    @Body(strictValidation) dto: UpdateAssignmentDto,
    @Req() req: any,
  ) {
    return this.assignmentsService.update(id, dto, req.user);
  }

  @Delete(":id")
  @SimpegRoles("super_admin", "admin_kepegawaian")
  remove(@Param("id") id: string, @Req() req: any) {
    return this.assignmentsService.remove(id, req.user);
  }
}
