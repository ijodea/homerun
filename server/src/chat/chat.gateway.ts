import {
  WebSocketGateway,
  WebSocketServer,
  // ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatMessage } from './Interfaces/chat.interface';

@WebSocketGateway({ cors: true })
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const groupId = client.handshake.query.groupId as string;
    if (groupId) {
      client.join(groupId);
    }
  }

  handleDisconnect(client: Socket) {
    const groupId = client.handshake.query.groupId as string;
    if (groupId) {
      client.leave(groupId);
    }
  }

  broadcastMessage(message: ChatMessage) {
    this.server.to(message.groupId).emit('receiveMessage', message);
  }
}
