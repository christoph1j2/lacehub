import { Test, TestingModule } from '@nestjs/testing';
import { UserInventoryService } from './user-inventory.service';

describe('UserInventoryService', () => {
  let service: UserInventoryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserInventoryService],
    }).compile();

    service = module.get<UserInventoryService>(UserInventoryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
