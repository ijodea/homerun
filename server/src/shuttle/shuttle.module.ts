import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ShuttleController } from './shuttle.controller';
import { ShuttleService } from './shuttle.service';

@Module({
  imports: [HttpModule],
  controllers: [ShuttleController],
  providers: [ShuttleService],
})
export class ShuttleModule {}
