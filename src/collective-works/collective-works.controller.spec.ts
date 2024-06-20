import { Test, TestingModule } from '@nestjs/testing';
import { CollectiveWorksController } from './collective-works.controller';
import { CollectiveWorksService } from './collective-works.service';

describe('CollectiveWorksController', () => {
  let controller: CollectiveWorksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectiveWorksController],
      providers: [CollectiveWorksService],
    }).compile();

    controller = module.get<CollectiveWorksController>(
      CollectiveWorksController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
