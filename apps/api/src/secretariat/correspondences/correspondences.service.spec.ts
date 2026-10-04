import { Test, TestingModule } from '@nestjs/testing';
import { CorrespondencesService } from './correspondences.service';

describe('CorrespondencesService', () => {
  let service: CorrespondencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CorrespondencesService],
    }).compile();

    service = module.get<CorrespondencesService>(CorrespondencesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
