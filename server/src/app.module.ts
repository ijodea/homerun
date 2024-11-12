import { Module } from '@nestjs/common';
//import { AppController } from './app.controller';
//import { AppService } from './app.service';
import { ConfigModule ,ConfigService} from '@nestjs/config';
import { BusModule } from './bus/bus.module';
import { ShuttleModule } from './shuttle/shuttle.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TaxiService } from './taxi/taxi.service';
import { TaxiController } from './taxi/taxi.controller';
import { TaxiModule } from './taxi/taxi.module';
import {JwtModule} from '@nestjs/jwt';
import {JwtStrategy} from './auth/jwt.strategy';
import {JwtAuthGuard} from './auth/jwt-auth.guard';
import {TypeOrmModule} from '@nestjs/typeorm';
import {User} from './users/user.entity';
import { UsersModule } from './users/user.module';
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client/build'),
    }),

    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService)=>({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {expiresIn: '1h'}, //토큰 만료 시간 설정
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DATABASE_HOST'),
        port: configService.get<number>('DATABASE_PORT'),
        username: configService.get<string>('DATABASE_USER'),
        password: configService.get<string>('DATABASE_PASSWORD'),
        database: configService.get<string>('DATABASE_NAME'), //.env 파일에서 지금은 테스트때문에 postgres데이터베이스에 저장하고 있음. 그러나 실제로는 .env파일에다가 DATABASE_NAME=homerun해줘야함.
        entities: [User], // User 엔티티 추가
        synchronize: true, // 개발 중에는 true, 배포 시에는 false로 변경 권장
      }),
    }),
    TypeOrmModule.forFeature([User]), // User 엔티티 모듈 추가
    BusModule,
    ShuttleModule,
    TaxiModule,
    UsersModule,
  ],
  providers: [TaxiService,JwtAuthGuard,JwtStrategy],
  controllers: [TaxiController],
})
export class AppModule {}
