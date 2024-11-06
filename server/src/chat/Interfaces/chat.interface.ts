export interface ChatMessage {
  id: string;
  groupId: string;
  userId: string;
  content: string;
  createAt: Date;
}

export interface ChatRoom {
  id: string;
  groupId: string;
  members: string[];
  messages: ChatMessage[];
  createdAt: Date;
  isActive: boolean;
}

export interface SendMessageDto {
  groupId: string;
  userId: string;
  content: string;
}

export interface ChatRoomResponse {
  success: boolean;
  message?: string;
  data?: {
    roomId: string;
    messages: ChatMessage[];
    members: string[];
  };
}
