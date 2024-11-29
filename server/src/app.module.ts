import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BusModule } from './bus/bus.module';
import { ShuttleModule } from './shuttle/shuttle.module';
import { TaxiModule } from './taxi/taxi.module';
import { ChatModule } from './chat/chat.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { OnlineUsersModule } from './online-users/online-users.module';
import { TransportController } from './transport/transport.controller';
import { TransportService } from './transport/transport.service';
import { TransportModule } from './transport/transport.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BusModule,
    ShuttleModule,
    TaxiModule,
    ChatModule,
    AuthModule,
    TransportModule,
    OnlineUsersModule,
  ],
  providers: [AuthService, TransportService],
  controllers: [AuthController, TransportController],
})
export class AppModule {}
