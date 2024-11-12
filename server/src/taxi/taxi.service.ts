import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  LocationData,
  TaxiGroup,
  GPSBounds,
  GroupStatus,
  LocationUpdateResponse,
} from './interfaces/taxi.interface';

@Injectable()
export class TaxiService {
  private readonly mjuGPS: GPSBounds;
  private readonly ghGPS: GPSBounds;
  private activeGroups: Map<string, TaxiGroup> = new Map();
  private readonly MAX_GROUP_SIZE = 4;

  private groups: {
    group: TaxiGroup;
    priority: number;
  }[] = [];

  constructor(private readonly configService: ConfigService) {
    // 기존 GPS 설정 코드는 동일하게 유지
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

    // 주기적으로 오래된 그룹 정리 (5분마다)
    setInterval(() => this.cleanupOldGroups(), 5 * 60 * 1000);
    // 주기적으로 우선순위 업데이트 하기
    setInterval(() => this.updatePriorities(), 60 * 1000);
  }

  // 가중치를 줘서 (기다린 시간 7, 멤버 수 3) 우선순위 큐 우선순위 적용
  private calculatePriority(group: TaxiGroup): number {
    const waitingTimeWeight = 0.7;
    const memberCountWeight = 0.3;
    const waitingTime = (Date.now() - group.createdAt.getTime()) / (1000 * 60);

    const normalizedWaitingScore = Math.min(waitingTime, 30) / 30;
    const normalizedMemberScore = group.members.length / this.MAX_GROUP_SIZE;

    return -(
      normalizedWaitingScore * waitingTimeWeight +
      normalizedMemberScore * memberCountWeight
    );
  }

  // 우선순위 큐에 그룹 enqueue
  private enqueueGroup(group: TaxiGroup): void {
    const priority = this.calculatePriority(group);
    const queueElement = { group, priority };

    let added = false;
    for (let i = 0; i < this.groups.length; i++) {
      if (priority < this.groups[i].priority) {
        this.groups.splice(i, 0, queueElement);
        added = true;
        break;
      }
    }

    if (!added) {
      this.groups.push(queueElement);
    }
  }

  // 우선순위 업데이트
  private updatePriorities(): void {
    this.groups.forEach((item) => {
      item.priority = this.calculatePriority(item.group);
    });

    this.groups.sort((a, b) => a.priority - b.priority);
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

  async getGroupStatus(groupId: string): Promise<GroupStatus> {
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
      memberIds: group.members.map((member) => member.userId),
      isFull: group.isFull,
      destination: group.destination,
    };
  }

  private generateGroupId(): string {
    // 랜덤 4자리 숫자 생성
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private findAvailableGroup(destination: string): TaxiGroup | null {
    const availableGroup = this.groups.find(
      (item) =>
        item.group.destination === destination &&
        !item.group.isFull &&
        item.group.members.length < this.MAX_GROUP_SIZE,
    );

    return availableGroup ? availableGroup.group : null;
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
    this.enqueueGroup(newGroup);
    return newGroup;
  }

  private cleanupOldGroups() {
    const fiveMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    for (const [groupId, group] of this.activeGroups.entries()) {
      if (group.createdAt < fiveMinutesAgo) {
        this.activeGroups.delete(groupId);
        const index = this.groups.findIndex(
          (item) => item.group.id === groupId,
        );
        if (index !== -1) {
          this.groups.splice(index, 1);
        }
      }
    }
  }

  async processLocation(
    locationData: LocationData,
  ): Promise<LocationUpdateResponse> {
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

    // console.log('=== 위치 판별 및 그룹 매칭 결과 ===');
    // console.log(JSON.stringify(result, null, 2));
    // console.log('================================\n');

    return result;
  }
}
