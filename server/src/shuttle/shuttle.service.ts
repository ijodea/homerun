import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShuttleService {
  private getFilePath(filename: string): string {
    return path.join(process.cwd(), 'src', 'timetable', filename);
  }

  // CSV 파일 읽기 및 숫자 데이터 변환
  private readCSV(filename: string): any[] {
    try {
      const csvData = fs.readFileSync(this.getFilePath(filename), 'utf8');
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      return lines.slice(1).map((line) => {
        const values = line.split(',');
        return headers.reduce((acc, header, index) => {
          acc[header] = isNaN(Number(values[index]))
            ? values[index]
            : Number(values[index]); // 숫자로 변환 가능한 값은 숫자로 변환
          return acc;
        }, {} as Record<string, any>);
      });
    } catch (error) {
      console.error(`Error reading file ${filename}:`, error);
      return [];
    }
  }

  // 직행 셔틀 시간을 계산
  getShuttleDirect(day: string, currentTime: Date, direction: 'GtoM' | 'MtoG'): number | null {
    const data = this.readCSV('gStation.csv');
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // 요일별 데이터 필터링
    const column = direction === 'GtoM' ? `${day}_SCHOOL_DEPART` : `${day}_STATION_DEPART`;

    const nextShuttle = data.find((row) => {
      const time = row[column];
      if (!time) return false;
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes >= currentMinutes;
    });

    if (!nextShuttle || !nextShuttle[column]) return null;
    const [hours, minutes] = nextShuttle[column].split(':').map(Number);
    return hours * 60 + minutes - currentMinutes;
  }

  // 에버라인 + 셔틀
  getEverlinePlusShuttle(currentTime: Date, direction: 'GtoM' | 'MtoG'): number | null {
    const mStationData = this.readCSV('mStation.csv');
    const everlineData = this.readCSV('everline.csv');
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    if (direction === 'GtoM') {
      // 명지대 → 기흥역
      const mStationArrival = mStationData.find(
        (row) => row.depart_school >= currentMinutes,
      );
      if (!mStationArrival) return null;

      const stationArrivalTime = mStationArrival.depart_station + 5;

      const nextEverline = everlineData.find(
        (row) => row.m_depart >= stationArrivalTime,
      );
      return nextEverline
        ? nextEverline.g_arrive - currentMinutes
        : null;
    } else {
      // 기흥역 → 명지대
      const nextShuttle = mStationData.find(
        (row) => row.depart_station >= currentMinutes,
      );
      if (!nextShuttle) return null;

      const shuttleDepartTime = nextShuttle.depart_station;

      const closestEverline = everlineData
        .filter((row) => row.m_arrive <= shuttleDepartTime)
        .sort((a, b) => b.m_arrive - a.m_arrive)[0];

      if (!closestEverline) return null;

      return shuttleDepartTime - closestEverline.g_depart;
    }
  }

  // 최적 경로 계산
  getAllTransportOptions(
    day: string,
    currentTime: Date,
  ): { type: string; remainingTime: number; totalTime: number; arrivalTime: string }[] {
    const results = [];
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

    // 1. 기흥역 직통 셔틀 (명지대 → 기흥역)
    const directToG = this.getShuttleDirect(day, currentTime, 'GtoM');
    if (directToG !== null) {
      const totalTime = directToG; // 직통은 남은 시간 = 총 소요 시간
      const arrivalTime = new Date(currentTime.getTime() + totalTime * 60 * 1000);
      results.push({
        type: '기흥역 직통 셔틀',
        remainingTime: directToG,
        totalTime,
        arrivalTime: arrivalTime.toTimeString().slice(0, 5),
      });
    }

    // 2. 명지대역 셔틀 + 에버라인 (명지대 → 기흥역)
    const shuttleToEverline = this.getEverlinePlusShuttle(currentTime, 'GtoM');
    if (shuttleToEverline !== null) {
      const arrivalTime = new Date(currentTime.getTime() + shuttleToEverline * 60 * 1000);
      results.push({
        type: '명지대역 셔틀 + 에버라인',
        remainingTime: shuttleToEverline,
        totalTime: shuttleToEverline, // 총 소요 시간 == 남은 시간
        arrivalTime: arrivalTime.toTimeString().slice(0, 5),
      });
    }

    // 3. 명지대 직통 셔틀 (기흥역 → 명지대)
    const directToM = this.getShuttleDirect(day, currentTime, 'MtoG');
    if (directToM !== null) {
      const totalTime = directToM; // 직통은 남은 시간 = 총 소요 시간
      const arrivalTime = new Date(currentTime.getTime() + totalTime * 60 * 1000);
      results.push({
        type: '명지대 직통 셔틀',
        remainingTime: directToM,
        totalTime,
        arrivalTime: arrivalTime.toTimeString().slice(0, 5),
      });
    }

    // 4. 에버라인 + 명지대역 셔틀 (기흥역 → 명지대)
    const everlineToShuttle = this.getEverlinePlusShuttle(currentTime, 'MtoG');
    if (everlineToShuttle !== null) {
      const arrivalTime = new Date(currentTime.getTime() + everlineToShuttle * 60 * 1000);
      results.push({
        type: '에버라인 + 명지대역 셔틀',
        remainingTime: everlineToShuttle,
        totalTime: everlineToShuttle, // 총 소요 시간 == 남은 시간
        arrivalTime: arrivalTime.toTimeString().slice(0, 5),
      });
    }

    return results;
  }
}
