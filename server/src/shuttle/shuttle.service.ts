import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ShuttleService {
  private getFilePath(filename: string): string {
    const possiblePaths = [
      path.join(process.cwd(), 'src', 'timetable', filename),
      path.join(process.cwd(), 'dist', 'timetable', filename),
      path.join(process.cwd(), 'timetable', filename),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) return filePath;
    }
    throw new Error(`timetable file not found: ${filename}`);
  }

  private readCsvFile(filePath: string): string[][] {
    try {
      const csvData = fs.readFileSync(filePath, 'utf8');
      const lines = csvData.trim().split('\n');
      // console.log(`Read ${lines.length} lines from ${filePath}`);
      return lines.map((line) => line.split(','));
    } catch (error) {
      console.error(`Error reading CSV file ${filePath}:`, error);
      throw error;
    }
  }

  getGStationTimeGtoM(currentTime: Date): number | null {
    // 기흥 -> 명지대
    try {
      const csvData = this.readCsvFile(this.getFilePath('gStation.csv'));

      // const lines = csvData.trim().split('\n');
      // const MJUtoGS = lines.slice(1).map((line) => {
      //   const columns = line.split(',');
      //   const depart_school_m = Number(columns[3]);
      //   return depart_school_m;
      // });

      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();

      const MJUtoGS = csvData.slice(1).map((columns) => {
        const minutes = Number(columns[3]);
        return minutes;
      });

      const nextBusMinutes = MJUtoGS.find(
        (busTime) => busTime >= currentMinutes,
      );
      // console.log('Next bus minutes:', nextBusMinutes);

      return nextBusMinutes !== undefined
        ? nextBusMinutes - currentMinutes
        : null;
    } catch (error) {
      // console.error(`Error reading file ${csvFilePath}:`, error);
      console.error('error in getGStationTimeGtoM:', error);
      return null;
    }
  }

  getMStationTimeGtoM(el: number, currentTime: Date): number | null {
    // 기흥 -> 명지대
    try {
      const csvData = this.readCsvFile(this.getFilePath('mStation.csv'));
      // const lines = csvData.trim().split('\n');
      // const MJUtoMS = lines.slice(1).map((line) => {
      //   const columns = line.split(',');
      //   const depart_school_m = Number(columns[3]);
      //   return depart_school_m;
      // });
      el += 16;
      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();

      const MJUtoMS = csvData.slice(1).map((columns) => Number(columns[3]));

      const nextBusMinutes = MJUtoMS.find(
        (busTime) => busTime >= el + currentMinutes,
      );

      return nextBusMinutes !== undefined
        ? nextBusMinutes - currentMinutes
        : null;
    } catch (error) {
      // console.error(`Error reading file ${csvFilePath}:`, error);
      console.error('error in getMstationTimeGtoM:', error);
      return null;
    }
  }

  getEverlineTimeGtoM(currentTime: Date): number | null {
    // 기흥 -> 명지대
    try {
      const csvData = this.readCsvFile(this.getFilePath('everline.csv'));
      // const lines = csvData.trim().split('\n');
      // const MStoGS = lines.slice(1).map((line) => {
      //   const columns = line.split(',');
      //   const depart_school_m = Number(columns[0]);
      //   return depart_school_m;
      // });

      const MStoGS = csvData.slice(1).map((columns) => Number(columns[0]));

      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();

      const nextSubwayMinutes = MStoGS.find(
        (subwayTime) => subwayTime >= currentMinutes,
      );

      return nextSubwayMinutes !== undefined
        ? nextSubwayMinutes - currentMinutes
        : null;
    } catch (error) {
      // console.error(`Error reading file ${csvFilePath}:`, error);
      console.error('error in getEverlineTimeGtoM: ', error);
      return null;
    }
  }

  getGStationTimeMtoG(currentTime: Date): number | null {
    // 명지대 -> 기흥
    try {
      const csvData = this.readCsvFile(this.getFilePath('gStation.csv'));
      // const lines = csvData.trim().split('\n');
      // const MJUtoGS = lines.slice(1).map((line) => {
      //   const columns = line.split(',');
      //   const depart_school_m = Number(columns[2]);
      //   return depart_school_m;
      // });

      const MJUtoGS = csvData.slice(1).map((columns) => Number(columns[2]));

      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();
      const nextBusMinutes = MJUtoGS.find(
        (busTime) => busTime >= currentMinutes,
      );

      return nextBusMinutes !== undefined
        ? nextBusMinutes - currentMinutes
        : null;
    } catch (error) {
      // console.error(`Error reading file ${csvFilePath}:`, error);
      console.error('error in getGstationTimeMtoG:', error);
      return null;
    }
  }

  getMStationTimeMtoG(currentTime: Date): number | null {
    // 명지대 -> 기흥
    try {
      const csvData = this.readCsvFile(this.getFilePath('mStation.csv'));
      // const lines = csvData.trim().split('\n');
      // const MJUtoMS = lines.slice(1).map((line) => {
      //   const columns = line.split(',');
      //   const depart_school_m = Number(columns[2]);
      //   return depart_school_m;
      // });

      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();

      const MJUtoMS = csvData.slice(1).map((columns) => Number(columns[2]));

      const nextBusMinutes = MJUtoMS.find(
        (busTime) => busTime >= currentMinutes,
      );

      return nextBusMinutes !== undefined
        ? nextBusMinutes - currentMinutes
        : null;
    } catch (error) {
      // console.error(`Error reading file ${csvFilePath}:`, error);
      console.error('error in getMStationTimeMtoG:', error);
      return null;
    }
  }

  getEverlineTimeMtoG(m: number, currentTime: Date): number | null {
    // 명지대 -> 기흥
    // const csvFilePath = this.getFilePath('everline.csv');
    try {
      const csvData = this.readCsvFile(this.getFilePath('everline.csv'));
      // const lines = csvData.trim().split('\n');
      // const MStoGS = lines.slice(1).map((line) => {
      //   const columns = line.split(',');
      //   const depart_school_m = Number(columns[2]);
      //   return depart_school_m;
      // });

      m += 10;
      const currentMinutes =
        currentTime.getHours() * 60 + currentTime.getMinutes();

      const MStoGS = csvData.slice(1).map((columns) => Number(columns[2]));

      const nextSubwayMinutes = MStoGS.find(
        (subwayTime) => subwayTime >= m + currentMinutes,
      );

      return nextSubwayMinutes !== undefined
        ? nextSubwayMinutes - currentMinutes
        : null;
    } catch (error) {
      // console.error(`Error reading file ${csvFilePath}:`, error);
      console.error('error in getEverlineTimeMtoG:', error);
      return null;
    }
  }
}
