import { Injectable } from '@nestjs/common';
import {
  ChatMessage,
  ChatRoom,
  SendMessageDto,
  ChatRoomResponse,
} from './Interfaces/chat.interface';
import { TaxiService } from '../taxi/taxi.service';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  private chatRooms: Map<string, ChatRoom> = new Map();

  constructor(
    private readonly taxiService: TaxiService,
    private readonly chatGateway: ChatGateway,
  ) {}

  private generateChatId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async createChatRoom(groupId: string): Promise<ChatRoom | null> {
    const groupStatus = await this.taxiService.getGroupStatus(groupId);
    if (!groupStatus.success || !groupStatus.memberIds) return null;

    const existingRoom = Array.from(this.chatRooms.values()).find(
      (room) => room.groupId === groupId && room.isActive,
    );
    if (existingRoom) return existingRoom;

    const newRoom: ChatRoom = {
      id: this.generateChatId(),
      groupId,
      members: groupStatus.memberIds || [],
      messages: [],
      createdAt: new Date(),
      isActive: true,
    };

    this.chatRooms.set(newRoom.id, newRoom);
    return newRoom;
  }

  async getChatRoom(groupId: string): Promise<ChatRoomResponse> {
    const room = Array.from(this.chatRooms.values()).find(
      (room) => room.groupId === groupId && room.isActive,
    );

    if (!room) {
      return {
        success: false,
        message: '채팅방을 찾을 수 없습니다',
      };
    }

    return {
      success: true,
      data: {
        roomId: room.id,
        messages: room.messages,
        members: room.members,
      },
    };
  }

  async sendMessage(messageDto: SendMessageDto): Promise<ChatMessage | null> {
    const room = Array.from(this.chatRooms.values()).find(
      (room) => room.groupId === messageDto.groupId && room.isActive,
    );

    if (!room || !room.members.includes(messageDto.userId)) return null;

    const newMessage: ChatMessage = {
      id: this.generateChatId(),
      groupId: messageDto.groupId,
      userId: messageDto.userId,
      content: messageDto.content,
      createAt: new Date(),
    };

    room.messages.push(newMessage);
    // 메시지를 클라이언트에게 브로드캐스트
    this.chatGateway.broadcastMessage(newMessage);
    return newMessage;
  }

  async closeChatRoom(groupId: string): Promise<boolean> {
    const room = Array.from(this.chatRooms.values()).find(
      (room) => room.groupId === groupId && room.isActive,
    );

    if (!room) return false;

    room.isActive = false;
    return true;
  }
}
