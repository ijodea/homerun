import { Injectable, Inject } from '@nestjs/common';
import {
  ChatMessage,
  ChatRoom,
  SendMessageDto,
  ChatRoomResponse,
} from './Interfaces/chat.interface';
import { TaxiGroup, GroupMember } from '../taxi/Interfaces/taxi.interface';
import { TaxiService } from '../taxi/taxi.service';
import { ChatGateway } from './chat.gateway';

@Injectable()
export class ChatService {
  private chatRooms: Map<string, ChatRoom> = new Map();
  private readonly MAX_ATTEMPTS = 3;
  private readonly RETRY_DELAY = 1000;

  constructor(
    private readonly taxiService: TaxiService,
    private readonly chatGateway: ChatGateway,
    @Inject('GROUP_STORAGE')
    private readonly groupStorage: {
      activeGroups: Map<string, TaxiGroup>;
      completedGroups: Map<string, TaxiGroup>;
    },
  ) {}

  private generateChatId(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  private async cleanupInactiveRooms() {
    const now = new Date();
    let cleanedCount = 0;

    for (const [roomId, room] of this.chatRooms.entries()) {
      // 24시간 이상 지난 비활성 채팅방 정리
      if (
        !room.isActive ||
        now.getTime() - room.createdAt.getTime() > 24 * 60 * 60 * 1000
      ) {
        this.chatRooms.delete(roomId);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      console.log(
        `[ChatService] Cleaned up ${cleanedCount} inactive chat rooms`,
      );
    }
  }

  async createChatRoom(groupId: string): Promise<ChatRoom | null> {
    try {
      // 이미 존재하는 채팅방 확인
      const existingRoom = Array.from(this.chatRooms.values()).find(
        (room) => room.groupId === groupId && room.isActive,
      );

      if (existingRoom) {
        console.log(
          `[ChatService] Found existing chat room for group ${groupId}`,
        );
        return existingRoom;
      }

      // 직접 그룹 스토리지에서 확인
      const group =
        this.groupStorage.activeGroups.get(groupId) ||
        this.groupStorage.completedGroups.get(groupId);

      if (!group) {
        console.log(`[ChatService] Group ${groupId} not found in storage`);
        return null;
      }

      console.log(`[ChatService] Found group ${groupId} in storage:`, {
        memberCount: group.members.length,
        isFull: group.isFull,
        members: group.members.map((m) => m.userId),
      });

      const newRoom: ChatRoom = {
        id: this.generateChatId(),
        groupId,
        members: group.members.map((m) => m.userId),
        messages: [],
        createdAt: new Date(),
        isActive: true,
      };

      this.chatRooms.set(newRoom.id, newRoom);
      console.log(
        `[ChatService] Created new chat room ${newRoom.id} for group ${groupId}`,
      );

      return newRoom;
    } catch (error) {
      console.error(`[ChatService] Error creating chat room:`, error);
      return null;
    }
  }

  async getChatRoom(groupId: string): Promise<ChatRoomResponse> {
    try {
      console.log(`[ChatService] Getting chat room for groupId: ${groupId}`);

      let room = Array.from(this.chatRooms.values()).find(
        (room) => room.groupId === groupId && room.isActive,
      );

      if (!room) {
        console.log(
          `[ChatService] No active chat room found for groupId: ${groupId}, attempting to create`,
        );
        room = await this.createChatRoom(groupId);

        if (!room) {
          console.error(
            `[ChatService] Failed to create chat room for groupId: ${groupId}`,
          );
          return {
            success: false,
            message: '채팅방을 생성할 수 없습니다.',
          };
        }
      }

      return {
        success: true,
        data: {
          roomId: room.id,
          messages: room.messages,
          members: room.members,
        },
      };
    } catch (error) {
      console.error(
        `[ChatService] Error getting chat room for groupId: ${groupId}:`,
        error,
      );
      return {
        success: false,
        message: '채팅방 조회 중 오류가 발생했습니다.',
      };
    }
  }

  async sendMessage(messageDto: SendMessageDto): Promise<ChatMessage | null> {
    try {
      console.log(
        `[ChatService] Sending message for groupId: ${messageDto.groupId}`,
      );

      const room = Array.from(this.chatRooms.values()).find(
        (room) => room.groupId === messageDto.groupId && room.isActive,
      );

      if (!room) {
        console.error(
          `[ChatService] No active chat room found for message - GroupId: ${messageDto.groupId}`,
        );
        return null;
      }

      if (!room.members.includes(messageDto.userId)) {
        console.error(
          `[ChatService] User ${messageDto.userId} is not a member of group ${messageDto.groupId}`,
        );
        return null;
      }

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

      console.log(
        `[ChatService] Message sent successfully - ID: ${newMessage.id}, User: ${newMessage.userId}`,
      );
      return newMessage;
    } catch (error) {
      console.error(`[ChatService] Error sending message:`, error);
      return null;
    }
  }

  async closeChatRoom(groupId: string): Promise<boolean> {
    try {
      console.log(`[ChatService] Closing chat room for groupId: ${groupId}`);

      const room = Array.from(this.chatRooms.values()).find(
        (room) => room.groupId === groupId && room.isActive,
      );

      if (!room) {
        console.error(
          `[ChatService] No active chat room found to close - GroupId: ${groupId}`,
        );
        return false;
      }

      room.isActive = false;
      console.log(
        `[ChatService] Chat room closed successfully - Room ID: ${room.id}, Group ID: ${groupId}`,
      );
      return true;
    } catch (error) {
      console.error(`[ChatService] Error closing chat room:`, error);
      return false;
    }
  }

  // 채팅방 멤버 업데이트 (필요한 경우 사용)
  async updateRoomMembers(groupId: string): Promise<boolean> {
    try {
      const room = Array.from(this.chatRooms.values()).find(
        (room) => room.groupId === groupId && room.isActive,
      );

      if (!room) {
        return false;
      }

      const groupStatus = await this.taxiService.getGroupStatus(groupId);
      if (groupStatus.success && groupStatus.memberIds) {
        room.members = groupStatus.memberIds;
        return true;
      }

      return false;
    } catch (error) {
      console.error(`[ChatService] Error updating room members:`, error);
      return false;
    }
  }
}
