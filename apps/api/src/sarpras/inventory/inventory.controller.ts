import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '@sim/database';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { CreateInventorySchema, UpdateInventorySchema, CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @Roles(UserRole.super_admin, UserRole.admin_biro, UserRole.admin_bidang)
  async findAll(@Query() query: any) {
    return this.inventoryService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.super_admin, UserRole.admin_biro, UserRole.admin_bidang)
  async getStats() {
    return this.inventoryService.getStats();
  }

  @Get(':id')
  @Roles(UserRole.super_admin, UserRole.admin_biro, UserRole.admin_bidang)
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findOne(id);
  }

  @Post()
  @Roles(UserRole.super_admin, UserRole.admin_biro, UserRole.admin_bidang)
  async create(@Body(new ZodValidationPipe(CreateInventorySchema)) dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Put(':id')
  @Roles(UserRole.super_admin, UserRole.admin_biro, UserRole.admin_bidang)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateInventorySchema)) dto: UpdateInventoryDto,
  ) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @Roles(UserRole.super_admin, UserRole.admin_biro, UserRole.admin_bidang)
  async remove(@Param('id') id: string) {
    return this.inventoryService.remove(id);
  }
}
