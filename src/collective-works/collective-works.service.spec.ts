import { Test, TestingModule } from '@nestjs/testing';
import { CollectiveWorksService } from './collective-works.service';

describe('CollectiveWorksService', () => {
  let service: CollectiveWorksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectiveWorksService],
    }).compile();

    service = module.get<CollectiveWorksService>(CollectiveWorksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
