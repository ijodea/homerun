import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto, ChatRoomResponse } from './Interfaces/chat.interface';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('room/:groupId')
  async createRoom(
    @Param('groupId') groupId: string,
  ): Promise<ChatRoomResponse> {
    // console.log(`[ChatController] createRoom - groupId: ${groupId}`);
    const room = await this.chatService.createChatRoom(groupId);
    if (!room) {
      console.error(
        `[ChatController] createRoom - Failed to create chat room for groupId: ${groupId}`,
      );
      return {
        success: false,
        message: '채팅방 생성에 실패했습니다',
      };
    }
    // console.log(
    //   `[ChatController] createRoom - Chat room created with id: ${room.id}`,
    // );
    return {
      success: true,
      data: {
        roomId: room.id,
        messages: room.messages,
        members: room.members,
      },
    };
  }

  @Get('room/:groupId')
  async getRoom(@Param('groupId') groupId: string): Promise<ChatRoomResponse> {
    console.log(`[ChatController] getRoom - groupId: ${groupId}`);
    return this.chatService.getChatRoom(groupId);
  }

  @Post('message')
  async sendMessage(@Body() messageDto: SendMessageDto) {
    const message = await this.chatService.sendMessage(messageDto);
    return {
      success: !!message,
      data: message,
      message: message ? '메시지 전송 완료' : '메시지 전송 실패',
    };
  }

  @Post('room/:groupId/close')
  async closeRoom(@Param('groupId') groupId: string) {
    const success = await this.chatService.closeChatRoom(groupId);
    return {
      success,
      message: success
        ? '채팅방이 종료되었습니다'
        : '채팅방 종료에 실패했습니다',
    };
  }
}
