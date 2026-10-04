import { Module } from '@nestjs/common';
import { CorrespondencesController } from './correspondences/correspondences.controller';
import { CorrespondencesService } from './correspondences/correspondences.service';
import { RoomsController } from './rooms/rooms.controller';
import { RoomsService } from './rooms/rooms.service';

@Module({
  controllers: [CorrespondencesController, RoomsController],
  providers: [CorrespondencesService, RoomsService]
})
export class SecretariatModule {}
