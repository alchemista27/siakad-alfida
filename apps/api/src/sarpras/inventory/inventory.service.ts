import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  async findAll(query?: { search?: string; category?: string; condition?: string; departmentId?: string; unitId?: string }) {
    const where: any = {};

    if (query?.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    if (query?.category) {
      where.category = query.category;
    }

    if (query?.condition) {
      where.condition = query.condition;
    }

    if (query?.departmentId) {
      where.departmentId = query.departmentId;
    }

    if (query?.unitId) {
      where.unitId = query.unitId;
    }

    const [items, total] = await Promise.all([
      this.prisma.inventoryItem.findMany({
        where,
        include: {
          department: { select: { id: true, name: true } },
          unit: { select: { id: true, name: true, slug: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.inventoryItem.count({ where }),
    ]);

    return { items, total };
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { id },
      include: {
        department: true,
        unit: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Barang inventaris tidak ditemukan.');
    }

    return item;
  }

  async create(data: CreateInventoryDto) {
    return this.prisma.inventoryItem.create({
      data: {
        code: data.code || null,
        name: data.name,
        category: data.category,
        quantity: data.quantity ?? 1,
        unitOfMeasure: data.unitOfMeasure || 'unit',
        condition: data.condition || 'baik',
        location: data.location || null,
        departmentId: data.departmentId || null,
        unitId: data.unitId || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        purchasePrice: data.purchasePrice ?? null,
        sourceOfFund: data.sourceOfFund || null,
        notes: data.notes || null,
      },
      include: {
        department: true,
        unit: true,
      },
    });
  }

  async update(id: string, data: UpdateInventoryDto) {
    await this.findOne(id);

    return this.prisma.inventoryItem.update({
      where: { id },
      data: {
        ...(data.code !== undefined && { code: data.code }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.quantity !== undefined && { quantity: data.quantity }),
        ...(data.unitOfMeasure !== undefined && { unitOfMeasure: data.unitOfMeasure }),
        ...(data.condition !== undefined && { condition: data.condition }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.departmentId !== undefined && { departmentId: data.departmentId }),
        ...(data.unitId !== undefined && { unitId: data.unitId }),
        ...(data.purchaseDate !== undefined && { purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null }),
        ...(data.purchasePrice !== undefined && { purchasePrice: data.purchasePrice }),
        ...(data.sourceOfFund !== undefined && { sourceOfFund: data.sourceOfFund }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        department: true,
        unit: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.inventoryItem.delete({
      where: { id },
    });
  }

  async getStats() {
    const [totalItems, totalQuantity, conditionCounts, categoryCounts] = await Promise.all([
      this.prisma.inventoryItem.count(),
      this.prisma.inventoryItem.aggregate({
        _sum: { quantity: true },
      }),
      this.prisma.inventoryItem.groupBy({
        by: ['condition'],
        _count: { id: true },
        _sum: { quantity: true },
      }),
      this.prisma.inventoryItem.groupBy({
        by: ['category'],
        _count: { id: true },
      }),
    ]);

    return {
      totalItems,
      totalQuantity: totalQuantity._sum.quantity || 0,
      conditionCounts,
      categoryCounts,
    };
  }
}
