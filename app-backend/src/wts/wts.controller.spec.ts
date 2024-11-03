import { Test, TestingModule } from '@nestjs/testing';
import { WtsController } from './wts.controller';

describe('WtsController', () => {
  let controller: WtsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WtsController],
    }).compile();

    controller = module.get<WtsController>(WtsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
