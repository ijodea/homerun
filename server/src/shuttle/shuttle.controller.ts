import { Controller, Get,Query } from '@nestjs/common';
import { ShuttleService } from './shuttle.service';
//주어진 경로에 대해 다음 셔틀 버스의 정보를 제공하는 기능 수행
@Controller('shuttle')
export class ShuttleController {
  constructor(private readonly shuttleService: ShuttleService) {}

  @Get('mju-to-giheung')
  getMtoGShuttle(@Query('day') day?: string) {
    const currentTime = new Date();
    const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    // day 검증
    if (!day || !validDays.includes(day.toUpperCase())) {
      return { error: 'Invalid or missing day parameter. Please provide a valid day (e.g., MON, TUE).' };
    }
    // 명지대 -> 명지대역 -> 에버라인
    const m = this.shuttleService.getMStationTimeMtoG(currentTime); // 명지대 -> 명지대역
    const el = m !== null ? this.shuttleService.getEverlineTimeMtoG(currentTime) : null; // 명지대역 -> 기흥역
    const g = this.shuttleService.getGStationTimeMtoG(day, currentTime); // 기흥역 직통

    const options = [
      { type: '기흥역 직통 셔틀', time: g },
      { type: '명지대역 셔틀 + 에버라인', time: el !== null && m !== null ? m + el : null },
    ].filter((option) => option.time !== null);

    if (options.length === 0) {
      return { message: '오늘은 더 이상 셔틀이 없습니다.' };
    }

    const fastestOption = options.reduce((a, b) => (a.time! < b.time! ? a : b));
    return { nextShuttle: fastestOption.type, time: fastestOption.time };
  }

  @Get('giheung-to-mju')
  getGtoMShuttle(@Query('day') day?: string) {
    const currentTime = new Date();
    const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    // day 검증
    if (!day || !validDays.includes(day.toUpperCase())) {
      return { error: 'Invalid or missing day parameter. Please provide a valid day (e.g., MON, TUE).' };
    }
    // 기흥역 -> 에버라인 -> 명지대역 셔틀
    const el = this.shuttleService.getEverlineTimeGtoM(currentTime); // 기흥역 -> 명지대역
    const m = el !== null ? this.shuttleService.getMStationTimeGtoM(currentTime) : null; // 명지대역 -> 명지대
    const g = this.shuttleService.getGStationTimeGtoM(day, currentTime); // 기흥역 직통

    const options = [
      { type: '기흥역 직통 셔틀', time: g },
      { type: '에버라인 + 명지대역 셔틀', time: el !== null && m !== null ? el + m : null },
    ].filter((option) => option.time !== null);

    if (options.length === 0) {
      return { message: '오늘은 더 이상 셔틀이 없습니다.' };
    }
    const fastestOption = options.reduce((a, b) => (a.time! < b.time! ? a : b));
    return { nextShuttle: fastestOption.type, time: fastestOption.time };
  }

  // @Get('next')
  // getNextShuttle() {
  //   const currentTime = new Date();
  //   const m = this.shuttleService.getMStationTime(currentTime);
  //   const el = this.shuttleService.getEverlineTime(m, currentTime);
  //   const g = this.shuttleService.getGStationTime(currentTime);

  //   const eta_el = el + 16;
  //   const eta_g = g + 15;

  //   if (m !== null && g !== null && el !== null) {
  //     if (eta_g <= eta_el) {
  //       return { nextShuttle: '기흥역 셔틀버스', time: g };
  //     } else {
  //       return { nextShuttle: '명지대역 셔틀버스', time: m };
  //     }
  //   } else {
  //     return { message: '오늘은 더 이상 셔틀이 없습니다.' };
  //   }
  // }
}
