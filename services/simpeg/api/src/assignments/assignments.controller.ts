import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AssignmentsService } from "./assignments.service";
import { CreateAssignmentDto, UpdateAssignmentDto } from "./assignments.dto";
import { ServiceJwtAuthGuard } from "@alfida/auth-sdk";

@Controller("assignments")
@UseGuards(ServiceJwtAuthGuard)
export class AssignmentsController {
  constructor(private readonly assignmentsService: AssignmentsService) {}

  @Get()
  async findAll(
    @Query("unitId") unitId?: string,
    @Query("userId") userId?: string,
    @Query("role") role?: string
  ) {
    return this.assignmentsService.findAll({ unitId, userId, role });
  }

  @Get("summary")
  async getUnitSummary() {
    return this.assignmentsService.getUnitSummary();
  }

  @Get("user/:userId")
  async findByUserId(@Param("userId") userId: string) {
    return this.assignmentsService.findByUserId(userId);
  }

  @Get(":id")
  async findOne(@Param("id") id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(dto);
  }

  @Put(":id")
  async update(@Param("id") id: string, @Body() dto: UpdateAssignmentDto) {
    return this.assignmentsService.update(id, dto);
  }

  @Delete(":id")
  async remove(@Param("id") id: string) {
    return this.assignmentsService.remove(id);
  }
}
