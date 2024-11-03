import { Test, TestingModule } from '@nestjs/testing';
import { UserInventoryController } from './user-inventory.controller';

describe('UserInventoryController', () => {
  let controller: UserInventoryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserInventoryController],
    }).compile();

    controller = module.get<UserInventoryController>(UserInventoryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
