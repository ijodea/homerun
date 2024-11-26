import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BusModule } from './bus/bus.module';
import { ShuttleModule } from './shuttle/shuttle.module';
// import { ServeStaticModule } from '@nestjs/serve-static';
// import { join } from 'path';
// import { TaxiService } from './taxi/taxi.service';
// import { TaxiController } from './taxi/taxi.controller';
import { TaxiModule } from './taxi/taxi.module';
import { ChatModule } from './chat/chat.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { TransportController } from './transport/transport.controller';
import { TransportService } from './transport/transport.service';
import { TransportModule } from './transport/transport.module';

@Module({
  imports: [
    // ServeStaticModule.forRoot({
    //   rootPath: join(__dirname, '..', 'client/build'),
    // }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    BusModule,
    ShuttleModule,
    TaxiModule,
    ChatModule,
    AuthModule,
    TransportModule,
  ],
  providers: [AuthService, TransportService],
  controllers: [AuthController, TransportController],
  // providers: [TaxiService],
  // controllers: [TaxiController],
})
export class AppModule {}
