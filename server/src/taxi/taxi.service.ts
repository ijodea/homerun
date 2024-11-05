import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface LocationData {
  latitude: number;
  longitude: number;
  to: string;
  userId: string;
}

interface GroupMember {
  userId: string;
  joinedAt: Date;
}

interface TaxiGroup {
  id: string;
  destination: string;
  members: GroupMember[];
  createdAt: Date;
  isFull: boolean;
}

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
  private activeGroups: Map<string, TaxiGroup> = new Map(); // 현재 활성화된 그룹들
  private readonly MAX_GROUP_SIZE = 4;

  constructor(private readonly configService: ConfigService) {
    const mjuBounds = this.configService.get<string>('MJU_BOUNDS');
    const mjuCoords = mjuBounds
      .split(',')
      .map((coord) => parseFloat(coord.trim()));
    this.mjuGPS = {
      sw: { lat: mjuCoords[0], lng: mjuCoords[1] },
      ne: { lat: mjuCoords[2], lng: mjuCoords[3] },
    };

    const ghBounds = this.configService.get<string>('GH_BOUNDS');
    const ghCoords = ghBounds
      .split(',')
      .map((coord) => parseFloat(coord.trim()));
    this.ghGPS = {
      sw: { lat: ghCoords[0], lng: ghCoords[2] },
      ne: { lat: ghCoords[1], lng: ghCoords[3] },
    };

    // 주기적으로 오래된 그룹 정리 (30분마다)
    setInterval(() => this.cleanupOldGroups(), 30 * 60 * 1000);
  }

  private isLocationInBounds(
    lat: number,
    lng: number,
    bounds: {
      sw: { lat: number; lng: number };
      ne: { lat: number; lng: number };
    },
  ): boolean {
    const isLatInRange =
      lat >= Math.min(bounds.sw.lat, bounds.ne.lat) &&
      lat <= Math.max(bounds.sw.lat, bounds.ne.lat);

    const isLngInRange =
      lng >= Math.min(bounds.sw.lng, bounds.ne.lng) &&
      lng <= Math.max(bounds.sw.lng, bounds.ne.lng);

    // return isLatInRange && isLngInRange;
    return true; //테스트용으로 항상 true
  }

  async getGroupStatus(groupId: string) {
    const group = this.activeGroups.get(groupId);
    if (!group) {
      return {
        success: false,
        message: '그룹을 찾을 수 없습니다.',
      };
    }

    return {
      success: true,
      groupId: group.id,
      memberCount: group.members.length,
      isFull: group.isFull,
      destination: group.destination,
    };
  }

  private generateGroupId(): string {
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private findAvailableGroup(destination: string): TaxiGroup | null {
    for (const group of this.activeGroups.values()) {
      if (
        group.destination === destination &&
        !group.isFull &&
        group.members.length < this.MAX_GROUP_SIZE
      ) {
        return group;
      }
    }
    return null;
  }

  private createNewGroup(destination: string, userId: string): TaxiGroup {
    const groupId = this.generateGroupId();
    const newGroup: TaxiGroup = {
      id: groupId,
      destination,
      members: [{ userId, joinedAt: new Date() }],
      createdAt: new Date(),
      isFull: false,
    };
    this.activeGroups.set(groupId, newGroup);
    return newGroup;
  }

  private cleanupOldGroups() {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    for (const [groupId, group] of this.activeGroups.entries()) {
      if (group.createdAt < thirtyMinutesAgo) {
        this.activeGroups.delete(groupId);
      }
    }
  }

  async processLocation(locationData: LocationData) {
    console.log('받은 위치 정보:', locationData);

    let isInValidLocation = false;
    let message = '';

    // 위치 검증
    if (locationData.to.toLowerCase() === 'mju') {
      isInValidLocation = this.isLocationInBounds(
        locationData.latitude,
        locationData.longitude,
        this.ghGPS,
      );
      message = isInValidLocation
        ? '기흥역 택시구역입니다'
        : '기흥역 택시구역에 있지 않습니다';
    } else if (locationData.to.toLowerCase() === 'gh') {
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

    // 위치가 유효한 경우에만 그룹 매칭 진행
    let groupInfo = null;
    if (isInValidLocation) {
      let group = this.findAvailableGroup(locationData.to);
      if (!group) {
        group = this.createNewGroup(locationData.to, locationData.userId);
      } else {
        group.members.push({
          userId: locationData.userId,
          joinedAt: new Date(),
        });
        if (group.members.length >= this.MAX_GROUP_SIZE) {
          group.isFull = true;
        }
      }
      groupInfo = {
        groupId: group.id,
        memberCount: group.members.length,
        isFull: group.isFull,
      };
      message += ` | 그룹 번호: ${group.id} (${group.members.length}/4명)`;
    }

    const result = {
      success: isInValidLocation,
      message,
      data: {
        ...locationData,
        isValidLocation: isInValidLocation,
        group: groupInfo,
      },
    };

    console.log('=== 위치 판별 및 그룹 매칭 결과 ===');
    console.log(JSON.stringify(result, null, 2));
    console.log('================================\n');

    return result;
  }
}
