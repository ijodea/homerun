import { Module } from '@nestjs/common';
import { BusController } from './bus.controller';
import { BusService } from './bus.service';
import { ConfigModule } from '@nestjs/config';
//BusModule은 버스 관련 기능을 제공하는 애플리케이션의 모듈이다.
//이 모듈은 버스 정보 요청을 처리하기 위해 BusController와 비즈니스 로직을 구현하는 BusService를 포함
//환경 변수를 관리하기 위해 ConfigModule을 가져온다.
@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [BusController],
  providers: [BusService],
})
export class BusModule {}
