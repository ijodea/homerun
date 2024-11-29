import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class OnlineUsersGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  // 방향별 접속자 수를 저장하는 Map
  private onlineUsers = new Map<string, Set<string>>();

  constructor() {
    this.onlineUsers.set('mju', new Set()); // 기흥->명지 방향
    this.onlineUsers.set('gh', new Set()); // 명지->기흥 방향
  }

  handleConnection(client: Socket) {
    const direction = client.handshake.query.direction as string;
    const userId = client.handshake.query.userId as string;

    if (direction && userId) {
      this.onlineUsers.get(direction)?.add(userId);
      this.broadcastOnlineCount();
    }
  }

  handleDisconnect(client: Socket) {
    const direction = client.handshake.query.direction as string;
    const userId = client.handshake.query.userId as string;

    if (direction && userId) {
      this.onlineUsers.get(direction)?.delete(userId);
      this.broadcastOnlineCount();
    }
  }

  private broadcastOnlineCount() {
    const counts = {
      mju: this.onlineUsers.get('mju')?.size || 0,
      gh: this.onlineUsers.get('gh')?.size || 0,
    };

    this.server.emit('onlineUsers', counts);
  }

  // 특정 방향의 현재 접속자 수를 반환하는 메서드
  getOnlineCount(direction: string): number {
    return this.onlineUsers.get(direction)?.size || 0;
  }
}
