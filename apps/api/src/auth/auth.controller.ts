import { Controller, Get, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: any) {
    const user = req.user;
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles
    };
  }

  @Post('update-email')
  @UseGuards(JwtAuthGuard)
  async updateEmail(@Req() req: any, @Body() body: { email: string; password?: string }) {
    if (!body.email || !body.email.includes('@')) {
      throw new BadRequestException("Format email tidak valid");
    }
    if (!body.password) {
      throw new BadRequestException("Password saat ini wajib diisi");
    }

    const account = await this.prisma.account.findFirst({
      where: { userId: req.user.id, providerId: 'credential' }
    });

    if (!account || !account.password) {
      throw new BadRequestException("Akun tidak memiliki password");
    }

    const isMatch = await bcrypt.compare(body.password, account.password);
    if (!isMatch) {
      throw new BadRequestException("Password salah");
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: body.email }
    });

    if (existing && existing.id !== req.user.id) {
      throw new BadRequestException("Email sudah digunakan");
    }

    const updated = await this.prisma.user.update({
      where: { id: req.user.id },
      data: { email: body.email },
      select: { id: true, email: true, fullName: true }
    });

    return updated;
  }
}
