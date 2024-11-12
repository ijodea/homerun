import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShuttleService {
  private getFilePath(filename: string): string {
    // 프로젝트 루트 디렉토리 기준으로 경로 설정
    return path.join(process.cwd(), 'src', 'timetable', filename);
  }

  getGStationTime(currentTime: Date): number | null {
    const csvFilePath = this.getFilePath('gStation.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const MJUtoGS = lines.slice(1).map((line) => {
        const columns = line.split(',');
        const depart_school_m = Number(columns[2]);
        return depart_school_m;
      });

      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();
      const nextBusMinutes = MJUtoGS.find(
        (busTime) => busTime >= currentMinutes,
      );

      return nextBusMinutes !== undefined
        ? nextBusMinutes - currentMinutes
        : null;
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }

  getMStationTime(currentTime: Date): number | null {
    const csvFilePath = this.getFilePath('mStation.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const MJUtoMS = lines.slice(1).map((line) => {
        const columns = line.split(',');
        const depart_school_m = Number(columns[2]);
        return depart_school_m;
      });

      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();
      const nextBusMinutes = MJUtoMS.find(
        (busTime) => busTime >= currentMinutes,
      );

      return nextBusMinutes !== undefined
        ? nextBusMinutes - currentMinutes
        : null;
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }

  getEverlineTime(m: number, currentTime: Date): number | null {
    const csvFilePath = this.getFilePath('everline.csv');
    try {
      const csvData = fs.readFileSync(csvFilePath, 'utf8');
      const lines = csvData.trim().split('\n');
      const MStoGS = lines.slice(1).map((line) => {
        const columns = line.split(',');
        const depart_school_m = Number(columns[0]);
        return depart_school_m;
      });

      m += 10;
      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();
      const nextSubwayMinutes = MStoGS.find(
        (subwayTime) => subwayTime >= m + currentMinutes,
      );

      return nextSubwayMinutes !== undefined
        ? nextSubwayMinutes - currentMinutes
        : null;
    } catch (error) {
      console.error(`Error reading file ${csvFilePath}:`, error);
      return null;
    }
  }
}
