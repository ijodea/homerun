import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller'; // AuthController 임포트 추가
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AuthService],
  controllers: [AuthController], // AuthController 추가
  exports: [HttpModule],
})
export class AuthModule {}
