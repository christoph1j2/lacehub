import { Test, TestingModule } from '@nestjs/testing';
import { WtbService } from './wtb.service';

describe('WtbService', () => {
  let service: WtbService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WtbService],
    }).compile();

    service = module.get<WtbService>(WtbService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
