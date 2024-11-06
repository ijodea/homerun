export interface LocationData {
  latitude: number;
  longitude: number;
  to: string;
  userId: string;
}

export interface GroupMember {
  userId: string;
  joinedAt: Date;
}

export interface TaxiGroup {
  id: string;
  destination: string;
  members: GroupMember[];
  createdAt: Date;
  isFull: boolean;
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
  destination?: string;
  message?: string;
}

export interface LocationUpdateResponse {
  success: boolean;
  message: string;
  data: {
    latitude: number;
    longitude: number;
    to: string;
    userId: string;
    isValidLocation: boolean;
    group?: {
      groupId: string;
      memberCount: number;
      isFull: boolean;
    };
  };
}
