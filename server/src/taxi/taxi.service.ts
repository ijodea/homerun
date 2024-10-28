import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TaxiService {
  private readonly mjuGPS: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  };
  private readonly ghGPS: {
    sw: { lat: number; lng: number };
    ne: { lat: number; lng: number };
  };

  constructor(private readonly configService: ConfigService) {
    // MJU_BOUNDS 파싱
    const mjuBounds = this.configService.get<string>('MJU_BOUNDS');
    const mjuCoords = mjuBounds
      .split(',')
      .map((coord) => parseFloat(coord.trim()));
    this.mjuGPS = {
      sw: { lat: mjuCoords[0], lng: mjuCoords[1] },
      ne: { lat: mjuCoords[2], lng: mjuCoords[3] },
    };

    // GH_BOUNDS 파싱
    const ghBounds = this.configService.get<string>('GH_BOUNDS');
    const ghCoords = ghBounds
      .split(',')
      .map((coord) => parseFloat(coord.trim()));
    this.ghGPS = {
      sw: { lat: ghCoords[0], lng: ghCoords[2] },
      ne: { lat: ghCoords[1], lng: ghCoords[3] },
    };

    // 초기 설정값 로깅
    console.log('=== GPS 경계값 설정 ===');
    console.log('MJU 경계값:', this.mjuGPS);
    console.log('GH 경계값:', this.ghGPS);
    console.log('=====================');
  }

  private isLocationInBounds(
    lat: number,
    lng: number,
    bounds: {
      sw: { lat: number; lng: number };
      ne: { lat: number; lng: number };
    },
  ): boolean {
    // 위도 체크 (남서-북동)
    const isLatInRange =
      lat >= Math.min(bounds.sw.lat, bounds.ne.lat) &&
      lat <= Math.max(bounds.sw.lat, bounds.ne.lat);

    // 경도 체크 (남서-북동)
    const isLngInRange =
      lng >= Math.min(bounds.sw.lng, bounds.ne.lng) &&
      lng <= Math.max(bounds.sw.lng, bounds.ne.lng);

    // 경계 체크 로깅
    console.log('체크 중인 위치:', { lat, lng });
    console.log('경계값:', bounds);
    console.log('위도 범위 체크:', isLatInRange);
    console.log('경도 범위 체크:', isLngInRange);

    return isLatInRange && isLngInRange;
  }

  async processLocation(locationData: {
    latitude: number;
    longitude: number;
    to: string;
  }) {
    console.log('받은 위치 정보:', locationData);

    let isInValidLocation = false;
    let message = '';

    // to 값에 따라 체크할 영역 결정
    if (locationData.to.toLowerCase() === 'mju') {
      console.log('목적지: 명지대, 현재 위치가 기흥역 구역인지 체크');
      // MJU로 가려면 현재 GH에 있어야 함
      isInValidLocation = this.isLocationInBounds(
        locationData.latitude,
        locationData.longitude,
        this.ghGPS,
      );
      message = isInValidLocation
        ? '기흥역 택시구역입니다'
        : '기흥역 택시구역에 있지 않습니다';
    } else if (locationData.to.toLowerCase() === 'gh') {
      // GH로 가려면 현재 MJU에 있어야 함
      isInValidLocation = this.isLocationInBounds(
        locationData.latitude,
        locationData.longitude,
        this.mjuGPS,
      );
      message = isInValidLocation
        ? '명지대 택시구역입니다'
        : '명지대 택시구역에 있지 않습니다';
    } else {
      message = '목적지가 올바르지 않습니다. (mju 또는 gh만 가능)';
      isInValidLocation = false;
    }

    const result = {
      success: isInValidLocation,
      message,
      data: {
        ...locationData,
        isValidLocation: isInValidLocation,
      },
    };

    console.log('=== 위치 판별 결과 ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('=====================\n');

    return result;
  }
}
