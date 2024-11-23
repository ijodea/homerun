import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShuttleService {
  private getFilePath(filename: string): string {
    // 프로젝트 루트 디렉토리 기준으로 경로 설정
    return path.join(process.cwd(), 'src', 'timetable', filename);
  }

  getGStationTimeGtoM(day: string, currentTime: Date): number | null {
    const csvFilePath = this.getFilePath('gStation.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map((line) => line.split(','));
  
      // 요일별 열 선택
      const columnIndex = headers.indexOf(`${day}_STATION_DEPART`);
      if (columnIndex === -1) return null;
  
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      const nextBus = data.find((row) => Number(row[columnIndex]) >= currentMinutes);
  
      return nextBus ? Number(nextBus[columnIndex]) - currentMinutes : null;
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }
  

  getMStationTimeGtoM(currentTime: Date): number | null {
    // 기흥 → 명지대 (명지대역 출발, 명지대 도착 시간 반영)
    const csvFilePath = this.getFilePath('mStation.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map((line) => {
        const values = line.split(',');
        return headers.reduce((acc, header, index) => {
          acc[header] = isNaN(Number(values[index]))
            ? values[index]
            : Number(values[index]); // 숫자로 변환 가능한 값은 숫자로 변환
          return acc;
        }, {} as Record<string, any>);
      });
  
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
      // 현재 시간 이후 명지대역 출발(`depart_station_m`) 셔틀 중 가장 가까운 시간 찾기
      const nextShuttle = data.find((row) => row.depart_station_m >= currentMinutes);
  
      if (!nextShuttle) return null;
  
      // 총 소요 시간 계산: 명지대 도착 시간(`arrive_school_m`)에서 현재 시간 차이
      const totalTime = nextShuttle.arrive_school_m - currentMinutes;
  
      return totalTime >= 0 ? totalTime : null; // 음수 값 방어
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }
  

  getEverlineTimeGtoM(currentTime: Date): number | null {
    // 기흥 -> 명지대
    const csvFilePath = this.getFilePath('everline.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const data = lines.slice(1).map((line) => {
        const [g_depart, m_arrive, m_depart, g_arrive] = line.split(',').map(Number);
        return { g_depart, m_arrive, m_depart, g_arrive };
      });
  
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
      // 에버라인에서 명지대역 도착 시간 기준으로 가장 가까운 데이터 찾기
      const nextSubway = data.find((row) => row.g_depart >= currentMinutes);
  
      return nextSubway
        ? nextSubway.g_arrive - currentMinutes // 기흥역 출발부터 명지대역까지 소요 시간
        : null;
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }
  

  getGStationTimeMtoG(day: string, currentTime: Date): number | null {
    // 명지대 -> 기흥
    const csvFilePath = this.getFilePath('gStation.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map((line) => line.split(','));
  
      // 요일별 열 선택
      const columnIndex = headers.indexOf(`${day}_SCHOOL_ARRIVE`);
      if (columnIndex === -1) {
        console.error(`Invalid day: ${day}`);
        return null; // 잘못된 요일 입력 시 null 반환
      }
  
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
      // 현재 시간 이후 가장 가까운 버스 시간 찾기
      const nextBus = data.find((row) => {
        const busTime = row[columnIndex];
        if (!busTime) return false;
        const [hours, minutes] = busTime.split(':').map(Number);
        return hours * 60 + minutes >= currentMinutes;
      });
  
      if (!nextBus || !nextBus[columnIndex]) return null;
  
      const [hours, minutes] = nextBus[columnIndex].split(':').map(Number);
      return hours * 60 + minutes - currentMinutes; // 현재 시간부터 남은 시간 반환
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }
  

  getEverlineTimeMtoG(currentTime: Date): number | null {
    // 명지대 -> 기흥
    const csvFilePath = this.getFilePath('everline.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const data = lines.slice(1).map((line) => {
        const [g_depart, m_arrive, m_depart, g_arrive] = line.split(',').map(Number);
        return { g_depart, m_arrive, m_depart, g_arrive };
      });
  
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
      // 명지대역 출발 시간 전에 도착하는 에버라인 데이터 찾기
      const closestEverline = data
        .filter((row) => row.m_arrive <= currentMinutes) // 명지대역에 이미 도착 가능한 에버라인만 필터링
        .sort((a, b) => b.m_arrive - a.m_arrive)[0]; // 도착 시간이 가장 가까운 에버라인 선택
  
      if (!closestEverline) return null;
  
      const travelTime = closestEverline.g_arrive - currentMinutes; // 기흥역까지 남은 소요 시간 계산
  
      return travelTime >= 0 ? travelTime : null; // 음수 값이 되지 않도록 방어
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }
  

  getMStationTimeMtoG(currentTime: Date): number | null {
    // 명지대 → 명지대역
    const csvFilePath = this.getFilePath('mStation.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');
      const data = lines.slice(1).map((line) => {
        const values = line.split(',');
        return headers.reduce((acc, header, index) => {
          acc[header] = isNaN(Number(values[index]))
            ? values[index]
            : Number(values[index]); // 숫자로 변환 가능한 값은 숫자로 변환
          return acc;
        }, {} as Record<string, any>);
      });
  
      const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
      // 현재 시간 이후 명지대 출발(`depart_school_m`) 셔틀 중 가장 가까운 시간 찾기
      const nextShuttle = data.find((row) => row.depart_school_m >= currentMinutes);
  
      if (!nextShuttle) return null;
  
      // 총 소요 시간 계산: 명지대역 도착 시간(`depart_station_m`)에서 현재 시간 차이
      const totalTime = nextShuttle.depart_station_m - currentMinutes;
  
      return totalTime >= 0 ? totalTime : null; // 음수 값 방어
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }
  
}  
