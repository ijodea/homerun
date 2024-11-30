import { Module } from '@nestjs/common';
import { OnlineUsersGateway } from './online-users.gateway';

@Module({
  providers: [OnlineUsersGateway],
  exports: [OnlineUsersGateway],
})
export class OnlineUsersModule {}
