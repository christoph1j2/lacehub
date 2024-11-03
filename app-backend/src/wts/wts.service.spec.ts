import { Test, TestingModule } from '@nestjs/testing';
import { WtsService } from './wts.service';

describe('WtsService', () => {
  let service: WtsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WtsService],
    }).compile();

    service = module.get<WtsService>(WtsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
