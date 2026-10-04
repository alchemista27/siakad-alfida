import { Test, TestingModule } from '@nestjs/testing';
import { CorrespondencesController } from './correspondences.controller';

describe('CorrespondencesController', () => {
  let controller: CorrespondencesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CorrespondencesController],
    }).compile();

    controller = module.get<CorrespondencesController>(CorrespondencesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
