import { Controller, Get } from '@nestjs/common';
import { ShuttleService } from './shuttle.service';
//주어진 경로에 대해 다음 셔틀 버스의 정보를 제공하는 기능 수행
@Controller('shuttle')
export class ShuttleController {
  constructor(private readonly shuttleService: ShuttleService) {}

  @Get('mju-to-giheung')
  getMtoGShuttle() {
    const currentTime = new Date();
    const m = this.shuttleService.getMStationTimeMtoG(currentTime);
    const g = this.shuttleService.getGStationTimeMtoG(currentTime);

    if (m !== null && g !== null) {
      if (g <= m) {
        return { nextShuttle: '기흥역 셔틀버스', time: g };
      } else {
        return { nextShuttle: '명지대역 셔틀버스', time: m };
      }
    } else {
      return { message: '오늘은 더 이상 셔틀이 없습니다.' };
    }
  }

  @Get('giheung-to-mju')
  getGtoMShuttle() {
    const currentTime = new Date();
    const m = this.shuttleService.getMStationTimeGtoM(currentTime);
    const el = this.shuttleService.getEverlineTimeGtoM(m, currentTime);
    const g = this.shuttleService.getGStationTimeGtoM(currentTime);

    const eta_el = el + 16;
    const eta_g = g + 15;

    if (m !== null && g !== null && el !== null) {
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