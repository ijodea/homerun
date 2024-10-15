import { Test, TestingModule } from '@nestjs/testing';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';

describe('BusController', () => {
  let busController: BusController;
  let busService: BusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BusController],
      providers: [BusService],
    }).compile();

    busController = module.get<BusController>(BusController);
    busService = module.get<BusService>(BusService);
  });

  it('should be defined', () => {
    expect(busController).toBeDefined();
  });

  // 여기에 추가적인 테스트 케이스를 작성할 수 있습니다.
});
