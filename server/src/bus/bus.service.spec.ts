import { Test, TestingModule } from '@nestjs/testing';
import { BusService } from './bus.service';

describe('BusService', () => {
  let service: BusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BusService],
    }).compile();

    service = module.get<BusService>(BusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // 추가 테스트 케이스를 여기에 작성할 수 있습니다.
});
