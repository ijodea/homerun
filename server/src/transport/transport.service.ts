import { Injectable } from '@nestjs/common';
import { BusService } from '../bus/bus.service';
import { ShuttleService } from '../shuttle/shuttle.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TransportService {
  constructor(
    private readonly busService: BusService,
    private readonly shuttleService: ShuttleService,
    private readonly configService: ConfigService,
  ) {}

  async calculateScores(
    transportOptions: {
      type: string;
      waitingTime: number | null;
      totalTime: number | null;
      cost: number;
      seats?: number;
      bonus?: number;
      departureTime?: Date;
      arrivalTime?: Date;
    }[],
  ) {
    const DEFAULT_WEIGHTS = { waitingTime: 0.4, totalTime: 0.4, cost: 0.2 };

    const MAX_COST = 2800;
    const MAX_WAITING_TIME = 30;
    const MAX_TOTAL_TIME = 90;

    return transportOptions
      .map((option) => {
        if (option.waitingTime === null || option.totalTime === null) {
          return { type: option.type, score: -Infinity }; // 유효하지 않은 옵션 제외
        }

        // 대기시간 점수
        const waitingScore =
          ((MAX_WAITING_TIME - option.waitingTime) / MAX_WAITING_TIME) * 100 * DEFAULT_WEIGHTS.waitingTime;

        // 총 소요시간 점수
        const totalTimeScore =
          ((MAX_TOTAL_TIME - option.totalTime) / MAX_TOTAL_TIME) * 100 * DEFAULT_WEIGHTS.totalTime;

        // 비용 점수
        const costScore = ((MAX_COST - option.cost) / MAX_COST) * 100 * DEFAULT_WEIGHTS.cost;

        // 좌석 페널티
        const seatPenalty = option.seats !== undefined && option.seats < 10 ? -10 : 0; // 좌석 10석 미만 페널티

        // 보너스 점수
        const bonusScore = option.bonus || 0;

        // 최종 점수
        const totalScore = waitingScore + totalTimeScore + costScore + seatPenalty + bonusScore;

        return { ...option, score: totalScore };
      })
      .filter((option) => option.score > -Infinity) // 유효한 옵션만 남김
      .sort((a, b) => b.score - a.score); // 점수 내림차순 정렬
  }

  async getRankedOptions(currentTime: Date, day: string) {
    const validDays = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
    if (!validDays.includes(day.toUpperCase())) {
      throw new Error('Invalid day parameter. Provide a valid day (e.g., MON, TUE).');
    }

    const mjuToGiheungStationId = this.configService.get<string>('MJU_TO_GIHEUNG_STATION_ID');
    const giheungToMjuStationId = this.configService.get<string>('GIHEUNG_TO_MJU_STATION_ID');
    const busNumbers = this.configService.get<string>('BUS_NUMBERS').split(',');

    const calculateArrivalTime = (departureMinutes: number, travelMinutes: number) => {
      const departureTimeUTC = new Date(currentTime.getTime() + departureMinutes * 60000);
      const arrivalTimeUTC = new Date(departureTimeUTC.getTime() + travelMinutes * 60000);

      // UTC -> KST 변환
      const departureTimeKST = new Date(departureTimeUTC.getTime() + 9 * 60 * 60 * 1000);
      const arrivalTimeKST = new Date(arrivalTimeUTC.getTime() + 9 * 60 * 60 * 1000);

      return { departureTime: departureTimeKST, arrivalTime: arrivalTimeKST };
    };

    // 1. 기흥역 → 명지대
    const elToMju = this.shuttleService.getEverlineTimeGtoM(currentTime);
    const mStationToMju = elToMju !== null ? this.shuttleService.getMStationTimeGtoM(currentTime) : null;
    const directShuttleGtoM = this.shuttleService.getGStationTimeGtoM(day, currentTime);

    const busArrivalDataGtoM = await this.busService.getBusArrivalInfo(giheungToMjuStationId, busNumbers);

    const busOptionsGtoM = busArrivalDataGtoM.map((bus) => {
      const travelTime = bus.버스번호 === '820' ? 44 : 60; // 이동 시간 예시값
      const { departureTime, arrivalTime } = calculateArrivalTime(parseInt(bus.도착시간, 10), travelTime);

      return {
        type: `버스 (${bus.버스번호})`,
        waitingTime: parseInt(bus.도착시간, 10),
        totalTime: parseInt(bus.도착시간, 10) + travelTime,
        cost: bus.버스번호 === '820' ? 1450 : 2800,
        seats: bus.남은좌석수 !== '정보 없음' ? parseInt(bus.남은좌석수, 10) : undefined,
        bonus: bus.버스번호 === '820' ? 5 : 0,
        departureTime,
        arrivalTime,
      };
    });

    const optionsGtoM = [
      {
        type: '기흥역 직통 셔틀',
        waitingTime: directShuttleGtoM,
        totalTime: 30,
        cost: 0,
        ...calculateArrivalTime(directShuttleGtoM || 0, 30),
      },
      {
        type: '에버라인 + 명지대역 셔틀',
        waitingTime: elToMju,
        totalTime: elToMju !== null && mStationToMju !== null ? elToMju + mStationToMju : null,
        cost: 1450,
        ...calculateArrivalTime(elToMju || 0, 41), // 예시값: 에버라인 + 셔틀 이동 시간
      },
      ...busOptionsGtoM,
    ];

    const rankedGtoM = await this.calculateScores(optionsGtoM);

    // 2. 명지대 → 기흥역
    const mStationToGiheung = await this.shuttleService.getMStationTimeMtoG(currentTime);
    const elToGiheung = mStationToGiheung !== null ? await this.shuttleService.getEverlineTimeMtoG(currentTime) : null;
    const directShuttleMtoG = await this.shuttleService.getGStationTimeMtoG(day, currentTime);

    const busArrivalDataMtoG = await this.busService.getBusArrivalInfo(mjuToGiheungStationId, busNumbers);

    const busOptionsMtoG = busArrivalDataMtoG.map((bus) => {
      const travelTime = bus.버스번호 === '820' ? 44 : 60; // 이동 시간 예시값
      const { departureTime, arrivalTime } = calculateArrivalTime(parseInt(bus.도착시간, 10), travelTime);

      return {
        type: `버스 (${bus.버스번호})`,
        waitingTime: parseInt(bus.도착시간, 10),
        totalTime: parseInt(bus.도착시간, 10) + travelTime,
        cost: bus.버스번호 === '820' ? 1450 : 2800,
        seats: bus.남은좌석수 !== '정보 없음' ? parseInt(bus.남은좌석수, 10) : undefined,
        bonus: bus.버스번호 === '820' ? 5 : 0,
        departureTime,
        arrivalTime,
      };
    });

    const optionsMtoG = [
      {
        type: '명지대 → 기흥역 셔틀',
        waitingTime: directShuttleMtoG,
        totalTime: 30,
        cost: 0,
        ...calculateArrivalTime(directShuttleMtoG || 0, 30),
      },
      {
        type: '명지대역 셔틀 + 에버라인',
        waitingTime: mStationToGiheung,
        totalTime: mStationToGiheung !== null && elToGiheung !== null ? mStationToGiheung + elToGiheung : null,
        cost: 1450,
        ...calculateArrivalTime(mStationToGiheung || 0, 41), // 예시값: 셔틀 + 에버라인 이동 시간
      },
      ...busOptionsMtoG,
    ];

    const rankedMtoG = await this.calculateScores(optionsMtoG);

    return {
      gToM: rankedGtoM.slice(0, 3),
      mToG: rankedMtoG.slice(0, 3),
    };
  }
}
