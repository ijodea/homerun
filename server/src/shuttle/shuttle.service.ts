import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShuttleService {
  constructor(private httpService: HttpService) {}
  async getGStationTime(currentTime: Date): Promise<number | null> {
    // const csvFilePath = path.join(__dirname, '../timetable/gStation.csv');
    // const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const response = await firstValueFrom(
      this.httpService.get('http://localhost:8000/timetable/gStation.csv'),
    );

    const csvData = response.data;
    const lines = csvData.trim().split('\n');
    const MJUtoGS = lines.slice(1).map((line) => {
      const columns = line.split(',');
      const depart_school_m = Number(columns[2]);
      return depart_school_m;
    });

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nextBusMinutes = MJUtoGS.find((busTime) => busTime >= currentMinutes);

    return nextBusMinutes !== undefined ? nextBusMinutes - currentMinutes : null;
  }

  // 명지대 방향 셔틀버스의 다음 도착 시간 계산
  getMStationTime(currentTime: Date): number | null {
    const MJUtoMS = this.parseCsvFile(path.join(__dirname, '../timetable/mStation.csv'), 2);
    if (!MJUtoMS) return null;

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nextBusMinutes = MJUtoMS.find((busTime) => busTime >= currentMinutes);

    return nextBusMinutes !== undefined ? nextBusMinutes - currentMinutes : null;
  }

  // 에버라인 지하철의 다음 도착 시간 계산
  getEverlineTime(estimatedTravelTimeToStation: number, currentTime: Date): number | null {
    const MStoGS = this.parseCsvFile(path.join(__dirname, '../timetable/everline.csv'), 0);
    if (!MStoGS) return null;

    // 추가된 10분의 대기 시간을 고려하여 현재 시간 계산
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes() + estimatedTravelTimeToStation;
    const nextSubwayMinutes = MStoGS.find((subwayTime) => subwayTime >= currentMinutes);

    return nextSubwayMinutes !== undefined ? nextSubwayMinutes - currentMinutes : null;
  }

  // 모든 셔틀 및 지하철의 도착 정보 반환 메서드
  getAllTransportOptions(currentTime: Date): { station: string, arrivalTime: number | null, cost: number, remainingSeats: number | null }[] {
    const gStationArrival = this.getGStationTime(currentTime);
    const mStationArrival = this.getMStationTime(currentTime);
    const everlineArrival = this.getEverlineTime(10, currentTime); // 예시로 10분을 더함

    return [
      { station: 'GStation Shuttle', arrivalTime: gStationArrival, cost: 0, remainingSeats: null },
      { station: 'MStation Shuttle', arrivalTime: mStationArrival, cost: 0, remainingSeats: null },
      { station: 'Everline Subway', arrivalTime: everlineArrival, cost: 1450, remainingSeats: null }
    ];
  }
}
