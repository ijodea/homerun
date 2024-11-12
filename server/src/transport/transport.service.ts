import { Injectable } from '@nestjs/common';
import { BusService } from '../bus/bus.service';
import { ShuttleService } from '../shuttle/shuttle.service';


@Injectable()
export class TransportService {
  private readonly timeWeight = 0.4;
  private readonly costWeight = 0.6;

  constructor(
    private readonly busService: BusService,
    private readonly shuttleService: ShuttleService,
  ) {}
//셔틀 및 에버라인 정보 가져오기
  async getOptimalTransport(stationId: string, busNumbers: string[], currentTime: Date, direction: string) {
    const busInfo = await this.busService.getBusArrivalInfo(stationId, busNumbers);

//에버라인 시간 합산
    const shuttleToGiheung = this.shuttleService.getGStationTime(currentTime); // 기흥역까지 바로 가는 셔틀 시간
const shuttleToMjuStation = this.shuttleService.getMStationTime(currentTime); // 명지대역까지 가는 셔틀 시간

// 에버라인 시간 합산
    const totalShuttleTime = shuttleToMjuStation !== null
      ? shuttleToMjuStation + (this.shuttleService.getEverlineTime(shuttleToMjuStation, currentTime) || 0)
      : shuttleToGiheung;


    // 가중치 기반 효율성 계산 함수
    const calculateEfficiency = (time: number, cost: number) => {
      const timeScore = (60 - Math.min(time, 60)) / 60 * this.timeWeight;
      const costScore = (10000 - Math.min(cost, 10000)) / 10000 * this.costWeight;
      return timeScore + costScore;
    };

    // 각 교통수단별 효율성 계산
    const busOptions = busInfo.map((bus) => {
      const arrivalTime = parseInt(bus.도착시간); // 도착 시간 파싱
      const cost = bus.버스번호 === '820' || bus.버스번호 === 'Everline' ? 1450 : 2800;

      return {
        type: '버스',
        number: bus.버스번호,
        arrivalTime,
        cost,
        efficiency: calculateEfficiency(arrivalTime, cost),
      };
    });

    const shuttleOption = {
      type: '셔틀버스',
      arrivalTime: totalShuttleTime,
      cost: 0, // 셔틀버스는 무료
      efficiency: calculateEfficiency(totalShuttleTime, 0),
    };

    // 모든 옵션 중 가장 효율적인 교통수단 선택
    const allOptions = [...busOptions, shuttleOption];
    allOptions.sort((a, b) => b.efficiency - a.efficiency);

    return {
      optimalTransport: allOptions[0],
      options: allOptions,
    };
  }
}
