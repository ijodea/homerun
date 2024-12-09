export interface LocationData {
  latitude?: number;
  longitude?: number;
  to: 'mju' | 'gh';
  userId: string;
}

export interface GroupMember {
  userId: string;
  sessionId: string;
  joinedAt: Date;
}

export interface TaxiGroup {
  id: string;
  destination: 'mju' | 'gh';
  members: GroupMember[];
  createdAt: Date;
  completedAt?: Date;
  isFull: boolean;
  isActive: boolean;
  status: 'waiting' | 'matched' | 'completed' | 'cancelled';
}

export interface GPSBounds {
  sw: { lat: number; lng: number };
  ne: { lat: number; lng: number };
}

export interface GroupStatus {
  success: boolean;
  groupId?: string;
  memberCount?: number;
  memberIds?: string[];
  isFull?: boolean;
  destination?: 'mju' | 'gh';
  status?: TaxiGroup['status'];
  message?: string;
}

export interface LocationUpdateResponse {
  success: boolean;
  message: string;
  data: {
    latitude?: number;
    longitude?: number;
    to: 'mju' | 'gh';
    userId: string;
    isValidLocation: boolean;
    group?: {
      groupId: string;
      memberCount: number;
      isFull: boolean;
      status: TaxiGroup['status'];
    };
  };
}

export interface GroupStorage {
  activeGroups: Map<string, TaxiGroup>;
  completedGroups: Map<string, TaxiGroup>;
}

export type GroupEvent =
  | { type: 'GROUP_CREATED'; group: TaxiGroup }
  | { type: 'GROUP_UPDATED'; group: TaxiGroup }
  | { type: 'GROUP_COMPLETED'; group: TaxiGroup }
  | { type: 'GROUP_CANCELLED'; groupId: string };
