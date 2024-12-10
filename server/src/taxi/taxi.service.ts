import { Injectable, Inject } from '@nestjs/common';
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
  private readonly MAX_GROUP_SIZE = 4;
  private readonly GROUP_EXPIRY = 30 * 60 * 1000;

  private groups: {
    group: TaxiGroup;
    priority: number;
  }[] = [];

  constructor(
    private readonly configService: ConfigService,
    @Inject('GROUP_STORAGE')
    private readonly groupStorage: {
      activeGroups: Map<string, TaxiGroup>;
      completedGroups: Map<string, TaxiGroup>;
    },
  ) {
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

    // 주기적으로 오래된 그룹 정리 및 우선순위 업데이트
    // setInterval(() => this.cleanupIncompleteGroups(), 5 * 60 * 1000);
    setInterval(() => this.cleanupIncompleteGroups(), 5 * 60 * 1000);
  }

  private cleanupIncompleteGroups() {
    const now = Date.now();
    const groupsToRemove: string[] = [];

    for (const group of this.groupStorage.activeGroups.values()) {
      const groupAge = now - group.createdAt.getTime();
      if (!group.isFull && groupAge > this.GROUP_EXPIRY) {
        groupsToRemove.push(group.id);
      }
    }

    groupsToRemove.forEach((groupId) => {
      // console.log(`Cleaning up incomplete group: ${groupId}`);
      this.groupStorage.activeGroups.delete(groupId);
    });
  }

  private findMatchableGroup(destination: 'mju' | 'gh'): TaxiGroup | null {
    let bestGroup: TaxiGroup | null = null;
    let mostRecent = 0;

    for (const group of this.groupStorage.activeGroups.values()) {
      if (
        group.destination === destination &&
        !group.isFull &&
        group.members.length < this.MAX_GROUP_SIZE &&
        group.status === 'waiting'
      ) {
        const groupTime = group.createdAt.getTime();
        if (groupTime > mostRecent) {
          mostRecent = groupTime;
          bestGroup = group;
        }
      }
    }

    return bestGroup;
  }

  private generateSessionId(userId: string): string {
    return `${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  private findUserActiveGroup(userId: string): TaxiGroup | null {
    for (const group of this.groupStorage.activeGroups.values()) {
      if (group.members.some((member) => member.userId === userId)) {
        return group;
      }
    }
    return null;
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

  private findBestAvailableGroup(
    destination: 'mju' | 'gh',
    userId: string,
  ): TaxiGroup | null {
    let bestGroup: TaxiGroup | null = null;
    let mostRecent = 0;

    for (const group of this.groupStorage.activeGroups.values()) {
      // 이미 해당 유저가 있는 그룹은 건너뛰기
      if (group.members.some((member) => member.userId === userId)) {
        continue;
      }

      if (
        group.destination === destination &&
        !group.isFull &&
        group.members.length < this.MAX_GROUP_SIZE &&
        group.status === 'waiting'
      ) {
        const groupTime = group.createdAt.getTime();
        if (groupTime > mostRecent) {
          mostRecent = groupTime;
          bestGroup = group;
        }
      }
    }

    return bestGroup;
  }

  // 우선순위 큐에 그룹 enqueue
  private enqueueGroup(group: TaxiGroup): void {
    const priority = this.calculatePriority(group);
    const queueElement = { group, priority };

    const index = this.groups.findIndex((item) => item.priority > priority);
    if (index === -1) {
      this.groups.push(queueElement);
    } else {
      this.groups.splice(index, 0, queueElement);
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
    const group =
      this.groupStorage.activeGroups.get(groupId) ||
      this.groupStorage.completedGroups.get(groupId);

    if (!group) {
      console.warn(`Group not found: ${groupId}`);
      return {
        success: false,
        message: '그룹을 찾을 수 없습니다.',
      };
    }

    console.log(`Found group ${groupId}:`, {
      memberCount: group.members.length,
      isFull: group.isFull,
      createdAt: group.createdAt,
      age: Date.now() - group.createdAt.getTime(),
      members: group.members.map((m) => `${m.userId}(${m.sessionId})`),
      isCompleted: this.groupStorage.completedGroups.has(groupId),
    });

    return {
      success: true,
      groupId: group.id,
      memberCount: group.members.length,
      memberIds: group.members.map((member) => member.userId),
      isFull: group.isFull,
      destination: group.destination,
    };
  }

  private async moveToCompletedGroups(group: TaxiGroup) {
    this.groupStorage.activeGroups.delete(group.id);
    const completedGroup: TaxiGroup = {
      ...group,
      completedAt: new Date(),
      status: 'completed',
      isActive: false,
    };
    this.groupStorage.completedGroups.set(group.id, completedGroup);
    console.log(
      `Moved group ${group.id} to completed groups. Members: ${group.members
        .map((m) => m.userId)
        .join(', ')}`,
    );
    return completedGroup;
  }

  private generateGroupId(): string {
    // 랜덤 4자리 숫자 생성
    return Math.floor(1000 + Math.random() * 9000).toString();
  }

  private findAvailableGroup(destination: 'mju' | 'gh'): TaxiGroup | null {
    const availableGroup = this.groups.find(
      (item) =>
        item.group.destination === destination &&
        !item.group.isFull &&
        item.group.members.length < this.MAX_GROUP_SIZE &&
        item.group.status === 'waiting',
    );

    return availableGroup ? availableGroup.group : null;
  }

  private createNewGroup(
    destination: 'mju' | 'gh',
    userId: string,
    sessionId: string,
  ): TaxiGroup {
    const groupId = Math.floor(1000 + Math.random() * 9000).toString();
    const newGroup: TaxiGroup = {
      id: groupId,
      destination,
      members: [
        {
          userId,
          sessionId,
          joinedAt: new Date(),
        },
      ],
      createdAt: new Date(),
      isFull: false,
      isActive: true,
      status: 'waiting',
    };

    this.groupStorage.activeGroups.set(groupId, newGroup);
    return newGroup;
  }

  // private cleanupOldGroups() {
  //   const now = Date.now();
  //   const groupsToRemove: string[] = [];

  //   for (const [groupId, group] of this.activeGroups.entries()) {
  //     // Only cleanup groups that are either:
  //     // 1. Older than GROUP_TIMEOUT
  //     // 2. Full and completed (you might want to add a completedAt field)
  //     const groupAge = now - group.createdAt.getTime();

  //     if (groupAge > this.GROUP_TIMEOUT && !group.isFull) {
  //       groupsToRemove.push(groupId);
  //     }
  //   }

  //   // Remove groups and update priorities
  //   groupsToRemove.forEach((groupId) => {
  //     this.activeGroups.delete(groupId);
  //     const index = this.groups.findIndex((item) => item.group.id === groupId);
  //     if (index !== -1) {
  //       this.groups.splice(index, 1);
  //     }
  //   });

  //   if (groupsToRemove.length > 0) {
  //     console.log(`Cleaned up ${groupsToRemove.length} inactive groups`);
  //   }
  // }

  async processLocation(
    locationData: LocationData,
  ): Promise<LocationUpdateResponse> {
    console.log('받은 위치 정보:', locationData);

    // 각 요청마다 고유한 세션 ID 생성
    const sessionId = this.generateSessionId(locationData.userId);

    // 사용자가 이미 활성 그룹에 참여하고 있는지 확인
    const existingGroup = this.findUserActiveGroup(locationData.userId);
    if (existingGroup) {
      console.log(`User ${locationData.userId} is already in group ${existingGroup.id}`);
      return {
        success: true,
        message: '이미 그룹에 참여하고 있습니다.',
        data: {
          ...locationData,
          isValidLocation: true,
          group: {
            groupId: existingGroup.id,
            memberCount: existingGroup.members.length,
            isFull: existingGroup.isFull,
            status: existingGroup.status,
          },
        },
      };
    }

    // 매칭 가능한 그룹 찾기
    let group = this.findMatchableGroup(locationData.to);

    if (!group) {
      // 새로운 그룹 생성
      group = this.createNewGroup(locationData.to, locationData.userId, sessionId);
      // 그룹을 우선순위 큐에 추가
      this.enqueueGroup(group);
      console.log(`Created new group ${group.id} for user ${locationData.userId} (Session: ${sessionId})`);
    } else {
      // 그룹에 사용자 추가 전에 중복 여부 확인
      const userAlreadyInGroup = group.members.some(member => member.userId === locationData.userId);
      if (!userAlreadyInGroup) {
        group.members.push({
          userId: locationData.userId,
          sessionId,
          joinedAt: new Date(),
        });
        console.log(`Added user ${locationData.userId} (Session: ${sessionId}) to existing group ${group.id}`);
      } else {
        console.log(`User ${locationData.userId} is already a member of group ${group.id}`);
        return {
          success: true,
          message: '이미 그룹에 참여하고 있습니다.',
          data: {
            ...locationData,
            isValidLocation: true,
            group: {
              groupId: group.id,
              memberCount: group.members.length,
              isFull: group.isFull,
              status: group.status,
            },
          },
        };
      }

      // 그룹이 가득 찼는지 확인
      if (group.members.length >= this.MAX_GROUP_SIZE) {
        group.isFull = true;
        group.status = 'matched';
        // 활성 그룹에서 제거하고 완료된 그룹으로 이동
        await this.moveToCompletedGroups(group);
        console.log(`Moved group ${group.id} to completed groups. Members: ${group.members.map(m => m.userId).join(', ')}`);
      }
    }

    return {
      success: true,
      message: `${locationData.to === 'mju' ? '기흥역 → 명지대' : '명지대 → 기흥역'} | 그룹 번호: ${group.id} (${group.members.length}/${this.MAX_GROUP_SIZE}명)`,
      data: {
        ...locationData,
        isValidLocation: true,
        group: {
          groupId: group.id,
          memberCount: group.members.length,
          isFull: group.isFull,
          status: group.status,
        },
      },
    };
  }
}
