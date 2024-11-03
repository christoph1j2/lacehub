import { Test, TestingModule } from '@nestjs/testing';
import { WtbController } from './wtb.controller';

describe('WtbController', () => {
  let controller: WtbController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WtbController],
    }).compile();

    controller = module.get<WtbController>(WtbController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
