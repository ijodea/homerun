import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
//셔틀버스와 지하철의 도착 정보를 가져오는 비즈니스 로직 포함.
@Injectable()
export class ShuttleService {
  getGStationTime(currentTime: Date): number | null {
    const csvFilePath = path.join(__dirname, '../timetable/gStation.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvData.trim().split('\n');
    const MJUtoGS = lines.slice(1).map(line => {
      const columns = line.split(',');
      const depart_school_m = Number(columns[2]);
      return depart_school_m;
    });

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nextBusMinutes = MJUtoGS.find(busTime => busTime >= currentMinutes);

    return nextBusMinutes !== undefined ? nextBusMinutes - currentMinutes : null;
  }

  getMStationTime(currentTime: Date): number | null {
    const csvFilePath = path.join(__dirname, '../timetable/mStation.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvData.trim().split('\n');
    const MJUtoMS = lines.slice(1).map(line => {
      const columns = line.split(',');
      const depart_school_m = Number(columns[2]);
      return depart_school_m;
    });

    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nextBusMinutes = MJUtoMS.find(busTime => busTime >= currentMinutes);

    return nextBusMinutes !== undefined ? nextBusMinutes - currentMinutes : null;
  }

  getEverlineTime(m: number, currentTime: Date): number | null {
    const csvFilePath = path.join(__dirname, '../timetable/everline.csv');
    const csvData = fs.readFileSync(csvFilePath, 'utf8');
    const lines = csvData.trim().split('\n');
    const MStoGS = lines.slice(1).map(line => {
      const columns = line.split(',');
      const depart_school_m = Number(columns[0]);
      return depart_school_m;
    });

    m += 10;
    const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nextSubwayMinutes = MStoGS.find(subwayTime => subwayTime >= m + currentMinutes);

    return nextSubwayMinutes !== undefined ? nextSubwayMinutes - currentMinutes : null;
  }
}
