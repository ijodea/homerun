import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [AuthService],
  exports: [HttpModule], // HttpModule을 export 추가
})
export class AuthModule {}
