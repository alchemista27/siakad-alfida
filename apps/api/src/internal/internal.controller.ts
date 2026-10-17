import {
  Controller,
  Post,
  Get,
  Body,
  Headers,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InternalService } from './internal.service';

@Controller('internal')
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  private verifySecret(secretKey?: string) {
    const expectedKey = process.env.INTERNAL_SERVICE_SECRET;
    if (!expectedKey || !expectedKey.trim()) {
      throw new InternalServerErrorException('Layanan internal belum dikonfigurasi.');
    }

    if (!secretKey || secretKey !== expectedKey) {
      throw new UnauthorizedException('Kunci layanan internal tidak valid.');
    }
  }

  @Post('spmb-handoff')
  async handleSpmbHandoff(
    @Headers('x-internal-service-key') secretKey: string,
    @Body() payload: any
  ) {
    this.verifySecret(secretKey);
    return this.internalService.handoffSpmb(payload);
  }

  @Get('units')
  async getUnits(@Headers('x-internal-service-key') secretKey: string) {
    this.verifySecret(secretKey);
    return this.internalService.getUnits();
  }
}
