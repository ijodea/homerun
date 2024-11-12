import { Controller, Get } from '@nestjs/common';
import { ShuttleService } from './shuttle.service';

@Controller('shuttle')
export class ShuttleController {
  constructor(private readonly shuttleService: ShuttleService) {}

  @Get('next')
  async getNextShuttle() {
    const currentTime = new Date();
    const m = await this.shuttleService.getMStationTime(currentTime);
    const el = await this.shuttleService.getEverlineTime(m, currentTime);
    const g = await this.shuttleService.getGStationTime(currentTime);

    const eta_el = el !== null ? el + 16 : null;
    const eta_g = g !== null ? g + 15 : null;

    if (m !== 0 && g !== null && el !== null) {
      if (eta_g <= eta_el) {
        return { nextShuttle: '기흥역 셔틀버스', time: g };
      } else {
        return { nextShuttle: '명지대역 셔틀버스', time: m };
      }
    } else {
      return { message: '오늘은 더 이상 셔틀이 없습니다.' };
    }
  }
}
