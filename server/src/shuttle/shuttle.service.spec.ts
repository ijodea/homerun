import { Test, TestingModule } from '@nestjs/testing';
import { ShuttleService } from './shuttle.service';

describe('ShuttleService', () => {
  let service: ShuttleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ShuttleService],
    }).compile();

    service = module.get<ShuttleService>(ShuttleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
