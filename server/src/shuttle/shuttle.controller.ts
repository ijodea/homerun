import { Controller, Get } from '@nestjs/common';
import { ShuttleService } from './shuttle.service';
//주어진 경로에 대해 다음 셔틀 버스의 정보를 제공하는 기능 수행
@Controller('shuttle')
export class ShuttleController {
  constructor(private readonly shuttleService: ShuttleService) {}

  private getKoreanTime(): Date {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
    return new Date(utc + 60 * 60 * 1000 * 9);
  }

  private getDay(): string {
    const newTime = this.getKoreanTime();
    const newDay = newTime.getDay();
    switch (newDay) {
      case 1:
        return 'MON';
      case 2:
        return 'TUE';
      case 3:
        return 'WED';
      case 4:
        return 'THU';
      case 5:
        return 'FRI';
    }
  }

  @Get('mju-to-giheung')
  getMtoGShuttle() {
    const currentTime = this.getKoreanTime();
    const today = this.getDay();
    const m = this.shuttleService.getMStationTimeMtoG(currentTime);
    const el = this.shuttleService.getEverlineTimeMtoG(m, currentTime);
    const g = this.shuttleService.getGStationTimeMtoG(today, currentTime);

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

  @Get('giheung-to-mju')
  getGtoMShuttle() {
    const currentTime = this.getKoreanTime();
    const today = this.getDay();
    const el = this.shuttleService.getEverlineTimeGtoM(currentTime);
    const m = this.shuttleService.getMStationTimeGtoM(el, currentTime);
    const g = this.shuttleService.getGStationTimeGtoM(today, currentTime);

    const eta_m = m + 10;
    const eta_g = g + 15;

    if (m !== null && g !== null && el !== null) {
      if (eta_g <= eta_m) {
        return { nextShuttle: '기흥역 셔틀버스', time: g };
      } else {
        return { nextShuttle: '명지대역 셔틀버스', time: m };
      }
    } else {
      return { message: '오늘은 더 이상 셔틀이 없습니다.' };
    }
  }
}
